#define _WIN32_WINNT 0x0A00
#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <shellapi.h>
#include <shlobj.h>
#include <commdlg.h>
#include <string>
#include <vector>
#include <tlhelp32.h>
#include <iostream>
#include <chrono>
#include <fstream>
#include <wincrypt.h>
#include <thread>
#include <sstream>
#include <iomanip>
#include "httplib.h"
#include "manifest.h"
#include "browser/browser_server.h"

#pragma comment(lib, "crypt32.lib")
#pragma comment(lib, "ws2_32.lib")

using namespace std;

string g_logFilePath = "";

void WriteLog(const string& message) {
    if (g_logFilePath.empty()) return;
    ofstream logFile(g_logFilePath, ios::app);
    if (!logFile.is_open()) {
        // the log directory may not exist yet (fresh machine): create the full
        // path recursively and retry once - log lines must never be lost
        string dir = g_logFilePath;
        size_t p = dir.find_last_of("\\/");
        if (p != string::npos) {
            SHCreateDirectoryExA(NULL, dir.substr(0, p).c_str(), NULL);
            logFile.open(g_logFilePath, ios::app);
        }
    }
    if (logFile.is_open()) {
        auto now = chrono::system_clock::now();
        time_t now_c = chrono::system_clock::to_time_t(now);
        struct tm parts;
#ifdef _MSC_VER
        localtime_s(&parts, &now_c);
#else
        struct tm* pparts = localtime(&now_c);
        if (pparts) parts = *pparts;
#endif
        char timeStr[64];
        strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", &parts);
        logFile << "[" << timeStr << "] " << message << "\n";
        logFile.close();
    }
}

string ComputeHash(const string& input) {
    HCRYPTPROV hProv;
    HCRYPTHASH hHash;
    string result = "";
    if (CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        if (CryptCreateHash(hProv, CALG_SHA1, 0, 0, &hHash)) {
            if (CryptHashData(hHash, (const BYTE*)input.data(), input.size(), 0)) {
                DWORD hashLen;
                DWORD hashLenSize = sizeof(DWORD);
                if (CryptGetHashParam(hHash, HP_HASHSIZE, (BYTE*)&hashLen, &hashLenSize, 0)) {
                    vector<BYTE> hash(hashLen);
                    if (CryptGetHashParam(hHash, HP_HASHVAL, hash.data(), &hashLen, 0)) {
                        char buf[3];
                        for (DWORD i = 0; i < hashLen; i++) {
                            sprintf(buf, "%02x", hash[i]);
                            result += buf;
                        }
                    }
                }
            }
            CryptDestroyHash(hHash);
        }
        CryptReleaseContext(hProv, 0);
    }
    return result;
}

string ComputeSHA256(const string& input) {
    HCRYPTPROV hProv;
    HCRYPTHASH hHash;
    string result = "";
    if (CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        if (CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) {
            if (CryptHashData(hHash, (const BYTE*)input.data(), input.size(), 0)) {
                DWORD hashLen;
                DWORD hashLenSize = sizeof(DWORD);
                if (CryptGetHashParam(hHash, HP_HASHSIZE, (BYTE*)&hashLen, &hashLenSize, 0)) {
                    vector<BYTE> hash(hashLen);
                    if (CryptGetHashParam(hHash, HP_HASHVAL, hash.data(), &hashLen, 0)) {
                        char buf[3];
                        for (DWORD i = 0; i < hashLen; i++) {
                            sprintf(buf, "%02x", hash[i]);
                            result += buf;
                        }
                    }
                }
            }
            CryptDestroyHash(hHash);
        }
        CryptReleaseContext(hProv, 0);
    }
    return result;
}

bool DecryptDataAES(const string& inputFile, const string& outputFile) {
    const BYTE aesKey[32] = {
        0x2B, 0x7E, 0x15, 0x16, 0x28, 0xAE, 0xD2, 0xA6,
        0xAB, 0xF7, 0x15, 0x88, 0x09, 0xCF, 0x4F, 0x3C,
        0x76, 0x2E, 0x71, 0x60, 0xF3, 0x8B, 0x4D, 0xA5,
        0x6A, 0x78, 0x4D, 0x90, 0x45, 0x19, 0x0C, 0xFE
    };

    ifstream in(inputFile, ios::binary);
    if (!in.is_open()) return false;

    ofstream out(outputFile, ios::binary);
    if (!out.is_open()) return false;

    BYTE iv[16];
    in.read((char*)iv, 16);
    if (in.gcount() != 16) return false;

    HCRYPTPROV hProv;
    if (!CryptAcquireContext(&hProv, NULL, MS_ENH_RSA_AES_PROV, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        return false;
    }

    struct KeyBlob {
        BLOBHEADER hdr;
        DWORD keySize;
        BYTE keyData[32];
    } blob;

    blob.hdr.bType = PLAINTEXTKEYBLOB;
    blob.hdr.bVersion = CUR_BLOB_VERSION;
    blob.hdr.reserved = 0;
    blob.hdr.aiKeyAlg = CALG_AES_256;
    blob.keySize = 32;
    memcpy(blob.keyData, aesKey, 32);

    HCRYPTKEY hKey;
    if (!CryptImportKey(hProv, (BYTE*)&blob, sizeof(blob), 0, 0, &hKey)) {
        CryptReleaseContext(hProv, 0);
        return false;
    }

    DWORD mode = CRYPT_MODE_CBC;
    CryptSetKeyParam(hKey, KP_MODE, (BYTE*)&mode, 0);
    CryptSetKeyParam(hKey, KP_IV, iv, 0);

    const DWORD CHUNK_SIZE = 4096;
    BYTE buffer[CHUNK_SIZE + 16];
    
    in.seekg(0, ios::end);
    streampos totalSize = in.tellg();
    streampos dataSize = totalSize - (streampos)16;
    in.seekg(16, ios::beg);

    streampos processed = 0;
    while (processed < dataSize) {
        DWORD toRead = CHUNK_SIZE;
        if (dataSize - processed < (streampos)CHUNK_SIZE) {
            toRead = (DWORD)(dataSize - processed);
        }
        
        in.read((char*)buffer, toRead);
        DWORD bytesRead = (DWORD)in.gcount();
        BOOL isFinal = (processed + (streampos)bytesRead >= dataSize);
        
        DWORD dataLen = bytesRead;
        if (!CryptDecrypt(hKey, 0, isFinal, 0, buffer, &dataLen)) {
            CryptDestroyKey(hKey);
            CryptReleaseContext(hProv, 0);
            return false;
        }
        
        out.write((char*)buffer, dataLen);
        processed += bytesRead;
    }

    CryptDestroyKey(hKey);
    CryptReleaseContext(hProv, 0);
    return true;
}

bool IsProcessRunning(const string& processName) {
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    bool exists = false;
    if (snapshot != INVALID_HANDLE_VALUE && Process32First(snapshot, &entry)) {
        do {
            if (_stricmp(entry.szExeFile, processName.c_str()) == 0) {
                exists = true;
                break;
            }
        } while (Process32Next(snapshot, &entry));
        CloseHandle(snapshot);
    }
    return exists;
}

void KillProcessSilent(const char* exeName) {
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snapshot != INVALID_HANDLE_VALUE && Process32First(snapshot, &entry)) {
        do {
            if (_stricmp(entry.szExeFile, exeName) == 0) {
                HANDLE hProc = OpenProcess(PROCESS_TERMINATE, FALSE, entry.th32ProcessID);
                if (hProc) {
                    TerminateProcess(hProc, 0);
                    CloseHandle(hProc);
                }
            }
        } while (Process32Next(snapshot, &entry));
        CloseHandle(snapshot);
    }
}

