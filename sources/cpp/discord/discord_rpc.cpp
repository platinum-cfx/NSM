#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <tlhelp32.h>
#include <string>
#include <thread>
#include <mutex>
#include <chrono>
#include "../httplib.h"

using namespace std;

struct DiscordIpcHeader {
    uint32_t opcode;
    uint32_t length;
};

std::mutex g_discordMutex;
string g_clientId = "1510222886710018078";
string g_lastState = "Loading client...";
string g_lastDetails = "";
int g_lastOnline = -1;
int g_lastMaxOnline = -1;
bool g_shouldUpdate = true; // send immediately on start
bool g_running = true;
bool g_inGame = false;
string g_serverIp = "";

DWORD GetGTA5PID() {
    DWORD pid = 0;
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);
    if (Process32First(snapshot, &entry)) {
        while (Process32Next(snapshot, &entry)) {
            if (_stricmp(entry.szExeFile, "GTA5.exe") == 0) {
                pid = entry.th32ProcessID;
                break;
            }
        }
    }
    CloseHandle(snapshot);
    return pid;
}

string ExtractConnectIP() {
    string cmdLine = GetCommandLineA();
    size_t pos = cmdLine.find("-connect ");
    if (pos == string::npos) pos = cmdLine.find("-connecturl ");
    
    if (pos != string::npos) {
        size_t start = cmdLine.find(" ", pos);
        if (start != string::npos) {
            start++;
            while (start < cmdLine.length() && cmdLine[start] == ' ') start++;
            size_t end = cmdLine.find(" ", start);
            string val = cmdLine.substr(start, end - start);
            
            if (val.find("altv://connect/") == 0) val = val.substr(15);
            
            size_t colon = val.find(":");
            if (colon != string::npos) {
                val = val.substr(0, colon);
            }
            return val;
        }
    }
    return "127.0.0.1"; 
}

void StartWebServer() {
    try {
        httplib::Server svr;
        
        svr.Get("/update_rpc", [](const httplib::Request& req, httplib::Response& res) {
            string state = req.has_param("state") ? req.get_param_value("state") : "";
            
            std::lock_guard<std::mutex> lock(g_discordMutex);
            if (state == "Disconnected") {
                g_inGame = false;
                g_lastState = "Disconnected";
                g_lastDetails = "";
                g_lastOnline = -1;
                g_lastMaxOnline = -1;
                g_shouldUpdate = true;
            } else if (state == "In game") {
                g_inGame = true;
                g_lastState = "";
                g_shouldUpdate = true;
            } else if (!state.empty() && state != g_lastState && !g_inGame) {
                g_lastState = state;
                g_shouldUpdate = true;
            }
            
            res.set_content("ok", "text/plain");
        });
        
        svr.listen("127.0.0.1", 9989);
    } catch (...) {}
}

void PollProxyServer() {
    while (g_running) {
        if (g_inGame && !g_serverIp.empty()) {
            httplib::Client cli(g_serverIp, 7899);
            cli.set_connection_timeout(2);
            cli.set_read_timeout(2);
            if (auto res = cli.Get("/rpc")) {
                if (res->status == 200) {
                    string body = res->body;
                    
                    int online = -1, max_online = -1;
                    string state = "", details = "";
                    
                    // Simple JSON parsing
                    size_t pos;
                    if ((pos = body.find("\"online\":")) != string::npos) {
                        online = stoi(body.substr(pos + 9));
                    }
                    if ((pos = body.find("\"max_players\":")) != string::npos) {
                        max_online = stoi(body.substr(pos + 14));
                    }
                    if ((pos = body.find("\"state\":\"")) != string::npos) {
                        size_t end = body.find("\"", pos + 9);
                        if (end != string::npos) state = body.substr(pos + 9, end - pos - 9);
                    }
                    if ((pos = body.find("\"details\":\"")) != string::npos) {
                        size_t end = body.find("\"", pos + 11);
                        if (end != string::npos) details = body.substr(pos + 11, end - pos - 11);
                    }
                    
                    std::lock_guard<std::mutex> lock(g_discordMutex);
                    if (g_lastState != state || g_lastDetails != details || g_lastOnline != online || g_lastMaxOnline != max_online) {
                        g_lastState = state;
                        g_lastDetails = details;
                        g_lastOnline = online;
                        g_lastMaxOnline = max_online;
                        g_shouldUpdate = true;
                    }
                }
            } else {
                std::lock_guard<std::mutex> lock(g_discordMutex);
                if (g_lastState != "Disconnected") {
                    g_lastState = "Disconnected";
                    g_lastDetails = "Lost connection to server";
                    g_lastOnline = -1;
                    g_lastMaxOnline = -1;
                    g_shouldUpdate = true;
                }
            }
        }
        
        // Wait 10 seconds before next poll
        for (int i = 0; i < 100 && g_running; i++) {
            Sleep(100);
        }
    }
}

