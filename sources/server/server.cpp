#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>
#include <windows.h>
#include <winhttp.h>
#pragma comment(lib, "winhttp.lib")
#include <iostream>
#include <string>
#include <thread>
#include <vector>
#include <fstream>
#include <ctime>
#include <iomanip>
#include <regex>
#include <map>
#include "httplib.h"
#include "runpe.h"

using namespace std;

string g_serverName = "gtamp";
string g_players = "0";
string g_maxPlayers = "1000";
string g_details = "In game";
string g_website = "";
string g_state = "server.com";
bool g_enableLogs = false;
bool g_discordPresence = false;

// ---- masterlist (announce) ----
bool   g_mlEnabled     = false;
string g_mlUrl         = "";        // e.g. https://list.example.com
string g_mlKey         = "";        // server key issued by the masterlist
string g_mlPublicHost  = "";        // optional: public IP/domain (masterlist uses announcing IP if empty)
string g_mlGamemode    = "Freeroam";
string g_mlLanguage    = "en";
string g_mlDescription = "";
string g_mlTags        = "";        // comma separated
bool   g_mlLocked      = false;
int    g_mlInterval    = 30;
string g_serverPort    = "7788";
bool   g_hasPassword   = false;

std::mutex g_discordMutex;

// Strip a trailing '#'-comment only when it sits OUTSIDE quotes, so values
// like  password = "my#secret"  survive .cfg parsing intact.
static string StripInlineComment(const string& v) {
    bool inS = false, inD = false;
    for (size_t i = 0; i < v.size(); i++) {
        char c = v[i];
        if (c == '\'' && !inD) inS = !inS;
        else if (c == '"' && !inS) inD = !inD;
        else if (c == '#' && !inS && !inD) return v.substr(0, i);
    }
    return v;
}

static string StripQuotes(string v) {
    size_t last = v.find_last_not_of(" \t\r\n");
    if (last != string::npos) v.erase(last + 1);
    if (v.length() >= 2 && (v.front() == '\'' || v.front() == '"') && v.front() == v.back())
        v = v.substr(1, v.length() - 2);
    return v;
}

static string JsonEscape(const string& in) {
    string out;
    for (char c : in) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\r': break;
            case '\t': out += "\\t"; break;
            default: if ((unsigned char)c >= 0x20) out += c;
        }
    }
    return out;
}

static string TagsToJsonArray(const string& csv) {
    string out = "[";
    size_t start = 0;
    bool first = true;
    while (start <= csv.size()) {
        size_t comma = csv.find(',', start);
        string t = csv.substr(start, comma == string::npos ? string::npos : comma - start);
        size_t a = t.find_first_not_of(" \t"), b = t.find_last_not_of(" \t");
        if (a != string::npos) {
            t = t.substr(a, b - a + 1);
            out += (first ? "" : ",") + string("\"") + JsonEscape(t) + "\"";
            first = false;
        }
        if (comma == string::npos) break;
        start = comma + 1;
    }
    return out + "]";
}