void KillOtherLauncherInstances() {
    DWORD currentPid = GetCurrentProcessId();
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snapshot != INVALID_HANDLE_VALUE && Process32First(snapshot, &entry)) {
        do {
            if ((_stricmp(entry.szExeFile, "NSM.exe") == 0 || 
                 _stricmp(entry.szExeFile, "connect.exe") == 0) && 
                entry.th32ProcessID != currentPid) {
                HANDLE hProc = OpenProcess(PROCESS_TERMINATE, FALSE, entry.th32ProcessID);
                if (hProc) {
                    TerminateProcess(hProc, 0);
                    CloseHandle(hProc);
                }
            }
        } while (Process32Next(snapshot, &entry));
        CloseHandle(snapshot);
    }
}

void MarkForDeleteOnReboot(const string& dir) {
    string searchStr = dir + "\\*";
    WIN32_FIND_DATAA fd;
    HANDLE hFind = FindFirstFileA(searchStr.c_str(), &fd);
    if (hFind != INVALID_HANDLE_VALUE) {
        do {
            if (strcmp(fd.cFileName, ".") != 0 && strcmp(fd.cFileName, "..") != 0) {
                string fullPath = dir + "\\" + fd.cFileName;
                if (fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
                    MarkForDeleteOnReboot(fullPath);
                } else {
                    MoveFileExA(fullPath.c_str(), NULL, MOVEFILE_DELAY_UNTIL_REBOOT);
                }
            }
        } while (FindNextFileA(hFind, &fd));
        FindClose(hFind);
    }
    MoveFileExA(dir.c_str(), NULL, MOVEFILE_DELAY_UNTIL_REBOOT);
}

string GetExecutableDir() {
    char buffer[MAX_PATH];
    GetModuleFileNameA(NULL, buffer, MAX_PATH);
    string::size_type pos = string(buffer).find_last_of("\\/");
    return string(buffer).substr(0, pos);
}

HWND CreateHiddenWindow() {
    WNDCLASSA wc = {0};
    wc.lpfnWndProc = DefWindowProcA;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = "gtamp_hidden_class";
    
    HICON hIcon = LoadIcon(GetModuleHandle(NULL), MAKEINTRESOURCE(1));
    if (hIcon) {
        wc.hIcon = hIcon;
    }
    
    RegisterClassA(&wc);
    return CreateWindowA("gtamp_hidden_class", "gtamp", 0, 0, 0, 0, 0, NULL, NULL, GetModuleHandle(NULL), NULL);
}

void ShowCustomError() {
    HWND hParent = CreateHiddenWindow();
    HMODULE hComCtl = LoadLibraryA("comctl32.dll");
    if (hComCtl) {
        typedef HRESULT (WINAPI *TaskDialogFunc)(HWND, HINSTANCE, PCWSTR, PCWSTR, PCWSTR, int, PCWSTR, int*);
        TaskDialogFunc taskDialog = (TaskDialogFunc)GetProcAddress(hComCtl, "TaskDialog");
        if (taskDialog) {
            taskDialog(hParent, GetModuleHandle(NULL), 
                L"gtamp", 
                L"Launch Error", 
                L"GTA5.exe was not found in the specified gta_path.\nPlease check your configuration.",
                0x0001, 
                MAKEINTRESOURCEW(-1), 
                NULL);
            FreeLibrary(hComCtl);
            DestroyWindow(hParent);
            return;
        }
        FreeLibrary(hComCtl);
    }
    MessageBoxW(hParent, L"GTA5.exe was not found in the specified gta_path.\nPlease check your configuration.", L"Launch Error", MB_ICONWARNING | MB_OK);
    DestroyWindow(hParent);
}

void CheckAlreadyRunning() {
    KillOtherLauncherInstances();
    Sleep(150);

    bool gameRunning = IsProcessRunning("altv.exe") || 
                       IsProcessRunning("GTA5.exe") || 
                       IsProcessRunning("altv-webengine.exe");

    if (gameRunning) {
        int button = MessageBoxW(
            NULL,
            L"GTA V / alt:V is already running. Do you want to close it?",
            L"NSM Launcher",
            MB_ICONWARNING | MB_YESNO | MB_TOPMOST | MB_SETFOREGROUND
        );

        if (button == IDYES) {
            KillProcessSilent("altv.exe");
            KillProcessSilent("GTA5.exe");
            KillProcessSilent("altv-webengine.exe");
            Sleep(1000);
        } else {
            ExitProcess(0);
        }
    }
}

