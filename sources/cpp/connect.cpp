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
    return result.empty() ? to_string(std::hash<string>{}(input)) : result;
}

string ComputeSHA256(const string& data) {
    HCRYPTPROV hProv = 0;
    HCRYPTHASH hHash = 0;
    string hashStr = "";
    if (CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        if (CryptCreateHash(hProv, 0x0000800c, 0, 0, &hHash)) { // CALG_SHA_256
            CryptHashData(hHash, (BYTE*)data.c_str(), (DWORD)data.length(), 0);
            DWORD hlen = 32;
            BYTE hdata[32];
            if (CryptGetHashParam(hHash, HP_HASHVAL, hdata, &hlen, 0)) {
                char hexbuf[65];
                for (int hi = 0; hi < 32; hi++) sprintf(hexbuf + hi * 2, "%02x", hdata[hi]);
                hashStr = hexbuf;
            }
            CryptDestroyHash(hHash);
        }
        CryptReleaseContext(hProv, 0);
    }
    return hashStr;
}

string GetExecutableDir() {
    char path[MAX_PATH];
    GetModuleFileNameA(NULL, path, MAX_PATH);
    string spath = path;
    size_t pos = spath.find_last_of("\\/");
    return (pos != string::npos) ? spath.substr(0, pos) : "";
}

const string SECRET_KEY = "GTAMP_SECURE_KEY_2026_!@#";

bool DecryptDataAES(const string& inputFile, const string& outputFile) {
    ifstream in(inputFile, ios::binary);
    if (!in) return false;
    vector<char> data((istreambuf_iterator<char>(in)), istreambuf_iterator<char>());
    in.close();

    HCRYPTPROV hProv;
    HCRYPTHASH hHash;
    HCRYPTKEY hKey;

    if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) return false;
    if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) { CryptReleaseContext(hProv, 0); return false; }
    if (!CryptHashData(hHash, (const BYTE*)SECRET_KEY.c_str(), SECRET_KEY.length(), 0)) {
        CryptDestroyHash(hHash); CryptReleaseContext(hProv, 0); return false;
    }
    if (!CryptDeriveKey(hProv, CALG_AES_256, hHash, 0, &hKey)) {
        CryptDestroyHash(hHash); CryptReleaseContext(hProv, 0); return false;
    }

    DWORD dataLen = data.size();
    if (!CryptDecrypt(hKey, 0, TRUE, 0, (BYTE*)data.data(), &dataLen)) {
        CryptDestroyKey(hKey); CryptDestroyHash(hHash); CryptReleaseContext(hProv, 0); return false;
    }

    HANDLE hFile = CreateFileA(outputFile.c_str(), GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_HIDDEN | FILE_ATTRIBUTE_TEMPORARY, NULL);
    if (hFile != INVALID_HANDLE_VALUE) {
        DWORD written;
        WriteFile(hFile, data.data(), dataLen, &written, NULL);
        CloseHandle(hFile);
    } else {
        CryptDestroyKey(hKey); CryptDestroyHash(hHash); CryptReleaseContext(hProv, 0);
        return false;
    }

    CryptDestroyKey(hKey);
    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);
    return true;
}

bool IsProcessRunning(const string& processName) {
    bool exists = false;
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (Process32First(snapshot, &entry)) {
        while (Process32Next(snapshot, &entry)) {
            if (_stricmp(entry.szExeFile, processName.c_str()) == 0) {
                exists = true;
                break;
            }
        }
    }
    CloseHandle(snapshot);
    return exists;
}

// Kill all other connect.exe processes by PID (excluding current)
void KillOtherConnectInstances() {
    DWORD currentPid = GetCurrentProcessId();
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (Process32First(snapshot, &entry)) {
        do {
            if (_stricmp(entry.szExeFile, "connect.exe") == 0 && entry.th32ProcessID != currentPid) {
                HANDLE hProc = OpenProcess(PROCESS_TERMINATE, FALSE, entry.th32ProcessID);
                if (hProc) {
                    TerminateProcess(hProc, 0);
                    CloseHandle(hProc);
                }
            }
        } while (Process32Next(snapshot, &entry));
    }
    CloseHandle(snapshot);
}

void DeleteDirectoryRecursively(const string& dir) {
    string searchStr = dir + "\\*";
    WIN32_FIND_DATAA fd;
    HANDLE hFind = FindFirstFileA(searchStr.c_str(), &fd);
    if (hFind != INVALID_HANDLE_VALUE) {
        do {
            if (strcmp(fd.cFileName, ".") != 0 && strcmp(fd.cFileName, "..") != 0) {
                string filePath = dir + "\\" + fd.cFileName;
                if (fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
                    DeleteDirectoryRecursively(filePath);
                } else {
                    int retries = 10;
                    while (retries-- > 0) {
                        if (DeleteFileA(filePath.c_str())) break;
                        Sleep(500);
                    }
                }
            }
        } while (FindNextFileA(hFind, &fd));
        FindClose(hFind);
    }
    
    int retries = 10;
    while (retries-- > 0) {
        if (RemoveDirectoryA(dir.c_str())) break;
        Sleep(500);
    }
}

