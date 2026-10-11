#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <winsock2.h>
#include <wincrypt.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

#include "../httplib.h"

#pragma comment(lib, "crypt32.lib")
#pragma comment(lib, "ws2_32.lib")

using namespace std;


string GetExecutableDir() {
    char path[MAX_PATH];
    GetModuleFileNameA(NULL, path, MAX_PATH);
    string spath = path;
    size_t pos = spath.find_last_of("\\/");
    return (pos != string::npos) ? spath.substr(0, pos) : "";
}

string GetDllDir() {
    char path[MAX_PATH];
    HMODULE hModule;
    if (GetModuleHandleExA(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS | GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT, (LPCSTR)&GetDllDir, &hModule)) {
        GetModuleFileNameA(hModule, path, MAX_PATH);
        string spath = path;
        size_t pos = spath.find_last_of("\\/");
        return (pos != string::npos) ? spath.substr(0, pos) : "";
    }
    return GetExecutableDir();
}

string ComputeFileSHA1(const string& filePath) {
    HANDLE hFile = CreateFileA(filePath.c_str(), GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_FLAG_SEQUENTIAL_SCAN, NULL);
    if (hFile == INVALID_HANDLE_VALUE) return "";

    HCRYPTPROV hProv = 0;
    HCRYPTHASH hHash = 0;
    string hashStr = "";

    if (CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_FULL, CRYPT_VERIFYCONTEXT)) {
        if (CryptCreateHash(hProv, CALG_SHA1, 0, 0, &hHash)) {
            const int BUFSIZE = 1024 * 32;
            vector<BYTE> buffer(BUFSIZE);
            DWORD bytesRead = 0;
            bool success = true;

            while (ReadFile(hFile, buffer.data(), BUFSIZE, &bytesRead, NULL)) {
                if (bytesRead == 0) break;
                if (!CryptHashData(hHash, buffer.data(), bytesRead, 0)) {
                    success = false;
                    break;
                }
            }

            if (success) {
                DWORD hashLen = 20;
                vector<BYTE> hashData(hashLen);
                if (CryptGetHashParam(hHash, HP_HASHVAL, hashData.data(), &hashLen, 0)) {
                    char hex[41];
                    for (DWORD i = 0; i < hashLen; i++) {
                        sprintf_s(hex + i * 2, 3, "%02x", hashData[i]);
                    }
                    hashStr = hex;
                }
            }
            CryptDestroyHash(hHash);
        }
        CryptReleaseContext(hProv, 0);
    }
    CloseHandle(hFile);
    return hashStr;
}

vector<char> ReadAllBytes(const string& filename) {
    ifstream file(filename, ios::binary | ios::ate);
    if (!file.is_open()) return {};
    streamsize size = file.tellg();
    file.seekg(0, ios::beg);
    vector<char> buffer(size);
    if (file.read(buffer.data(), size)) {
        return buffer;
    }
    return {};
}

void Log(const string& msg) {
    string logFile = GetDllDir() + "\\..\\proxy_access.log";
    ofstream out(logFile, ios::app);
    if (out.is_open()) out << msg << "\n";
}