void StartDiscordPolling(const string& serverIp) {
    thread t([serverIp]() {
        try {
            httplib::Client localCli("127.0.0.1", 9989);
            localCli.set_connection_timeout(1, 0);
            localCli.Get("/update_rpc?state=&details=Starting%20client...");

            httplib::Client serverCli(serverIp.c_str(), 7800);
            serverCli.set_connection_timeout(1, 0);
        
            while (IsProcessRunning("NSM.exe") || IsProcessRunning("connect.exe") || IsProcessRunning("GTA5.exe") || IsProcessRunning("altv.exe")) {
                if (auto cur = localCli.Get("/current_rpc")) {
                    if (cur->status == 200 && cur->body.find("\"In game\"") == string::npos) {
                        Sleep(5000);
                        continue;
                    }
                }

                if (auto res = serverCli.Get("/discord.json")) {
                    if (res->status == 200) {
                        string body = res->body;
                        string st = "", det = "";
                        int p = -1, mp = -1;

                        size_t stPos = body.find("\"state\":\"");
                        if (stPos != string::npos) {
                            size_t endPos = body.find("\"", stPos + 9);
                            if (endPos != string::npos) st = body.substr(stPos + 9, endPos - stPos - 9);
                        }
                    
                        size_t detPos = body.find("\"details\":\"");
                        if (detPos != string::npos) {
                            size_t endPos = body.find("\"", detPos + 11);
                            if (endPos != string::npos) det = body.substr(detPos + 11, endPos - detPos - 11);
                        }

                        size_t pPos = body.find("\"online\":"); 
                        if (pPos != string::npos) {
                            try { p = stoi(body.substr(pPos + 9)); } catch (...) {}
                        }
                    
                        size_t mpPos = body.find("\"max_online\":");
                        if (mpPos != string::npos) {
                            try { mp = stoi(body.substr(mpPos + 13)); } catch (...) {}
                        }

                        auto url_encode = [](const string& value) {
                            ostringstream escaped;
                            escaped.fill('0');
                            escaped << hex;
                            for (string::const_iterator i = value.begin(), n = value.end(); i != n; ++i) {
                                string::value_type c = (*i);
                                if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
                                    escaped << c;
                                    continue;
                                }
                                escaped << uppercase << '%' << setw(2) << int((unsigned char)c) << nouppercase;
                            }
                            return escaped.str();
                        };

                        string reqStr = "/update_rpc?state=" + url_encode(st) + "&details=" + url_encode(det.empty() ? "In game" : det);
                        if (p >= 0) reqStr += "&online=" + to_string(p);
                        if (mp >= 0) reqStr += "&max_online=" + to_string(mp);
                    
                        localCli.Get(reqStr.c_str());
                    }
                } else {
                    localCli.Get("/update_rpc?state=&details=Disconnected");
                }
                Sleep(10000);
            }
        } catch (...) {}
    });
    t.detach();
}

string ComputeFileSHA1(const string& filename) {
    HCRYPTPROV hProv = 0;
    HCRYPTHASH hHash = 0;
    string result = "";

    if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_FULL, CRYPT_VERIFYCONTEXT)) {
        return "";
    }

    if (!CryptCreateHash(hProv, CALG_SHA1, 0, 0, &hHash)) {
        CryptReleaseContext(hProv, 0);
        return "";
    }

    ifstream file(filename, ios::binary);
    if (!file.is_open()) {
        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return "";
    }

    const int bufSize = 32768;
    char* buffer = new char[bufSize];
    while (file.read(buffer, bufSize)) {
        CryptHashData(hHash, (BYTE*)buffer, bufSize, 0);
    }
    if (file.gcount() > 0) {
        CryptHashData(hHash, (BYTE*)buffer, (DWORD)file.gcount(), 0);
    }
    delete[] buffer;
    file.close();

    DWORD hashLen = 20;
    BYTE hash[20];
    if (CryptGetHashParam(hHash, HP_HASHVAL, hash, &hashLen, 0)) {
        char buf[3];
        for (DWORD i = 0; i < hashLen; i++) {
            sprintf(buf, "%02x", hash[i]);
            result += buf;
        }
    }

    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);
    return result;
}

size_t GetFileSizeStr(const string& filename) {
    WIN32_FILE_ATTRIBUTE_DATA fad;
    if (!GetFileAttributesExA(filename.c_str(), GetFileExInfoStandard, &fad)) {
        return 0;
    }
    LARGE_INTEGER size;
    size.HighPart = fad.nFileSizeHigh;
    size.LowPart = fad.nFileSizeLow;
    return (size_t)size.QuadPart;
}

static string ReadConfigValue(const string& baseDir, const string& key, const string& def) {
    ifstream f(baseDir + "\\.config");
    if (!f.good()) return def;
    string line;
    while (getline(f, line)) {
        size_t eq = line.find('=');
        if (eq == string::npos) continue;
        string k = line.substr(0, eq), v = line.substr(eq + 1);
        auto trim = [](string& x) {
            size_t a = x.find_first_not_of(" \t\r\n"), b = x.find_last_not_of(" \t\r\n");
            x = (a == string::npos) ? "" : x.substr(a, b - a + 1);
        };
        trim(k); trim(v);
        if (k != key) continue;
        size_t c = v.find('#'); if (c != string::npos) { v = v.substr(0, c); trim(v); }
        if (v.size() >= 2 && (v.front() == '\'' || v.front() == '"') && v.front() == v.back()) v = v.substr(1, v.size() - 2);
        return v;
    }
    return def;
}

inline void SetConfigGtaPath(const string& cfgPath, const string& gtaDir) {
    ifstream in(cfgPath);
    vector<string> lines;
    string line;
    bool found = false;
    if (in.is_open()) {
        while (getline(in, line)) {
            size_t eq = line.find('=');
            if (eq != string::npos) {
                string k = line.substr(0, eq);
                auto trim = [](string& x) {
                    size_t a = x.find_first_not_of(" \t\r\n"), b = x.find_last_not_of(" \t\r\n");
                    x = (a == string::npos) ? "" : x.substr(a, b - a + 1);
                };
                trim(k);
                if (k == "gta_path") {
                    lines.push_back("gta_path = '" + gtaDir + "'");
                    found = true;
                    continue;
                }
            }
            lines.push_back(line);
        }
        in.close();
    }
    if (!found) {
        lines.insert(lines.begin(), "gta_path = '" + gtaDir + "'");
    }

    ofstream out(cfgPath, ios::trunc);
    if (out.is_open()) {
        for (const auto& l : lines) {
            out << l << "\n";
        }
        out.close();
    }
}