// Minimal HTTPS/HTTP POST using WinHTTP (no OpenSSL needed). Returns HTTP status, 0 on transport error.
static int HttpPostJson(const string& url, const string& body, const string& serverKey, string& respOut) {
    respOut.clear();
    wstring wurl(url.begin(), url.end());
    URL_COMPONENTS uc = {}; uc.dwStructSize = sizeof(uc);
    wchar_t host[256] = {0}, path[1024] = {0};
    uc.lpszHostName = host; uc.dwHostNameLength = 255;
    uc.lpszUrlPath = path;  uc.dwUrlPathLength = 1023;
    if (!WinHttpCrackUrl(wurl.c_str(), 0, 0, &uc)) return 0;
    bool https = (uc.nScheme == INTERNET_SCHEME_HTTPS);
    wstring fullPath = path;
    if (fullPath.empty() || fullPath.back() != L'/') fullPath += L'/';
    fullPath += L"announce";

    HINTERNET hS = WinHttpOpen(L"gtamp-server/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
    if (!hS) return 0;
    WinHttpSetTimeouts(hS, 5000, 5000, 10000, 10000);
    HINTERNET hC = WinHttpConnect(hS, host, uc.nPort, 0);
    if (!hC) { WinHttpCloseHandle(hS); return 0; }
    HINTERNET hR = WinHttpOpenRequest(hC, L"POST", fullPath.c_str(), NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, https ? WINHTTP_FLAG_SECURE : 0);
    if (!hR) { WinHttpCloseHandle(hC); WinHttpCloseHandle(hS); return 0; }

    wstring wkey(serverKey.begin(), serverKey.end());
    wstring hdrs = L"Content-Type: application/json\r\nX-Server-Key: " + wkey + L"\r\n";
    int status = 0;
    if (WinHttpSendRequest(hR, hdrs.c_str(), (DWORD)-1, (LPVOID)body.data(), (DWORD)body.size(), (DWORD)body.size(), 0) &&
        WinHttpReceiveResponse(hR, NULL)) {
        DWORD st = 0, sz = sizeof(st);
        WinHttpQueryHeaders(hR, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER, WINHTTP_HEADER_NAME_BY_INDEX, &st, &sz, WINHTTP_NO_HEADER_INDEX);
        status = (int)st;
        DWORD avail = 0;
        while (WinHttpQueryDataAvailable(hR, &avail) && avail > 0) {
            string chunk(avail, '\0'); DWORD got = 0;
            if (!WinHttpReadData(hR, &chunk[0], avail, &got) || got == 0) break;
            respOut.append(chunk, 0, got);
            if (respOut.size() > 4096) break;
        }
    }
    WinHttpCloseHandle(hR); WinHttpCloseHandle(hC); WinHttpCloseHandle(hS);
    return status;
}

void EnsureServerDependencies(const string& dir) {
    string libnodePath = dir + "\\libnode.dll";
    if (GetFileAttributesA(libnodePath.c_str()) == INVALID_FILE_ATTRIBUTES) {
        string zipPath = dir + "\\libnode.zip";
        if (GetFileAttributesA(zipPath.c_str()) != INVALID_FILE_ATTRIBUTES) {
            cout << "[gtamp-server] Extracting libnode.dll from libnode.zip..." << endl;
            string cmd = "cd /d \"" + dir + "\" && tar -xf libnode.zip 2>nul || powershell -Command \"Expand-Archive -Path 'libnode.zip' -DestinationPath '.' -Force\"";
            system(cmd.c_str());
        }
    }
    if (GetFileAttributesA(libnodePath.c_str()) != INVALID_FILE_ATTRIBUTES) {
        CreateDirectoryA((dir + "\\modules").c_str(), NULL);
        CreateDirectoryA((dir + "\\modules\\js-module").c_str(), NULL);
        CopyFileA(libnodePath.c_str(), (dir + "\\modules\\libnode.dll").c_str(), FALSE);
        CopyFileA(libnodePath.c_str(), (dir + "\\modules\\js-module\\libnode.dll").c_str(), FALSE);
    }
    string jsModPath = dir + "\\modules\\js-module.dll";
    string jsModSub = dir + "\\modules\\js-module\\js-module.dll";
    if (GetFileAttributesA(jsModPath.c_str()) != INVALID_FILE_ATTRIBUTES && GetFileAttributesA(jsModSub.c_str()) == INVALID_FILE_ATTRIBUTES) {
        CopyFileA(jsModPath.c_str(), jsModSub.c_str(), FALSE);
    } else if (GetFileAttributesA(jsModSub.c_str()) != INVALID_FILE_ATTRIBUTES && GetFileAttributesA(jsModPath.c_str()) == INVALID_FILE_ATTRIBUTES) {
        CopyFileA(jsModSub.c_str(), jsModPath.c_str(), FALSE);
    }
}

void UpdateServerToml(const string& configPath, const string& tomlPath) {
    ifstream cfgFile(configPath);
    if (!cfgFile.is_open()) return;

    map<string, string> mappings = {
        {"name", "name"},
        {"host", "host"},
        {"port", "port"},
        {"player_slots", "players"},
        {"debug", "debug"},
        {"modules", "modules"},
        {"resources", "resources"},
        {"streaming_distance", "streamingDistance"},
        {"migration_distance", "migrationDistance"},
        {"connection_queue", "connectionQueue"},
        {"spawnAfterConnect", "spawnAfterConnect"},
        {"hash_client_resource_name", "hashClientResourceName"},
        {"peds", "peds"},
        {"objects", "objects"},
        {"vehicles", "vehicles"},
        {"entities", "entities"},
        {"enabled", "enabled"},
        {"bitrate", "bitrate"},
        {"external_secret", "externalSecret"},
        {"external_host", "externalHost"},
        {"external_port", "externalPort"},
        {"external_public_host", "externalPublicHost"},
        {"external_public_port", "externalPublicPort"},
        {"website", "website"}
    };

    map<string, string> newValues;
    string line;
    regex kvRegex(R"(^\s*([a-zA-Z0-9_]+)\s*=\s*(.*))");
    smatch match;

    while (getline(cfgFile, line)) {
        if (regex_match(line, match, kvRegex)) {
            string key = match[1];
            string val = StripInlineComment(match[2]);
            size_t last = val.find_last_not_of(" \t\r\n");
            if (last != string::npos) {
                val.erase(last + 1);
            } else {
                val.clear();
            }
            if (mappings.count(key)) {
                newValues[mappings[key]] = val;
                if (key == "name") {
                    g_serverName = val;
                } else if (key == "port") {
                    g_serverPort = val;
                }
            } else if (key == "port") {
                g_serverPort = val;
            } else if (key == "password") {
                g_hasPassword = !val.empty() && val != "''" && val != "\"\"";
            } else if (key == "announce") {
                g_mlEnabled = (val == "true" || val == "\"true\"" || val == "'true'");
            } else if (key == "masterlist_url") {
                g_mlUrl = StripQuotes(val);
            } else if (key == "server_key") {
                g_mlKey = StripQuotes(val);
            } else if (key == "public_host") {
                g_mlPublicHost = StripQuotes(val);
            } else if (key == "gamemode") {
                g_mlGamemode = StripQuotes(val);
            } else if (key == "language") {
                g_mlLanguage = StripQuotes(val);
            } else if (key == "description") {
                g_mlDescription = StripQuotes(val);
            } else if (key == "tags") {
                g_mlTags = StripQuotes(val);
            } else if (key == "locked") {
                g_mlLocked = (val == "true" || val == "\"true\"" || val == "'true'");
            } else if (key == "announce_interval") {
                try { g_mlInterval = max(10, stoi(val)); } catch (...) {}
            } else if (key == "discord_presence") {
                if (val == "true" || val == "\"true\"" || val == "'true'") {
                    g_discordPresence = true;
                }
            }
        }
    }
    cfgFile.close();

    ifstream tomlFileIn(tomlPath);
    if (!tomlFileIn.is_open()) {
        cout << "Error: Cannot open " << tomlPath << " for reading!" << endl;
        return;
    }
    
    vector<string> tomlLines;
    while (getline(tomlFileIn, line)) {
        tomlLines.push_back(line);
    }
    tomlFileIn.close();

    for (size_t i = 0; i < tomlLines.size(); i++) {
        for (auto it = newValues.begin(); it != newValues.end(); ) {
            string key = it->first;
            string val = it->second;
            regex keyRegex(R"(^#?\s*)" + key + R"(\s*=.*)");
            if (regex_match(tomlLines[i], keyRegex)) {
                tomlLines[i] = key + " = " + val;
                it = newValues.erase(it);
            } else {
                ++it;
            }
        }
    }

    // Remove read-only/hidden/system attributes so we can write to it
    SetFileAttributesA(tomlPath.c_str(), FILE_ATTRIBUTE_NORMAL);

    ofstream tomlFileOut(tomlPath);
    if (!tomlFileOut.is_open()) {
        cout << "Error: Cannot open " << tomlPath << " for writing!" << endl;
        return;
    }
    for (const string& l : tomlLines) {
        tomlFileOut << l << "\n";
    }
    tomlFileOut.close();
}

void ParseServerTomlForDiscord(const string& tomlPath) {
    ifstream tomlFile(tomlPath);
    if (!tomlFile.is_open()) return;
    
    string line;
    regex playersRegex(R"(^\s*players\s*=\s*([0-9]+))");
    regex nameRegex(R"(^\s*name\s*=\s*(.*))");
    regex websiteRegex(R"(^\s*website\s*=\s*(.*))");
    smatch match;

    while (getline(tomlFile, line)) {
        if (regex_match(line, match, playersRegex)) {
            g_maxPlayers = match[1];
        } else if (regex_match(line, match, nameRegex)) {
            string val = match[1];
            size_t commentPos = val.find('#');
            if (commentPos != string::npos) val = val.substr(0, commentPos);
            size_t last = val.find_last_not_of(" \t\r\n");
            if (last != string::npos) val.erase(last + 1);
            if (val.length() >= 2 && (val.front() == '\'' || val.front() == '"') && val.front() == val.back()) {
                val = val.substr(1, val.length() - 2);
            }
            g_serverName = val;
        } else if (regex_match(line, match, websiteRegex)) {
            string val = match[1];
            size_t commentPos = val.find('#');
            if (commentPos != string::npos) val = val.substr(0, commentPos);
            size_t last = val.find_last_not_of(" \t\r\n");
            if (last != string::npos) val.erase(last + 1);
            if (val.length() >= 2 && (val.front() == '\'' || val.front() == '"') && val.front() == val.back()) {
                val = val.substr(1, val.length() - 2);
            }
            g_website = val;
        }
    }
    tomlFile.close();
}

using namespace std;

void LogColor(const string& timeStr, const string& msg1, const string& colored, const string& msg2, int port) {
    HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
    cout << "[" << timeStr << "] " << msg1;
    SetConsoleTextAttribute(hConsole, FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_INTENSITY); // Light yellow
    cout << colored;
    SetConsoleTextAttribute(hConsole, FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE); // Default
    cout << msg2 << port << endl;
}

void Log(const string& msg) {
    time_t t = time(nullptr);
    tm* now = localtime(&t);
    cout << "[" << put_time(now, "%H:%M:%S") << "] " << msg << endl;
}

void* GetResourceData(int resourceId) {
    HRSRC hRes = FindResource(NULL, MAKEINTRESOURCE(resourceId), RT_RCDATA);
    if (!hRes) return nullptr;
    HGLOBAL hGlobal = LoadResource(NULL, hRes);
    if (!hGlobal) return nullptr;
    return LockResource(hGlobal);
}

int main(int argc, char* argv[]) {
#ifdef _WIN32
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif

    for (int i = 1; i < argc; i++) {
        if (string(argv[i]) == "-enablelogs") g_enableLogs = true;
    }

    SetConsoleTitleA("gtamp Server");

    time_t t = time(nullptr);
    tm* now = localtime(&t);
    char timeBuf[64];
    strftime(timeBuf, sizeof(timeBuf), "%H:%M:%S", now);

    int port = 7799;
    LogColor(timeBuf, "Starting ", "gtamp fix by carmone", " on [::]:", port);

    thread proxyThread([port]() {
        try {
            httplib::Server svr;

            svr.set_logger([](const httplib::Request& req, const httplib::Response& res) {
                if (g_enableLogs) {
                    time_t t = time(nullptr);
                    tm* now = localtime(&t);
                    char timeBuf[64];
                    strftime(timeBuf, sizeof(timeBuf), "%H:%M:%S", now);
                    printf("[%s] [PROXY] %s %s -> %d\n", timeBuf, req.method.c_str(), req.target.c_str(), res.status);
                    if (!req.body.empty()) {
                        printf("    Body: %s\n", req.body.c_str());
                    }
                }
            });
            
            svr.Post(".*", [](const httplib::Request& req, httplib::Response& res) {
                string body = req.body;
                if (body.find("clientTokenHashes") != string::npos) {
                    int count = 1;
                    size_t idx = body.find("\"clientTokenHashes\"");
                    if (idx != string::npos) {
                        size_t start = body.find("[", idx);
                        if (start != string::npos) {
                            size_t end = body.find("]", start);
                            if (end != string::npos && end > start) {
                                string arr = body.substr(start + 1, end - start - 1);
                                if (arr.find_first_not_of(" \t\r\n") == string::npos) {
                                    count = 0;
                                } else {
                                    count = 1;
                                    for (char c : arr) {
                                        if (c == ',') count++;
                                    }
                                }
                            }
                        }
                    }
                    // return exactly the count of hashes without minimum 1
                    string responseString = "[";
                    for (int i = 0; i < count; i++) {
                        responseString += "true";
                        if (i < count - 1) responseString += ", ";
                    }
                    responseString += "]";

                    res.set_content(responseString, "application/json");
                    return;
                }

                res.set_content("ok", "text/plain");
            });
            svr.Get("/updateOnline", [](const httplib::Request& req, httplib::Response& res) {
                std::lock_guard<std::mutex> lock(g_discordMutex);
                if (req.has_param("online")) g_players = req.get_param_value("online");
                if (req.has_param("max_online")) g_maxPlayers = req.get_param_value("max_online");
                if (req.has_param("state")) g_state = req.get_param_value("state");
                if (req.has_param("details")) g_details = req.get_param_value("details");
                res.set_content("ok", "text/plain");
            });

            svr.Get("/discord.json", [](const httplib::Request& req, httplib::Response& res) {
                std::lock_guard<std::mutex> lock(g_discordMutex);
                string name = g_serverName;
                if (name.length() >= 2 && (name.front() == '\'' || name.front() == '"') && name.front() == name.back()) {
                    name = name.substr(1, name.length() - 2);
                }
                string maxP = g_maxPlayers;
                if (maxP.length() >= 2 && (maxP.front() == '\'' || maxP.front() == '"') && maxP.front() == maxP.back()) {
                    maxP = maxP.substr(1, maxP.length() - 2);
                }
                string json = "{ \"application_name\": \"" + name + "\", \"state\": \"" + g_state + "\", \"details\": \"" + g_details + "\", \"online\": " + g_players + ", \"max_online\": " + maxP + ", \"website\": \"" + g_website + "\" }";
                res.set_content(json, "application/json");
            });

            if (!svr.listen("0.0.0.0", port)) {
                Log("Failed to start proxy on 7799!");
            }
        } catch (const std::exception& e) {
            Log(string("Exception in proxyThread 7799: ") + e.what());
        } catch (...) {
            Log("Unknown exception in proxyThread 7799!");
        }
    });
    proxyThread.detach();

    Sleep(100);



    // Get altv-server.exe payload from resources
    void* payload = GetResourceData(101);
    if (!payload) {
        Log("Failed to load altv-server.exe from memory resources.");
        cin.get();
        return 1;
    }

    // Prepare arguments
    string args = "";
    for (int i = 1; i < argc; i++) {
        string arg = argv[i];
        if (arg.find(" ") != string::npos) {
            args += "\"" + arg + "\" ";
        } else {
            args += arg + " ";
        }
    }

    // Get current executable path
    char exePath[MAX_PATH];
    GetModuleFileNameA(NULL, exePath, MAX_PATH);

    // Update server.toml from .cfg
    string exeDir = string(exePath);
    exeDir = exeDir.substr(0, exeDir.find_last_of("\\/"));
    UpdateServerToml(exeDir + "\\.cfg", exeDir + "\\server.toml");
    EnsureServerDependencies(exeDir);
    ParseServerTomlForDiscord(exeDir + "\\server.toml");

    if (g_discordPresence) {
        time_t pt = time(nullptr);
        tm* pNow = localtime(&pt);
        char pTimeBuf[64];
        strftime(pTimeBuf, sizeof(pTimeBuf), "%H:%M:%S", pNow);
        LogColor(pTimeBuf, "Starting ", "DiscordRPC server", " on [::]:", 7899);

        thread localThread([]() {
            try {
                httplib::Server svr;
                svr.Get("/update", [](const httplib::Request& req, httplib::Response& res) {
                    std::lock_guard<std::mutex> lock(g_discordMutex);
                    if (req.has_param("online")) g_players = req.get_param_value("online");
                    if (req.has_param("state")) g_state = req.get_param_value("state");
                    if (req.has_param("details")) g_details = req.get_param_value("details");
                    res.set_content("ok", "text/plain");
                });
                if (!svr.listen("127.0.0.1", 7898)) {
                    Log("Failed to start proxy on 7898!");
                }
            } catch (const std::exception& e) {
                Log(string("Exception in localThread 7898: ") + e.what());
            } catch (...) {
                Log("Unknown exception in localThread 7898!");
            }
        });
        localThread.detach();

        thread publicThread([]() {
            try {
                httplib::Server svr;
                svr.Get("/rpc", [](const httplib::Request& req, httplib::Response& res) {
                    std::lock_guard<std::mutex> lock(g_discordMutex);
                    string json = "{\"online\":" + g_players + 
                                  ",\"max_players\":" + g_maxPlayers + 
                                  ",\"state\":\"" + g_state + "\"" +
                                  ",\"details\":\"" + g_details + "\"}";
                    res.set_header("Access-Control-Allow-Origin", "*");
                    res.set_content(json, "application/json");
                });
                if (!svr.listen("0.0.0.0", 7899)) {
                    Log("Failed to start proxy on 7899!");
                }
            } catch (const std::exception& e) {
                Log(string("Exception in publicThread 7899: ") + e.what());
            } catch (...) {
                Log("Unknown exception in publicThread 7899!");
            }
        });
        publicThread.detach();
    }

    // ---- masterlist announce loop ----
    if (g_mlEnabled && !g_mlUrl.empty()) {
        Log("Masterlist announce enabled -> " + g_mlUrl);
        thread mlThread([]() {
            // split scheme://host[:port] from path
            string base = g_mlUrl;
            while (!base.empty() && base.back() == '/') base.pop_back();
            int fails = 0;
            for (;;) {
                string payload;
                {
                    std::lock_guard<std::mutex> lock(g_discordMutex);
                    payload = "{"
                        "\"name\":\"" + JsonEscape(g_serverName) + "\","
                        "\"port\":" + g_serverPort + ","
                        "\"players\":" + g_players + ","
                        "\"maxPlayers\":" + g_maxPlayers + ","
                        "\"gamemode\":\"" + JsonEscape(g_mlGamemode) + "\","
                        "\"language\":\"" + JsonEscape(g_mlLanguage) + "\","
                        "\"website\":\"" + JsonEscape(g_website) + "\","
                        "\"description\":\"" + JsonEscape(g_mlDescription) + "\","
                        "\"tags\":" + TagsToJsonArray(g_mlTags) + ","
                        "\"locked\":" + string((g_mlLocked || g_hasPassword) ? "true" : "false") + ","
                        "\"version\":\"gtamp-1.0\"";
                    if (!g_mlPublicHost.empty()) payload += ",\"host\":\"" + JsonEscape(g_mlPublicHost) + "\"";
                    payload += "}";
                }
                string resp;
                int status = HttpPostJson(base, payload, g_mlKey, resp);
                if (status == 200) {
                    if (fails > 0 || g_enableLogs) Log("Masterlist: announced OK");
                    fails = 0;
                } else {
                    fails++;
                    string why = status ? ("HTTP " + to_string(status) + " " + resp) : "no response (check masterlist_url / internet)";
                    if (fails <= 3 || fails % 20 == 0) Log("Masterlist: announce failed (" + why + ")");
                }
                Sleep(g_mlInterval * 1000);
            }
        });
        mlThread.detach();
    } else {
        Log("Masterlist announce disabled (set announce = true and masterlist_url in .cfg)");
    }

    HANDLE hProcess = RunPE(payload, exePath, args);
    if (!hProcess) {
        Log("Error starting alt:V Server via RunPE.");
        cin.get();
        return 1;
    }

    // Wait for the hollowed process to exit
    WaitForSingleObject(hProcess, INFINITE);

    DWORD exitCode = 0;
    GetExitCodeProcess(hProcess, &exitCode);

    stringstream crashMsg;
    crashMsg << "gtamp Server crashed with exit code " << exitCode << "!";
    Log(crashMsg.str());

    CloseHandle(hProcess);
    
    // Keep console open so the user can see the error
    cin.get();
    return exitCode;
}