void MarkForDeleteOnReboot(const string& path) {
    string searchStr = path + "\\*";
    WIN32_FIND_DATAA fd;
    HANDLE hFind = FindFirstFileA(searchStr.c_str(), &fd);
    if (hFind != INVALID_HANDLE_VALUE) {
        do {
            if (strcmp(fd.cFileName, ".") != 0 && strcmp(fd.cFileName, "..") != 0) {
                string filePath = path + "\\" + fd.cFileName;
                if (fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
                    MarkForDeleteOnReboot(filePath);
                } else {
                    MoveFileExA(filePath.c_str(), NULL, MOVEFILE_DELAY_UNTIL_REBOOT);
                }
            }
        } while (FindNextFileA(hFind, &fd));
        FindClose(hFind);
    }
    MoveFileExA(path.c_str(), NULL, MOVEFILE_DELAY_UNTIL_REBOOT);
}

HWND CreateDummyParentWindow() {
    WNDCLASSA wc = {0};
    wc.lpfnWndProc = DefWindowProc;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = "GtampDummyParent";
    RegisterClassA(&wc);
    
    // Create an off-screen visible popup window with an app window taskbar presence.
    // This forces Windows to render its icon, which TaskDialog will then inherit.
    HWND hwnd = CreateWindowExA(WS_EX_APPWINDOW, "GtampDummyParent", "gtamp", 
        WS_POPUP | WS_VISIBLE | WS_SYSMENU, 
        -10000, -10000, 10, 10, NULL, NULL, wc.hInstance, NULL);
        
    HICON hIcon = LoadIcon(wc.hInstance, MAKEINTRESOURCE(1));
    if (hIcon) {
        SendMessage(hwnd, WM_SETICON, ICON_BIG, (LPARAM)hIcon);
        SendMessage(hwnd, WM_SETICON, ICON_SMALL, (LPARAM)hIcon);
    }
    return hwnd;
}