inline string BrowseForGtaExe() {
    char szFile[MAX_PATH] = {0};
    OPENFILENAMEA ofn = {0};
    ofn.lStructSize = sizeof(ofn);
    ofn.hwndOwner = NULL;
    ofn.lpstrFile = szFile;
    ofn.nMaxFile = sizeof(szFile);
    ofn.lpstrFilter = "GTA5.exe (Grand Theft Auto V)\0GTA5.exe\0All Executables (*.exe)\0*.exe\0All Files (*.*)\0*.*\0";
    ofn.nFilterIndex = 1;
    ofn.lpstrTitle = "Locate GTA5.exe - Grand Theft Auto V";
    ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST | OFN_NOCHANGEDIR;

    MessageBoxW(
        NULL,
        L"Please select your GTA5.exe so NSM can launch Grand Theft Auto V.",
        L"NSM Launcher - Locate GTA V",
        MB_ICONINFORMATION | MB_OK | MB_TOPMOST | MB_SETFOREGROUND
    );

    if (GetOpenFileNameA(&ofn)) {
        string s(szFile);
        size_t p = s.find_last_of("\\/");
        if (p != string::npos) return s.substr(0, p);
    }
    return "";
}

inline string DetectGtaPath(const string& baseDir) {
    auto checkDir = [](const string& dir) -> bool {
        if (dir.empty()) return false;
        string exe = dir + "\\GTA5.exe";
        DWORD attr = GetFileAttributesA(exe.c_str());
        return (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY));
    };

    // 0. Check baseDir and parent directories (if NSM is inside GTA or GTAMP folder)
    if (checkDir(baseDir)) return baseDir;
    string cur = baseDir;
    for (int i = 0; i < 4; ++i) {
        size_t p = cur.find_last_of("\\/");
        if (p == string::npos) break;
        cur = cur.substr(0, p);
        if (checkDir(cur)) return cur;
    }

    auto queryReg = [](HKEY root, const char* subkey, const char* valName) -> string {
        HKEY hKey = NULL;
        char buf[MAX_PATH] = {0};
        DWORD bufSize = sizeof(buf);
        if (RegOpenKeyExA(root, subkey, 0, KEY_READ, &hKey) == ERROR_SUCCESS) {
            DWORD type = REG_SZ;
            if (RegQueryValueExA(hKey, valName, NULL, &type, (LPBYTE)buf, &bufSize) == ERROR_SUCCESS) {
                RegCloseKey(hKey);
                return string(buf);
            }
            RegCloseKey(hKey);
        }
        return "";
    };

    // 1. Registry queries (Rockstar, Epic, Steam)
    string p1 = queryReg(HKEY_LOCAL_MACHINE, "SOFTWARE\\WOW6432Node\\Rockstar Games\\Grand Theft Auto V", "InstallFolder");
    if (checkDir(p1)) return p1;
    string p2 = queryReg(HKEY_LOCAL_MACHINE, "SOFTWARE\\Rockstar Games\\Grand Theft Auto V", "InstallFolder");
    if (checkDir(p2)) return p2;
    string p3 = queryReg(HKEY_LOCAL_MACHINE, "SOFTWARE\\WOW6432Node\\Epic Games\\GrandTheftAutoV", "InstalledDirectory");
    if (checkDir(p3)) return p3;

    string steamPath = queryReg(HKEY_LOCAL_MACHINE, "SOFTWARE\\WOW6432Node\\Valve\\Steam", "InstallPath");
    if (steamPath.empty()) steamPath = queryReg(HKEY_CURRENT_USER, "SOFTWARE\\Valve\\Steam", "SteamPath");
    if (!steamPath.empty()) {
        string steamGta = steamPath + "\\steamapps\\common\\Grand Theft Auto V";
        if (checkDir(steamGta)) return steamGta;

        // Check Steam libraryfolders.vdf
        auto checkSteamVdf = [&](const string& vdfPath) -> string {
            ifstream f(vdfPath);
            if (!f.is_open()) return "";
            string line;
            while (getline(f, line)) {
                size_t pos = line.find("\"path\"");
                if (pos != string::npos) {
                    size_t q1 = line.find('"', pos + 6);
                    if (q1 != string::npos) {
                        size_t q2 = line.find('"', q1 + 1);
                        if (q2 != string::npos) {
                            string rawP = line.substr(q1 + 1, q2 - q1 - 1);
                            string cleanP = "";
                            for (size_t ci = 0; ci < rawP.size(); ++ci) {
                                if (rawP[ci] == '\\' && ci + 1 < rawP.size() && rawP[ci+1] == '\\') {
                                    cleanP += '\\'; ci++;
                                } else cleanP += rawP[ci];
                            }
                            string candidate = cleanP + "\\steamapps\\common\\Grand Theft Auto V";
                            if (checkDir(candidate)) return candidate;
                        }
                    }
                }
            }
            return "";
        };

        string found = checkSteamVdf(steamPath + "\\steamapps\\libraryfolders.vdf");
        if (!found.empty()) return found;
        found = checkSteamVdf(steamPath + "\\config\\libraryfolders.vdf");
        if (!found.empty()) return found;
    }

    // 2. Scan all drives for GTA V installations
    char driveLetters[] = "CDEFGHIJKLMNOPQRSTUVWXYZ";
    for (int i = 0; driveLetters[i]; ++i) {
        string root = string(1, driveLetters[i]) + ":";
        const char* relPaths[] = {
            "\\Program Files\\Rockstar Games\\Grand Theft Auto V",
            "\\Program Files (x86)\\Rockstar Games\\Grand Theft Auto V",
            "\\Program Files (x86)\\Steam\\steamapps\\common\\Grand Theft Auto V",
            "\\Program Files\\Steam\\steamapps\\common\\Grand Theft Auto V",
            "\\SteamLibrary\\steamapps\\common\\Grand Theft Auto V",
            "\\Steam\\steamapps\\common\\Grand Theft Auto V",
            "\\Games\\Grand Theft Auto V",
            "\\Games\\Steam\\steamapps\\common\\Grand Theft Auto V",
            "\\Games\\Rockstar Games\\Grand Theft Auto V",
            "\\Epic Games\\GTAV",
            "\\Program Files\\Epic Games\\GTAV",
            "\\Program Files (x86)\\Epic Games\\GTAV",
            "\\Grand Theft Auto V",
            "\\GTAV"
        };
        for (const char* rel : relPaths) {
            string candidate = root + rel;
            if (checkDir(candidate)) return candidate;
        }
    }

    return "";
}