void SetupRoutes(httplib::Server& svr) {
    string dataDir = GetDllDir() + "";

    auto handleFileReq = [dataDir](const httplib::Request& req, httplib::Response& res, const string& targetFile, const string& contentType) {
        string path = dataDir + "\\" + targetFile;
        auto data = ReadAllBytes(path);
        if (data.empty() && targetFile.find(".json") != string::npos) {
            FILE* f = fopen("c:\\Users\\aspidev\\Desktop\\gtamp\\proxy_requests.log", "a");
            if (f) {
                fprintf(f, "File not found or empty: %s\n", path.c_str());
                fclose(f);
            }
            data = {'{', '}'};
        }
        res.set_header("Access-Control-Allow-Origin", "*");
        if (!data.empty()) {
            res.set_content(data.data(), data.size(), contentType);
        } else {
            res.status = 404;
            res.set_content("Not Found", "text/plain");
        }
    };

    svr.Get(".*", [=](const httplib::Request& req, httplib::Response& res) {
        string path = req.path;

        FILE* f = fopen("c:\\Users\\aspidev\\Desktop\\gtamp\\proxy_requests.log", "a");
        if (f) {
            fprintf(f, "Requested path: %s\n", path.c_str());
            fclose(f);
        }

        if (path.find("/rpc_update") != string::npos) {
            string state = req.has_param("state") ? req.get_param_value("state") : "";
            string details = req.has_param("details") ? req.get_param_value("details") : "";
            
            size_t qPos = details.find("In queue:");
            if (qPos != string::npos) {
                details.replace(qPos, 9, "In queue");
            }
            
            FILE* f = fopen("c:\\Users\\aspidev\\Desktop\\gtamp\\proxy_rpc.log", "a");
            if (f) {
                fprintf(f, "RPC UPDATE: state='%s', details='%s'\n", state.c_str(), details.c_str());
                fclose(f);
            }

            res.status = 200;
            res.set_content("OK", "text/plain");
            res.set_header("Access-Control-Allow-Origin", "*");
            return;
        }

        if (path.find("launcher") != string::npos && path.find("update.json") != string::npos) {
            handleFileReq(req, res, "launcher_update_modified.json", "application/json");
            return;
        }
        if (path.find("/client/") != string::npos && path.find("update.json") != string::npos) {
            handleFileReq(req, res, "update_release_modified.json", "application/json");
            return;
        }
        if (path.find("backup") != string::npos && path.find("update.json") != string::npos) {
            handleFileReq(req, res, "backup_update.json", "application/json");
            return;
        }
        if (path.find("backup") != string::npos && path.find("EAC7B9E177254512ACD11423A28AABDD") != string::npos) {
            handleFileReq(req, res, "EAC7B9E177254512ACD11423A28AABDD", "application/octet-stream");
            return;
        }
        if ((path.find("/client/") != string::npos || path.find("/launcher/") != string::npos) && path.find(".json") == string::npos) {
            size_t lastSlash = path.find_last_of('/');
            string filename = (lastSlash != string::npos) ? path.substr(lastSlash + 1) : path;
            handleFileReq(req, res, filename, "application/octet-stream");
            return;
        }

        // Route: /api/tokens/{token}/skin/hash  — return SHA1 of skin.bin
        if (path.find("/skin/hash") != string::npos) {
            string skinPath = dataDir + "\\..\\cache\\skin.bin";
            string hash = ComputeFileSHA1(skinPath);
            if (!hash.empty()) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_content(hash, "text/plain");
            } else {
                res.status = 404;
                res.set_content("Not Found", "text/plain");
            }
            return;
        }

        // Route: /api/tokens/{token}/skin  — return skin.bin binary
        if (path.find("/skin") != string::npos) {
            string skinPath = dataDir + "\\..\\cache\\skin.bin";
            if (path.find(".json") != string::npos) {
                // skin metadata JSON (hash + size)
                string hash = ComputeFileSHA1(skinPath);
                auto data = ReadAllBytes(skinPath);
                size_t size = data.size();
                if (!hash.empty() && size > 0) {
                    string json = "{\"version\":\"16.4.39\",\"hashList\":{\"skin.bin\":\"" + hash + "\"},\"sizeList\":{\"skin.bin\":" + to_string(size) + "}}";
                    res.set_header("Access-Control-Allow-Origin", "*");
                    res.set_content(json, "application/json");
                } else {
                    res.status = 404;
                    res.set_content("Not Found", "text/plain");
                }
                return;
            }
            handleFileReq(req, res, "..\\cache\\skin.bin", "application/octet-stream");
            return;
        }

        // Route: Custom UI
        if (path.find("/ui/") == 0) {
            string filename = path.substr(4);
            if (filename.empty()) filename = "index.html";
            string filepath = dataDir + "\\..\\ui\\" + filename;
            auto data = ReadAllBytes(filepath);
            if (!data.empty()) {
                res.set_header("Access-Control-Allow-Origin", "*");
                
                string contentType = "application/octet-stream";
                if (filename.find(".html") != string::npos) contentType = "text/html; charset=utf-8";
                else if (filename.find(".js") != string::npos) contentType = "application/javascript";
                else if (filename.find(".css") != string::npos) contentType = "text/css";
                else if (filename.find(".svg") != string::npos) contentType = "image/svg+xml";
                
                res.set_content(data.data(), data.size(), contentType);
            } else {
                res.status = 404;
                res.set_content("Not Found", "text/plain");
            }
            return;
        }

        if (path.find("branch-access") != string::npos || path.find("auth") != string::npos || path.find("token") != string::npos) {
            string mockData = "{\"access\": true, \"branches\": [\"release\"]}";
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(mockData, "application/json");
            return;
        }

        if (path.find("client-branches") != string::npos || path == "/w" || path == "/q" || path == "/") {
            string mockBranches = "{\"release\": \"16.4.39\", \"rc\": \"16.4.39\", \"dev\": \"16.4.39\"}";
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(mockBranches, "application/json");
            return;
        }

        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content("{}", "application/json");
    });

    svr.set_logger([](const httplib::Request& req, const httplib::Response& res) {
        stringstream ss;
        ss << "[" << req.method << "] " << req.path << " -> " << res.status;
        Log(ss.str());
    });
}

httplib::Server svr1;
httplib::Server svr2;

extern "C" __declspec(dllexport) void StartProxySync() {
    SetupRoutes(svr1);
    SetupRoutes(svr2);
    
    Log("=== CLIENT Proxy Server listening on http://127.0.0.1:9988 ===");
    Log("=== CLIENT Proxy Server listening on http://127.0.0.1:9 ===");
    
    std::thread t1([&]() {
        svr1.listen("127.0.0.1", 9988);
    });
    
    std::thread t2([&]() {
        svr2.listen("127.0.0.1", 9);
    });
    
    t1.join();
    t2.join();
}

extern "C" __declspec(dllexport) void StartProxyAsync() {
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);
    
    std::thread([]() {
        StartProxySync();
    }).detach();
}

extern "C" __declspec(dllexport) void StopProxy() {
    Log("=== Stopping Proxy Servers ===");
    svr1.stop();
    svr2.stop();
}

BOOL APIENTRY DllMain(HMODULE hModule, DWORD  ul_reason_for_call, LPVOID lpReserved) {
    switch (ul_reason_for_call) {
        case DLL_PROCESS_ATTACH:
        case DLL_THREAD_ATTACH:
        case DLL_THREAD_DETACH:
        case DLL_PROCESS_DETACH:
            break;
    }
    return TRUE;
}
