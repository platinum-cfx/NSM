#define _WIN32_WINNT 0x0A00
#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <shellapi.h>
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
    if (logFile.is_open()) {
        auto now = chrono::system_clock::now();
        time_t now_c = chrono::system_clock::to_time_t(now);
        struct tm parts;
        localtime_s(&parts, &now_c);
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

void DeleteDirectoryRecursively(const string& dir) {
    string searchStr = dir + "\\*";
    WIN32_FIND_DATAA fd;
    HANDLE hFind = FindFirstFileA(searchStr.c_str(), &fd);
    if (hFind != INVALID_HANDLE_VALUE) {
        do {
            if (strcmp(fd.cFileName, ".") != 0 && strcmp(fd.cFileName, "..") != 0) {
                string fullPath = dir + "\\" + fd.cFileName;
                if (fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
                    DeleteDirectoryRecursively(fullPath);
                } else {
                    DeleteFileA(fullPath.c_str());
                }
            }
        } while (FindNextFileA(hFind, &fd));
        FindClose(hFind);
    }
    RemoveDirectoryA(dir.c_str());
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

inline string DetectGtaPath() {
    auto checkDir = [](const string& dir) -> bool {
        if (dir.empty()) return false;
        string exe = dir + "\\GTA5.exe";
        DWORD attr = GetFileAttributesA(exe.c_str());
        return (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY));
    };

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

    // Registry search: Rockstar Games, Epic Games, Steam
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
    }

    const char* commonPaths[] = {
        "C:\\Program Files\\Rockstar Games\\Grand Theft Auto V",
        "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Grand Theft Auto V",
        "C:\\Program Files\\Epic Games\\GTAV",
        "D:\\SteamLibrary\\steamapps\\common\\Grand Theft Auto V",
        "D:\\Steam\\steamapps\\common\\Grand Theft Auto V",
        "D:\\Games\\Grand Theft Auto V",
        "D:\\Epic Games\\GTAV",
        "E:\\SteamLibrary\\steamapps\\common\\Grand Theft Auto V",
        "E:\\Games\\Grand Theft Auto V"
    };

    for (const char* cp : commonPaths) {
        if (checkDir(cp)) return cp;
    }
    return "";
}

inline void EnsureGtaPathConfigured(const string& baseDir) {
    string currentGta = ReadConfigValue(baseDir, "gta_path", "");
    bool valid = false;
    if (!currentGta.empty()) {
        string exe = currentGta + "\\GTA5.exe";
        DWORD attr = GetFileAttributesA(exe.c_str());
        valid = (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY));
    }

    if (!valid) {
        string detected = DetectGtaPath();
        if (!detected.empty()) {
            string cfgPath = baseDir + "\\.config";
            ofstream cfgOut(cfgPath, ios::app);
            if (cfgOut.is_open()) {
                cfgOut << "\ngta_path = '" << detected << "'\n";
                cfgOut.close();
            }
        }
    }
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
    CreateDirectoryA((targetDir + "\\logs").c_str(), NULL);
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
    EnsureGtaPathConfigured(baseDir);
    string masterlistUrl = ReadConfigValue(baseDir, "masterlist_url", "");

    // Start embedded launcher server
    if (!gtamp::StartLauncherServer(baseDir, masterlistUrl, !hasConnect)) {
        return 0;
    }

    // Initialize Discord RPC DLL if present
    string discordDllPath = baseDir + "\\discord_rpc.dll";
    HMODULE hDiscord = LoadLibraryA(discordDllPath.c_str());
    typedef void (*InitDiscordFunc)();
    InitDiscordFunc initDiscord = hDiscord ? (InitDiscordFunc)GetProcAddress(hDiscord, "InitDiscordRPC") : nullptr;
    if (initDiscord) {
        initDiscord();
    }
    
    // Determine Local app directory
    char localAppData[MAX_PATH];
    ExpandEnvironmentStringsA("%LOCALAPPDATA%", localAppData, MAX_PATH);
    string key = "gtamp";
    string targetDir = string(localAppData) + "\\" + ComputeHash(key);
    
    CreateDirectoryA((targetDir + "\\logs").c_str(), NULL);
    g_logFilePath = targetDir + "\\logs\\connect.log";
    WriteLog("Starting connect.exe / NSM.exe");

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
        connectArgs = "-connecturl altv://connect/" + pickedServer;

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
                    ShowCustomError();
                    FreeLibrary(hConfig);
                    if (hProxy) FreeLibrary(hProxy);
                    break;
                }
            }
            FreeLibrary(hConfig);
        }

        // Start altv.exe
        string altvExe = targetDir + "\\altv.exe";
        string cmdLine = "\"" + altvExe + "\" " + connectArgs + " -directlaunch -customui " + customUiStr;
        STARTUPINFOA si = { sizeof(si) };
        PROCESS_INFORMATION pi;
        SetEnvironmentVariableA("SteamAppId", "271590");

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
            MessageBoxA(NULL, "Failed to launch altv.exe", "Error", MB_ICONERROR);
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

        // If launcher was invoked directly with command-line -connect, exit after game closes.
        if (hasConnect) {
            break;
        }
    }

    gtamp::StopLauncherServer();
    return 0;
}