inline bool EnsureGtaPathConfigured(const string& baseDir, bool allowPrompt) {
    auto checkDir = [](const string& dir) -> bool {
        if (dir.empty()) return false;
        string exe = dir + "\\GTA5.exe";
        DWORD attr = GetFileAttributesA(exe.c_str());
        return (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY));
    };

    string cfgPath = baseDir + "\\.config";
    string currentGta = ReadConfigValue(baseDir, "gta_path", "");

    if (checkDir(currentGta)) {
        return true;
    }

    string detected = DetectGtaPath(baseDir);
    if (!detected.empty()) {
        SetConfigGtaPath(cfgPath, detected);
        WriteLog("Detected and saved GTA path: " + detected);
        return true;
    }

    // Prompt user to browse for GTA5.exe (only at Connect time, never at startup,
    // so no mysterious dialog appears before the server browser opens)
    string userChosen = allowPrompt ? BrowseForGtaExe() : "";
    if (!userChosen.empty() && checkDir(userChosen)) {
        SetConfigGtaPath(cfgPath, userChosen);
        WriteLog("User selected GTA path: " + userChosen);
        return true;
    }

    return false;
}

// Ensures game files are extracted into local target directory when launching GTA
bool EnsureGameFilesReady(const string& baseDir, const string& targetDir) {
    bool dirValid = true;
    int manifestSize = sizeof(g_Manifest) / sizeof(g_Manifest[0]);
    for (int i = 0; i < manifestSize; ++i) {
        string filePath = targetDir + g_Manifest[i].relPath;
        if (filePath.find("skin.bin") != string::npos) continue;

        size_t actualSize = GetFileSizeStr(filePath);
        if (actualSize != g_Manifest[i].expectedSize) {
            dirValid = false;
            break;
        }
    }

    if (dirValid) {
        string altvPath = targetDir + "\\altv.exe";
        DWORD attr = GetFileAttributesA(altvPath.c_str());
        if (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY)) {
            WriteLog("Game files verified and ready in " + targetDir);
            return true;
        }
    }

    WriteLog("Extracting game packs into " + targetDir + "...");

    string packsFolder = baseDir + "\\packs";
    string testPack = packsFolder + "\\mp1.pack";
    if (GetFileAttributesA(testPack.c_str()) == INVALID_FILE_ATTRIBUTES) {
        packsFolder = baseDir + "\\client-new\\packs";
        testPack = packsFolder + "\\mp1.pack";
        if (GetFileAttributesA(testPack.c_str()) == INVALID_FILE_ATTRIBUTES) {
            packsFolder = baseDir;
            testPack = packsFolder + "\\mp1.pack";
            if (GetFileAttributesA(testPack.c_str()) == INVALID_FILE_ATTRIBUTES) {
                WriteLog("mp1.pack not found in: " + baseDir);
                return false;
            }
        }
    }

    CreateDirectoryA(targetDir.c_str(), NULL);
    SHCreateDirectoryExA(NULL, (targetDir + "\\logs").c_str(), NULL);
    CreateDirectoryA((targetDir + "\\proxy").c_str(), NULL);
    CreateDirectoryA((targetDir + "\\cef").c_str(), NULL);
    CreateDirectoryA((targetDir + "\\cef\\locales").c_str(), NULL);
    CreateDirectoryA((targetDir + "\\libs").c_str(), NULL);
    CreateDirectoryA((targetDir + "\\cache").c_str(), NULL);
    CreateDirectoryA((targetDir + "\\backup").c_str(), NULL);

    for (int i = 1; i <= 7; ++i) {
        string packName = "mp" + to_string(i);
        string mpPackPath = packsFolder + "\\" + packName + ".pack";
        string mpDllPath = targetDir + "\\" + packName + "_ext.dll";
        if (DecryptDataAES(mpPackPath, mpDllPath)) {
            HMODULE hMp = LoadLibraryA(mpDllPath.c_str());
            if (hMp) {
                typedef void (*RunExtractorFunc)(const char*);
                RunExtractorFunc runExtractor = (RunExtractorFunc)GetProcAddress(hMp, "RunExtractor");
                if (runExtractor) runExtractor(targetDir.c_str());
                FreeLibrary(hMp);
            }
            DeleteFileA(mpDllPath.c_str());
        } else {
            WriteLog("Failed to decrypt: " + mpPackPath);
            return false;
        }
    }
    WriteLog("Packs successfully extracted.");
    return true;
}


// ============================================================
// FiveM-parity helpers: local masterlist + server auto-start,
// direct runtime install from the local altv-runtime folder,
// and the NSM host window the game is embedded into.
// ============================================================
static bool NsmPortOpen(const string& host, int port) {
    SOCKET s = socket(AF_INET, SOCK_STREAM, 0);
    if (s == INVALID_SOCKET) return false;
    sockaddr_in a; memset(&a, 0, sizeof a);
    a.sin_family = AF_INET; a.sin_port = htons((u_short)port);
    a.sin_addr.s_addr = inet_addr(host.c_str());
    bool ok = (connect(s, (sockaddr*)&a, sizeof a) == 0);
    closesocket(s);
    return ok;
}

static bool NsmSpawnAndWaitPort(const string& exePath, const string& workDir,
                                const string& host, int port, int timeoutMs) {
    STARTUPINFOA si; PROCESS_INFORMATION pi;
    memset(&si, 0, sizeof si); si.cb = sizeof si;
    char cmd[MAX_PATH * 2];
    _snprintf(cmd, sizeof cmd, "\"%s\"", exePath.c_str());
    if (!CreateProcessA(NULL, cmd, NULL, NULL, FALSE, CREATE_NEW_CONSOLE, NULL,
                        workDir.c_str(), &si, &pi)) return false;
    CloseHandle(pi.hThread);
    for (int t = 0; t < timeoutMs; t += 500) {
        if (NsmPortOpen(host, port)) { CloseHandle(pi.hProcess); return true; }
        Sleep(500);
    }
    CloseHandle(pi.hProcess);
    return NsmPortOpen(host, port);
}

static bool NsmIsLocalHost(const string& h) {
    return h == "127.0.0.1" || h == "localhost" || h.empty();
}