void ShowCustomError() {
    HWND hParent = CreateDummyParentWindow();
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

bool IsAnotherConnectByPID() {
    DWORD currentPid = GetCurrentProcessId();
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    bool found = false;
    if (Process32First(snapshot, &entry)) {
        do {
            if (_stricmp(entry.szExeFile, "connect.exe") == 0 && entry.th32ProcessID != currentPid) {
                found = true;
                break;
            }
        } while (Process32Next(snapshot, &entry));
    }
    CloseHandle(snapshot);
    return found;
}

void CheckAlreadyRunning() {
    // Create named mutex - stays alive as long as this process lives
    HANDLE hMutex = CreateMutexA(NULL, TRUE, "GtampConnectSingleInstance");
    bool mutexAlreadyExists = (GetLastError() == ERROR_ALREADY_EXISTS);

    // Double-check with process snapshot in case mutex wasn't held
    bool anotherConnectRunning = mutexAlreadyExists || IsAnotherConnectByPID();

    bool isRunning = IsProcessRunning("altv.exe") || 
                     IsProcessRunning("GTA5.exe") || 
                     IsProcessRunning("altv-webengine.exe") ||
                     anotherConnectRunning;

    if (isRunning) {
        // Load icon from this exe's resources
        HICON hIcon = LoadIcon(GetModuleHandle(NULL), MAKEINTRESOURCE(1));

        // Simple reliable MessageBox with Yes/No
        int button = MessageBoxW(
            NULL,
            L"gtamp is already running. Do you want to close it?",
            L"gtamp Launcher",
            MB_ICONWARNING | MB_YESNO | MB_TOPMOST | MB_SETFOREGROUND
        );

        if (button == IDYES) {
            system("taskkill /F /IM altv.exe >nul 2>&1");
            system("taskkill /F /IM GTA5.exe >nul 2>&1");
            system("taskkill /F /IM altv-webengine.exe >nul 2>&1");
            KillOtherConnectInstances();
            Sleep(1500);
        } else {
            if (hMutex) CloseHandle(hMutex);
            ExitProcess(0);
        }
    }
    // Keep hMutex open - released automatically when process exits
}

void StartDiscordPolling(const string& serverIp) {
    thread t([serverIp]() {
        try {
            // Send initial state
            httplib::Client localCli("127.0.0.1", 9989);
            localCli.set_connection_timeout(1, 0);
            localCli.Get("/update_rpc?state=&details=Starting%20client...");

            httplib::Client serverCli(serverIp.c_str(), 7800);
            serverCli.set_connection_timeout(1, 0);
        
            while (IsProcessRunning("connect.exe") || IsProcessRunning("GTA5.exe") || IsProcessRunning("altv.exe")) {
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

                        // URL encode details and state
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


LONG WINAPI CrashHandler(EXCEPTION_POINTERS* ep) {
    ofstream out("connect_crash.log");
    out << "Crash detected! Exception code: " << std::hex << ep->ExceptionRecord->ExceptionCode << std::endl;
    out.close();
    return EXCEPTION_EXECUTE_HANDLER;
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

    DWORD hashLen = 0;
    DWORD lenSize = sizeof(DWORD);
    CryptGetHashParam(hHash, HP_HASHVAL, NULL, &hashLen, 0);
    
    if (hashLen > 0) {
        BYTE* hash = new BYTE[hashLen];
        if (CryptGetHashParam(hHash, HP_HASHVAL, hash, &hashLen, 0)) {
            ostringstream oss;
            for (DWORD i = 0; i < hashLen; i++) {
                oss << hex << setw(2) << setfill('0') << (int)hash[i];
            }
            result = oss.str();
        }
        delete[] hash;
    }

    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);
    return result;
}

size_t GetFileSizeStr(const string& filename) {
    ifstream file(filename, ios::binary | ios::ate);
    if (!file.is_open()) return 0;
    return file.tellg();
}

// Reads a top-level key from client-new/.config (e.g. masterlist_url = 'https://...')
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

int APIENTRY WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

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
            
            i++; // Skip the value
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

    // No -connect given: open the server browser and wait for the player to pick one.
    if (!hasConnect) {
        string masterlistUrl = ReadConfigValue(baseDir, "masterlist_url", "");
        string picked = gtamp::RunServerBrowser(baseDir, masterlistUrl);
        if (picked.empty()) {
            // Player closed the launcher (or another instance was already open)
            return 0;
        }
        hasConnect = true;
        connectArgs = "-connecturl altv://connect/" + picked;
        size_t colon = picked.find(':');
        serverIp = (colon != string::npos) ? picked.substr(0, colon) : picked;
    }

    // Load Discord RPC DLL
    string discordDllPath = baseDir + "\\discord_rpc.dll";
    HMODULE hDiscord = LoadLibraryA(discordDllPath.c_str());
    if (hDiscord) {
        typedef void (*InitDiscordFunc)();
        InitDiscordFunc initDiscord = (InitDiscordFunc)GetProcAddress(hDiscord, "InitDiscordRPC");
        if (initDiscord) {
            initDiscord();
            StartDiscordPolling(serverIp);
        }
    }
    
    // Determine Local directory
    char localAppData[MAX_PATH];
    ExpandEnvironmentStringsA("%LOCALAPPDATA%", localAppData, MAX_PATH);
    string key = "gtamp";
    string targetDir = string(localAppData) + "\\" + ComputeHash(key);
    
    // Setup logging
    CreateDirectoryA((targetDir + "\\logs").c_str(), NULL);
    g_logFilePath = targetDir + "\\logs\\connect.log";
    WriteLog("Starting connect.exe");
    
    // Check if target directory already exists
    DWORD attr = GetFileAttributesA(targetDir.c_str());
    bool dirExists = (attr != INVALID_FILE_ATTRIBUTES && (attr & FILE_ATTRIBUTE_DIRECTORY));
    
    if (dirExists) {
        WriteLog("Target directory exists, verifying files...");
        int manifestSize = sizeof(g_Manifest) / sizeof(g_Manifest[0]);
        for (int i = 0; i < manifestSize; ++i) {
            string filePath = targetDir + g_Manifest[i].relPath;
            
            // Skip skin.bin because we modify it to inject our custom UI URL
            if (filePath.find("skin.bin") != string::npos) continue;
            
            size_t actualSize = GetFileSizeStr(filePath);
            if (actualSize != g_Manifest[i].expectedSize) {
                WriteLog("Verification failed (size mismatch): " + filePath);
                dirExists = false;
                break;
            }
            string actualSha1 = ComputeFileSHA1(filePath);
            if (actualSha1 != g_Manifest[i].expectedSha1) {
                WriteLog("Verification failed (hash mismatch): " + filePath + " (Expected " + g_Manifest[i].expectedSha1 + " but got " + actualSha1 + ")");
                dirExists = false;
                break;
            }
        }
        if (dirExists) {
            WriteLog("Verification successful.");
        }
    }

    if (!dirExists) {
        WriteLog("Extracting packs (directory did not exist or verification failed)...");
        CreateDirectoryA(targetDir.c_str(), NULL);
        CreateDirectoryA((targetDir + "\\logs").c_str(), NULL);
        CreateDirectoryA((targetDir + "\\proxy").c_str(), NULL);
        CreateDirectoryA((targetDir + "\\cef").c_str(), NULL);
        CreateDirectoryA((targetDir + "\\cef\\locales").c_str(), NULL);
        CreateDirectoryA((targetDir + "\\libs").c_str(), NULL);
        CreateDirectoryA((targetDir + "\\cache").c_str(), NULL);
        CreateDirectoryA((targetDir + "\\backup").c_str(), NULL);
        
        // Unpack mp1.pack to mp7.pack
        for (int i = 1; i <= 7; ++i) {
            string packName = "mp" + to_string(i);
            WriteLog("Extracting " + packName + "...");
            string mpPackPath = baseDir + "\\\\packs\\\\" + packName + ".pack";
            string mpDllPath = targetDir + "\\\\" + packName + "_ext.dll";
            if (DecryptDataAES(mpPackPath, mpDllPath)) {
                HMODULE hMp = LoadLibraryA(mpDllPath.c_str());
                if (hMp) {
                    typedef void (*RunExtractorFunc)(const char*);
                    RunExtractorFunc runExtractor = (RunExtractorFunc)GetProcAddress(hMp, "RunExtractor");
                    if (runExtractor) runExtractor(targetDir.c_str());
                    FreeLibrary(hMp);
                } else {
                    WriteLog("Failed to load extracted library: " + packName + "_ext.dll");
                }
                DeleteFileA(mpDllPath.c_str());
            } else {
                string errorMsg = "Failed to decrypt " + packName + ".pack";
                WriteLog(errorMsg);
                MessageBoxA(NULL, errorMsg.c_str(), "Error", MB_ICONERROR);
                return 1;
            }
        }
        WriteLog("Extraction complete.");
    } else {
        WriteLog("Target directory exists. Skipping extraction.");
    }
    
    // Mark all extracted files for deletion on reboot (requires Admin privileges)
    MarkForDeleteOnReboot(targetDir);
    
    string skinBinPath = targetDir + "\\cache\\skin.bin";
    ifstream skinIn(skinBinPath, ios::binary);
    if (skinIn.good()) {
        string skinContent((istreambuf_iterator<char>(skinIn)), istreambuf_iterator<char>());
        skinIn.close();
        
        // Find customUiUrl array and replace it with SHA256 hash of the URL
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

    // Load proxy.dll and start proxy from temp directory
    string proxyPath = targetDir + "\\proxy\\proxy.dll";
    HMODULE hProxy = LoadLibraryA(proxyPath.c_str());
    if (hProxy) {
        typedef void (*StartProxyFunc)();
        StartProxyFunc startProxy = (StartProxyFunc)GetProcAddress(hProxy, "StartProxyAsync");
        if (startProxy) {
            startProxy();
        }
    } else {
        MessageBoxA(NULL, "Failed to load proxy.dll!", "Error", MB_ICONERROR);
    }

    Sleep(100); // Give proxy a tiny bit of time to start listening

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
                return 1;
            }
        } else {
            MessageBoxA(NULL, "Failed to find GenerateConfig in config.dll!", "Error", MB_ICONERROR);
        }
        FreeLibrary(hConfig);
    } else {
        MessageBoxA(NULL, "Failed to load config.dll!", "Error", MB_ICONERROR);
    }



    // Start altv.exe from temp directory
    string altvExe = targetDir + "\\altv.exe";
    string cmdLine = "\"" + altvExe + "\" " + connectArgs + " -directlaunch -customui " + customUiStr;
    STARTUPINFOA si = { sizeof(si) };
    PROCESS_INFORMATION pi;
    
    // Set SteamAppId to avoid altv trying to write steam_appid.txt in GTA folder
    // which causes "Steam cannot write to its installation folder" if user has no admin rights
    SetEnvironmentVariableA("SteamAppId", "271590");
    
    if (CreateProcessA(NULL, (LPSTR)cmdLine.c_str(), NULL, NULL, FALSE, 0, NULL, targetDir.c_str(), &si, &pi)) {
        CloseHandle(pi.hThread);
        
        bool gtaStarted = false;
        while (true) {
            bool altvRunning = IsProcessRunning("altv.exe");
            bool gtaRunning = IsProcessRunning("GTA5.exe");
            
            if (gtaRunning) {
                gtaStarted = true;
            }
            
            if (!gtaStarted && !altvRunning) {
                // altv.exe is not running, might be restarting. Wait to confirm.
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
    
    if (hProxy) {
        typedef void (*StopProxyFunc)();
        StopProxyFunc stopProxy = (StopProxyFunc)GetProcAddress(hProxy, "StopProxy");
        if (stopProxy) {
            stopProxy();
            Sleep(500); // Give threads time to exit
        }
        FreeLibrary(hProxy);
    }
    
    TerminateProcess(GetCurrentProcess(), 0);
    return 0;
}