void StartDiscordIPC() {
    g_serverIp = ExtractConnectIP();

    try {
        bool gtaWasOpen = false;
        
        while (g_running) {
            HANDLE hPipe = CreateFileA("\\\\.\\pipe\\discord-ipc-0", GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);
            if (hPipe != INVALID_HANDLE_VALUE) {
                std::string handshake = "{\"v\":1,\"client_id\":\"" + g_clientId + "\"}";
                DiscordIpcHeader hdr = { 0, (uint32_t)handshake.length() };
                DWORD written;
                WriteFile(hPipe, &hdr, sizeof(hdr), &written, NULL);
                WriteFile(hPipe, handshake.c_str(), handshake.length(), &written, NULL);
                Sleep(100);
                
                auto lastSendTime = std::chrono::steady_clock::now();
                
                while (g_running) {
                    DWORD targetPid = GetGTA5PID();
                    if (targetPid > 0) gtaWasOpen = true;
                    else if (gtaWasOpen) {
                        // GTA 5 was open but now closed -> Exit the whole DLL lifecycle
                        g_running = false;
                        break;
                    }
                    
                    bool updateNow = false;
                    string st, det;
                    int p, mp;
                    
                    auto now = std::chrono::steady_clock::now();
                    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - lastSendTime).count();
                    
                    {
                        std::lock_guard<std::mutex> lock(g_discordMutex);
                        if (g_shouldUpdate || elapsed >= 15) {
                            st = g_lastState;
                            det = g_lastDetails;
                            p = g_lastOnline;
                            mp = g_lastMaxOnline;
                            g_shouldUpdate = false;
                            updateNow = true;
                            lastSendTime = now;
                        }
                    }
                    
                    if (updateNow) {
                        std::string party = "";
                        if (p >= 0 && mp > 0) {
                            party = R"(,"party":{"id":"gtamp","size":[)" + std::to_string(p) + "," + std::to_string(mp) + "]}";
                        }
                        
                        if (!targetPid) targetPid = GetCurrentProcessId();
                        
                        std::string activity = R"({"cmd":"SET_ACTIVITY","args":{"pid":)" + std::to_string(targetPid) + R"(,"activity":{)";

                        bool first = true;
                        if (!st.empty()) {
                            activity += R"("state":")" + st + R"(")"; 
                            first = false;
                        } else if (p >= 0 && mp > 0) {
                            activity += R"("state":"\u200b")"; 
                            first = false; 
                        }
                        if (!det.empty()) { 
                            if (!first) activity += ","; 
                            activity += R"("details":")" + det + R"(")"; 
                            first = false; 
                        }
                        if (!first) activity += ",";
                        activity += R"("assets":{"large_image":"gtamp"},"instance":true)" + party + R"(}},"nonce":"1"})";
                        
                        DiscordIpcHeader actHdr = { 1, (uint32_t)activity.length() };
                        WriteFile(hPipe, &actHdr, sizeof(actHdr), &written, NULL);
                        WriteFile(hPipe, activity.c_str(), activity.length(), &written, NULL);
                    }
                    
                    DWORD bytesAvail;
                    if (PeekNamedPipe(hPipe, NULL, 0, NULL, &bytesAvail, NULL)) {
                        if (bytesAvail > 0) {
                            char buf[1024];
                            DWORD read;
                            ReadFile(hPipe, buf, sizeof(buf), &read, NULL);
                        }
                    } else {
                        break; // Pipe closed
                    }
                    Sleep(100);
                }
                CloseHandle(hPipe);
            }
            Sleep(5000);
        }
    } catch (...) {}
}

extern "C" __declspec(dllexport) void InitDiscordRPC() {
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    thread webThread(StartWebServer);
    webThread.detach();
    
    thread proxyPollThread(PollProxyServer);
    proxyPollThread.detach();
    
    thread ipcThread(StartDiscordIPC);
    ipcThread.detach();
}

BOOL APIENTRY DllMain(HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved) {
    if (ul_reason_for_call == DLL_PROCESS_ATTACH) {
        DisableThreadLibraryCalls(hModule);
    } else if (ul_reason_for_call == DLL_PROCESS_DETACH) {
        g_running = false;
    }
    return TRUE;
}