static void EnsureLocalMasterlistRunning(const string& baseDir, const string& masterlistUrl) {
    string u = masterlistUrl;
    if (u.rfind("http://", 0) == 0) u = u.substr(7);
    else if (u.rfind("https://", 0) == 0) u = u.substr(8);
    size_t slash = u.find('/');
    if (slash != string::npos) u = u.substr(0, slash);
    string host = "127.0.0.1"; int port = 8080;
    size_t c = u.find(':');
    if (c != string::npos) {
        host = u.substr(0, c);
        try { port = stoi(u.substr(c + 1)); } catch (...) {}
    } else if (!u.empty()) host = u;
    if (!NsmIsLocalHost(host)) return;             // only auto-start our own
    if (NsmPortOpen(host, port)) return;           // already running
    const char* rel[] = { "\\..\\masterlist\\masterlist.exe", "\\masterlist\\masterlist.exe" };
    for (const char* r : rel) {
        string exe = baseDir + r;
        if (GetFileAttributesA(exe.c_str()) != INVALID_FILE_ATTRIBUTES) {
            string dir = exe.substr(0, exe.find_last_of("\\/"));
            WriteLog("Starting local masterlist...");
            if (NsmSpawnAndWaitPort(exe, dir, host, port, 10000))
                WriteLog("Local masterlist is running.");
            else
                WriteLog("Local masterlist did not open its port; continuing.");
            return;
        }
    }
    WriteLog("masterlist.exe not found next to the launcher; assuming it runs elsewhere.");
}

static void EnsureLocalServerRunning(const string& baseDir, const string& host, int port) {
    if (!NsmIsLocalHost(host)) return;             // remote servers are never started by us
    if (NsmPortOpen(host, port)) { WriteLog("Local game server already running."); return; }
    const char* rel[] = { "\\..\\server\\gtamp-server.exe", "\\server\\gtamp-server.exe" };
    for (const char* r : rel) {
        string exe = baseDir + r;
        if (GetFileAttributesA(exe.c_str()) != INVALID_FILE_ATTRIBUTES) {
            string dir = exe.substr(0, exe.find_last_of("\\/"));
            WriteLog("Starting local game server (gtamp-server.exe)...");
            if (NsmSpawnAndWaitPort(exe, dir, host, port, 15000))
                WriteLog("Local game server is running.");
            else
                WriteLog("Local game server did not open its port; the client will retry.");
            return;
        }
    }
    WriteLog("gtamp-server.exe not found next to the launcher; nothing to auto-start.");
}

static void NsmCopyTreeSkipExisting(const string& src, const string& dst) {
    CreateDirectoryA(dst.c_str(), NULL);
    string pat = src + "\\*";
    WIN32_FIND_DATAA fd;
    HANDLE h = FindFirstFileA(pat.c_str(), &fd);
    if (h == INVALID_HANDLE_VALUE) return;
    do {
        if (!strcmp(fd.cFileName, ".") || !strcmp(fd.cFileName, "..")) continue;
        string s = src + "\\" + fd.cFileName;
        string d = dst + "\\" + fd.cFileName;
        if (fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
            NsmCopyTreeSkipExisting(s, d);
        } else if (GetFileAttributesA(d.c_str()) == INVALID_FILE_ATTRIBUTES) {
            CopyFileA(s.c_str(), d.c_str(), TRUE);
        }
    } while (FindNextFileA(h, &fd));
    FindClose(h);
}

static void EnsureRuntimeInstalled(const string& baseDir, const string& targetDir) {
    string altvExe = targetDir + "\\altv.exe";
    if (GetFileAttributesA(altvExe.c_str()) != INVALID_FILE_ATTRIBUTES) return; // already present
    const char* rel[] = { "\\..\\altv-runtime", "\\altv-runtime" };
    for (const char* r : rel) {
        string rtRoot = baseDir + r;
        string pat = rtRoot + "\\*";
        WIN32_FIND_DATAA fd;
        HANDLE h = FindFirstFileA(pat.c_str(), &fd);
        if (h == INVALID_HANDLE_VALUE) continue;
        do {
            if (!(fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) continue;
            if (!strcmp(fd.cFileName, ".") || !strcmp(fd.cFileName, "..")) continue;
            string sub = rtRoot + "\\" + fd.cFileName;
            if (GetFileAttributesA((sub + "\\altv.exe").c_str()) == INVALID_FILE_ATTRIBUTES) continue;
            WriteLog("Installing game runtime from: " + sub);
            NsmCopyTreeSkipExisting(sub, targetDir);
            WriteLog("Game runtime install complete.");
            FindClose(h);
            return;
        } while (FindNextFileA(h, &fd));
        FindClose(h);
    }
    WriteLog("No local altv-runtime folder found; relying on pack extraction only.");
}

// ---- NSM host window: the application window the game is embedded into ----
static HWND g_nsmHostWnd = NULL;

static LRESULT CALLBACK NsmHostWndProc(HWND h, UINT m, WPARAM w, LPARAM l) {
    if (m == WM_CLOSE) { ShowWindow(h, SW_HIDE); return 0; }  // hide, never destroy
    return DefWindowProcA(h, m, w, l);
}

static DWORD WINAPI NsmHostWndThread(LPVOID unused) {
    (void)unused;
    WNDCLASSA wc; memset(&wc, 0, sizeof wc);
    wc.lpfnWndProc = NsmHostWndProc;
    wc.hInstance = GetModuleHandleA(NULL);
    wc.hCursor = LoadCursorA(NULL, IDC_ARROW);
    wc.hIcon = LoadIconA(GetModuleHandleA(NULL), MAKEINTRESOURCEA(1));
    wc.lpszClassName = "NSMMainWindow";
    RegisterClassA(&wc);
    g_nsmHostWnd = CreateWindowExA(0, "NSMMainWindow", "NSM",
        WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, CW_USEDEFAULT, 1280, 820,
        NULL, NULL, GetModuleHandleA(NULL), NULL);
    MSG msg;
    while (g_nsmHostWnd && GetMessageA(&msg, NULL, 0, 0) > 0) {
        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }
    return 0;
}

static void ShowHostWindow(const char* title) {
    if (!g_nsmHostWnd) return;
    SetWindowTextA(g_nsmHostWnd, title);
    if (IsIconic(g_nsmHostWnd)) ShowWindow(g_nsmHostWnd, SW_RESTORE);
    else ShowWindow(g_nsmHostWnd, SW_SHOW);
    SetForegroundWindow(g_nsmHostWnd);
    SetActiveWindow(g_nsmHostWnd);
}

static void HideHostWindow() {
    if (g_nsmHostWnd) ShowWindow(g_nsmHostWnd, SW_HIDE);
}

int APIENTRY WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    // Clean up any stale/background launcher instances and verify running processes
    CheckAlreadyRunning();
    
    int argc;
    LPWSTR* argvW = CommandLineToArgvW(GetCommandLineW(), &argc);
    
    bool hasConnect = false;
    string connectArgs = "";
    string customCache = "";
    string serverIp = "127.0.0.1";
    string customUiStr = "http://127.0.0.1:9988/ui/index.html";
    
    for (int i = 0; i < argc; i++) {
        wstring warg(argvW[i]);
        string arg(warg.begin(), warg.end());
        
        if (arg == "-connect" && i + 1 < argc) {
            hasConnect = true;
            wstring wval(argvW[i+1]);
            string val(wval.begin(), wval.end());
            connectArgs = "-connecturl altv://connect/" + val;
            
            size_t colon = val.find(':');
            if (colon != string::npos) serverIp = val.substr(0, colon);
            else serverIp = val;
            
            i++;
        } else if (arg == "-connecturl" && i + 1 < argc) {
            hasConnect = true;
            wstring wval(argvW[i+1]);
            string val(wval.begin(), wval.end());
            connectArgs = "-connecturl " + val;
            
            string temp = val;
            if (temp.find("altv://connect/") == 0) temp = temp.substr(15);
            size_t colon = temp.find(':');
            if (colon != string::npos) serverIp = temp.substr(0, colon);
            else serverIp = temp;
            
            i++;
        } else if (arg == "-cachepath" && i + 1 < argc) {
            wstring wval(argvW[i+1]);
            customCache = string(wval.begin(), wval.end());
            i++;
        } else if (arg == "-customui" && i + 1 < argc) {
            wstring wval(argvW[i+1]);
            customUiStr = string(wval.begin(), wval.end());
            i++;
        }
    }

    LocalFree(argvW);

    string baseDir = GetExecutableDir();

    // Determine Local app directory FIRST - the log must exist before any GTA
    // detection so every path decision is visible in connect.log
    char localAppData[MAX_PATH];
    ExpandEnvironmentStringsA("%LOCALAPPDATA%", localAppData, MAX_PATH);
    string key = "gtamp";
    string targetDir = string(localAppData) + "\\" + ComputeHash(key);
    SHCreateDirectoryExA(NULL, (targetDir + "\\logs").c_str(), NULL);
    g_logFilePath = targetDir + "\\logs\\connect.log";
    WriteLog("Starting connect.exe / NSM.exe");

    // Silent GTA detection at startup (saves to .config when found; NEVER prompts)
    EnsureGtaPathConfigured(baseDir, false);
    string masterlistUrl = ReadConfigValue(baseDir, "masterlist_url", "http://127.0.0.1:8080");

    // FiveM parity: if the masterlist is local and not running, start it
    EnsureLocalMasterlistRunning(baseDir, masterlistUrl);

    // Start embedded launcher server and open dedicated FiveM-styled launcher window
    if (!gtamp::StartLauncherServer(baseDir, masterlistUrl, !hasConnect)) {
        return 0;
    }

    // NSM host window: the real application window the game gets embedded into
    CreateThread(NULL, 0, NsmHostWndThread, NULL, 0, NULL);

    // Initialize Discord RPC DLL if present
    string discordDllPath = baseDir + "\\discord_rpc.dll";
    HMODULE hDiscord = LoadLibraryA(discordDllPath.c_str());
    typedef void (*InitDiscordFunc)();
    InitDiscordFunc initDiscord = hDiscord ? (InitDiscordFunc)GetProcAddress(hDiscord, "InitDiscordRPC") : nullptr;
    if (initDiscord) {
        initDiscord();
    }
    
    // ========================================================
    // Main FiveM Session Loop:
    // Keeps NSM.exe running across connects, in-game sessions,
    // and returns cleanly to the server browser on disconnect!
    // ========================================================
    while (!gtamp::g_launcherState.shouldQuit) {
        string pickedServer = "";
        string pickedName = "";

        if (!hasConnect) {
            // Reset launcher state to idle so server list is visible
            {
                std::lock_guard<std::mutex> lk(gtamp::g_launcherState.m);
                gtamp::g_launcherState.gameState = "idle";
                gtamp::g_launcherState.currentServer = "";
                gtamp::g_launcherState.serverName = "";
                gtamp::g_launcherState.disconnectRequested = false;
                gtamp::g_launcherState.hasConnectPending = false;
            }

            // Wait for player to choose a server from the launcher UI
            if (!gtamp::WaitForConnect(pickedServer, pickedName)) {
                // UI closed or user clicked quit
                break;
            }
        } else {
            pickedServer = serverIp;
            pickedName = serverIp;
        }

        size_t colon = pickedServer.find(':');
        serverIp = (colon != string::npos) ? pickedServer.substr(0, colon) : pickedServer;
        int serverPort = 7788;
        if (colon != string::npos) { try { serverPort = stoi(pickedServer.substr(colon + 1)); } catch (...) {} }
        connectArgs = "-connecturl altv://connect/" + pickedServer;

        // FiveM parity: if connecting to a local server that is not running, start it
        EnsureLocalServerRunning(baseDir, serverIp, serverPort);

        // GTA path must be valid before the client starts - ask NOW, not at startup,
        // so the picker appears exactly when the user tries to connect
        if (!EnsureGtaPathConfigured(baseDir, true)) {
            MessageBoxW(NULL,
                L"NSM could not find your GTA V installation.\nPress Connect again and choose your GTA5.exe in the folder picker that appears.",
                L"NSM - GTA V location", MB_ICONWARNING | MB_OK);
            if (hasConnect) break;
            continue;
        }

        if (initDiscord) {
            StartDiscordPolling(serverIp);
        }

        // Set state to connecting
        {
            std::lock_guard<std::mutex> lk(gtamp::g_launcherState.m);
            gtamp::g_launcherState.gameState = "connecting";
            gtamp::g_launcherState.currentServer = pickedServer;
            gtamp::g_launcherState.serverName = pickedName.empty() ? pickedServer : pickedName;
            gtamp::g_launcherState.disconnectRequested = false;
        }

        // Ensure game engine packs are ready
        if (!EnsureGameFilesReady(baseDir, targetDir)) {
            MessageBoxW(
                NULL,
                L"GTAMP game packs (packs/mp1.pack) not found in launcher directory.\nPlease place NSM.exe inside your GTAMP folder to launch GTA V.",
                L"NSM Launcher",
                MB_ICONINFORMATION | MB_OK
            );
            // Stay in launcher session, reset to idle
            {
                std::lock_guard<std::mutex> lk(gtamp::g_launcherState.m);
                gtamp::g_launcherState.gameState = "idle";
                gtamp::g_launcherState.currentServer = "";
            }
            if (hasConnect) break;
            continue;
        }

        // NOTE: the game runtime in %LOCALAPPDATA% is intentionally NOT wiped on
        // reboot anymore. Files persist; anything missing is re-installed from the
        // local altv-runtime folder - no 230MB pack download is ever needed.

        string skinBinPath = targetDir + "\\cache\\skin.bin";
        ifstream skinIn(skinBinPath, ios::binary);
        if (skinIn.good()) {
            string skinContent((istreambuf_iterator<char>(skinIn)), istreambuf_iterator<char>());
            skinIn.close();
            
            size_t urlStart = skinContent.find("\"customUiUrl\": [");
            if (urlStart != string::npos) {
                size_t urlEnd = skinContent.find("]", urlStart);
                if (urlEnd != string::npos) {
                    string hashCustomUiStr = ComputeSHA256(customUiStr);
                    string replaceStr = "\"customUiUrl\": [\"" + hashCustomUiStr + "\"]";
                    skinContent.replace(urlStart, urlEnd - urlStart + 1, replaceStr);
                    ofstream skinOut(skinBinPath, ios::binary);
                    skinOut.write(skinContent.c_str(), skinContent.size());
                    skinOut.close();
                }
            }
        }

        // Make sure the game runtime is fully present (fresh install or after a
        // reboot). Installs add-only from the altv-runtime folder shipped in the ZIP.
        EnsureRuntimeInstalled(baseDir, targetDir);

        // Load proxy.dll and start proxy
        string proxyPath = targetDir + "\\proxy\\proxy.dll";
        HMODULE hProxy = LoadLibraryA(proxyPath.c_str());
        if (hProxy) {
            typedef void (*StartProxyFunc)();
            StartProxyFunc startProxy = (StartProxyFunc)GetProcAddress(hProxy, "StartProxyAsync");
            if (startProxy) startProxy();
        }

        Sleep(100);

        // Load config.dll and generate altv.toml
        string configPath = targetDir + "\\config.dll";
        HMODULE hConfig = LoadLibraryA(configPath.c_str());
        if (hConfig) {
            typedef bool (*GenerateConfigFunc)(const char*, const char*, const char*);
            GenerateConfigFunc generateConfig = (GenerateConfigFunc)GetProcAddress(hConfig, "GenerateConfig");
            if (generateConfig) {
                bool success = generateConfig(baseDir.c_str(), targetDir.c_str(), customCache.c_str());
                if (!success) {
                    string chosen = BrowseForGtaExe();
                    if (!chosen.empty()) {
                        SetConfigGtaPath(baseDir + "\\.config", chosen);
                        success = generateConfig(baseDir.c_str(), targetDir.c_str(), customCache.c_str());
                    }
                    if (!success) {
                        ShowCustomError();
                        FreeLibrary(hConfig);
                        if (hProxy) FreeLibrary(hProxy);
                        break;
                    }
                }
            }
            FreeLibrary(hConfig);
        }

        // Show the NSM host window - the game window is embedded into it
        if (ReadConfigValue(baseDir, "embed_game_window", "true") != "false") {
            ShowHostWindow(("NSM - " + (pickedName.empty() ? pickedServer : pickedName)).c_str());
        }

        // Start altv.exe
        string altvExe = targetDir + "\\altv.exe";
        string cmdLine = "\"" + altvExe + "\" " + connectArgs + " -directlaunch -customui " + customUiStr;
        STARTUPINFOA si = { sizeof(si) };
        PROCESS_INFORMATION pi;
        SetEnvironmentVariableA("SteamAppId", "271590");

        WriteLog("Launching: " + cmdLine);

        if (CreateProcessA(NULL, (LPSTR)cmdLine.c_str(), NULL, NULL, FALSE, 0, NULL, targetDir.c_str(), &si, &pi)) {
            CloseHandle(pi.hThread);

            bool gtaStarted = false;
            while (!gtamp::g_launcherState.disconnectRequested && !gtamp::g_launcherState.shouldQuit) {
                bool altvRunning = IsProcessRunning("altv.exe");
                bool gtaRunning = IsProcessRunning("GTA5.exe");

                if (gtaRunning && !gtaStarted) {
                    gtaStarted = true;
                    std::lock_guard<std::mutex> lk(gtamp::g_launcherState.m);
                    gtamp::g_launcherState.gameState = "in_game";
                }

                if (!gtaStarted && !altvRunning) {
                    Sleep(3000);
                    if (!IsProcessRunning("altv.exe") && !IsProcessRunning("GTA5.exe")) {
                        break;
                    }
                }

                if (gtaStarted && !gtaRunning) {
                    break;
                }

                Sleep(500);
            }
            CloseHandle(pi.hProcess);
        } else {
            string err = "Failed to launch altv.exe from: " + altvExe;
            WriteLog(err);
            MessageBoxA(NULL, err.c_str(), "Error", MB_ICONERROR);
        }

        // Notify leave immediately to update masterlist & server decrements
        gtamp::NotifyPlayerLeave(masterlistUrl, pickedServer, gtamp::g_launcherState.clientId);
        KillProcessSilent("altv.exe");
        KillProcessSilent("GTA5.exe");

        if (hProxy) {
            typedef void (*StopProxyFunc)();
            StopProxyFunc stopProxy = (StopProxyFunc)GetProcAddress(hProxy, "StopProxy");
            if (stopProxy) {
                stopProxy();
                Sleep(300);
            }
            FreeLibrary(hProxy);
            hProxy = NULL;
        }

        // Session over: hide the game host window - the server browser is the app again
        HideHostWindow();

        // If launcher was invoked directly with command-line -connect, exit after game closes.
        if (hasConnect) {
            break;
        }
    }

    gtamp::StopLauncherServer();
    return 0;
}
