// browser_server.h — GTAMP launcher server browser
//
// Hosts the launcher UI on http://127.0.0.1:9987,
// opens it in a dedicated FiveM-style app window, and maintains the launcher session.
#pragma once

#include <string>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <chrono>
#include <fstream>
#include <sstream>
#include <atomic>
#include <vector>

#ifdef _WIN32
  #ifndef WIN32_LEAN_AND_MEAN
  #define WIN32_LEAN_AND_MEAN
  #endif
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #include <windows.h>
  #include <shellapi.h>
  #include <tlhelp32.h>
  typedef SOCKET bs_socket_t;
  #define BS_INVALID INVALID_SOCKET
  #define bs_close closesocket
#else
  #include <sys/socket.h>
  #include <netinet/in.h>
  #include <arpa/inet.h>
  #include <netdb.h>
  #include <fcntl.h>
  #include <unistd.h>
  #include <sys/select.h>
  typedef int bs_socket_t;
  #define BS_INVALID (-1)
  #define bs_close ::close
#endif

#include "../httplib.h"
#include "launcher_html_data.h"

#ifndef GTAMP_LAUNCHER_PORT
#define GTAMP_LAUNCHER_PORT 9987
#endif
#ifndef GTAMP_LAUNCHER_VERSION
#define GTAMP_LAUNCHER_VERSION "1.0.0"
#endif

namespace gtamp {

inline std::string g_baseDir = "";
inline std::string g_masterlistUrl = "";
inline std::string g_uiDir = "";
inline int g_launcherPort = GTAMP_LAUNCHER_PORT;

inline std::string ReadTextFile(const std::string& path) {
    if (path.empty()) return "";
    std::ifstream f(path, std::ios::binary);
    if (!f.good()) return "";
    std::stringstream ss; ss << f.rdbuf();
    return ss.str();
}

inline std::string JsonStr(const std::string& s) {
    std::string o = "\"";
    for (char c : s) {
        switch (c) {
            case '"':  o += "\\\""; break;
            case '\\': o += "\\\\"; break;
            case '\n': o += "\\n";  break;
            case '\r': break;
            case '\t': o += "\\t";  break;
            default: if ((unsigned char)c >= 0x20) o += c;
        }
    }
    return o + "\"";
}

inline std::string JsonField(const std::string& body, const std::string& key) {
    std::string k = "\"" + key + "\"";
    size_t p = body.find(k);
    if (p == std::string::npos) return "";
    p = body.find(':', p);
    if (p == std::string::npos) return "";
    ++p;
    while (p < body.size() && (body[p] == ' ' || body[p] == '\t')) ++p;
    if (p >= body.size()) return "";
    if (body[p] == '"') {
        size_t e = body.find('"', p + 1);
        return e == std::string::npos ? "" : body.substr(p + 1, e - p - 1);
    }
    size_t e = p;
    while (e < body.size() && body[e] != ',' && body[e] != '}' && body[e] != ' ') ++e;
    return body.substr(p, e - p);
}

inline int TcpPingMs(const std::string& host, int port, int timeoutMs = 2000) {
    addrinfo hints = {}; hints.ai_family = AF_UNSPEC; hints.ai_socktype = SOCK_STREAM;
    addrinfo* res = nullptr;
    if (getaddrinfo(host.c_str(), std::to_string(port).c_str(), &hints, &res) != 0 || !res) return -1;

    int result = -1;
    for (addrinfo* ai = res; ai && result < 0; ai = ai->ai_next) {
        bs_socket_t s = socket(ai->ai_family, ai->ai_socktype, ai->ai_protocol);
        if (s == BS_INVALID) continue;
#ifdef _WIN32
        u_long nb = 1; ioctlsocket(s, FIONBIO, &nb);
#else
        fcntl(s, F_SETFL, fcntl(s, F_GETFL, 0) | O_NONBLOCK);
#endif
        auto t0 = std::chrono::steady_clock::now();
        int rc = connect(s, ai->ai_addr, (int)ai->ai_addrlen);
        bool pending = false;
#ifdef _WIN32
        pending = (rc != 0 && WSAGetLastError() == WSAEWOULDBLOCK);
#else
        pending = (rc != 0 && errno == EINPROGRESS);
#endif
        if (rc == 0 || pending) {
            fd_set wf; FD_ZERO(&wf); FD_SET(s, &wf);
            timeval tv; tv.tv_sec = timeoutMs / 1000; tv.tv_usec = (timeoutMs % 1000) * 1000;
            if (select((int)s + 1, nullptr, &wf, nullptr, &tv) > 0) {
                int err = 0; socklen_t len = sizeof(err);
                getsockopt(s, SOL_SOCKET, SO_ERROR, (char*)&err, &len);
                if (err == 0) {
                    auto t1 = std::chrono::steady_clock::now();
                    result = (int)std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();
                }
            }
        }
        bs_close(s);
    }
    freeaddrinfo(res);
    return result;
}

inline bool IsPortAvailable(int port) {
    bs_socket_t s = socket(AF_INET, SOCK_STREAM, 0);
    if (s == BS_INVALID) return false;
    int opt = 1;
    setsockopt(s, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));
    sockaddr_in sa = {};
    sa.sin_family = AF_INET;
    sa.sin_addr.s_addr = inet_addr("127.0.0.1");
    sa.sin_port = htons(port);
    int r = bind(s, (sockaddr*)&sa, sizeof(sa));
    bs_close(s);
    return (r == 0);
}

#ifdef _WIN32
inline std::string FindBrowserAppExe() {
    char progFiles[MAX_PATH] = {0};
    char progFilesX86[MAX_PATH] = {0};
    char localApp[MAX_PATH] = {0};

    GetEnvironmentVariableA("ProgramFiles", progFiles, MAX_PATH);
    GetEnvironmentVariableA("ProgramFiles(x86)", progFilesX86, MAX_PATH);
    GetEnvironmentVariableA("LOCALAPPDATA", localApp, MAX_PATH);

    std::vector<std::string> candidates;

    auto stripQuotes = [](std::string s) -> std::string {
        while (!s.empty() && (s.front() == '"' || s.front() == '\'')) s.erase(0, 1);
        while (!s.empty() && (s.back() == '"' || s.back() == '\'')) s.pop_back();
        return s;
    };

    auto queryAppPath = [&](HKEY root, const char* subkey) -> std::string {
        HKEY hKey = NULL;
        char buf[MAX_PATH] = {0};
        DWORD bufSize = sizeof(buf);
        if (RegOpenKeyExA(root, subkey, 0, KEY_READ, &hKey) == ERROR_SUCCESS) {
            DWORD type = REG_SZ;
            if (RegQueryValueExA(hKey, NULL, NULL, &type, (LPBYTE)buf, &bufSize) == ERROR_SUCCESS) {
                RegCloseKey(hKey);
                return stripQuotes(std::string(buf));
            }
            RegCloseKey(hKey);
        }
        return "";
    };

    std::string edgeReg = queryAppPath(HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe");
    if (!edgeReg.empty()) candidates.push_back(edgeReg);

    std::string chromeReg = queryAppPath(HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe");
    if (!chromeReg.empty()) candidates.push_back(chromeReg);

    std::string chromeRegUser = queryAppPath(HKEY_CURRENT_USER, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe");
    if (!chromeRegUser.empty()) candidates.push_back(chromeRegUser);

    if (progFilesX86[0]) candidates.push_back(std::string(progFilesX86) + "\\Microsoft\\Edge\\Application\\msedge.exe");
    if (progFiles[0])    candidates.push_back(std::string(progFiles) + "\\Microsoft\\Edge\\Application\\msedge.exe");
    if (progFiles[0])    candidates.push_back(std::string(progFiles) + "\\Google\\Chrome\\Application\\chrome.exe");
    if (progFilesX86[0]) candidates.push_back(std::string(progFilesX86) + "\\Google\\Chrome\\Application\\chrome.exe");
    if (localApp[0])     candidates.push_back(std::string(localApp) + "\\Google\\Chrome\\Application\\chrome.exe");
    if (localApp[0])     candidates.push_back(std::string(localApp) + "\\Microsoft\\Edge\\Application\\msedge.exe");
    if (progFiles[0])    candidates.push_back(std::string(progFiles) + "\\BraveSoftware\\Brave-Browser\\Application\\brave.exe");
    if (progFilesX86[0]) candidates.push_back(std::string(progFilesX86) + "\\BraveSoftware\\Brave-Browser\\Application\\brave.exe");

    for (const auto& path : candidates) {
        if (!path.empty()) {
            DWORD attr = GetFileAttributesA(path.c_str());
            if (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY)) {
                return path;
            }
        }
    }
    return "";
}

inline bool OpenInAppWindow(const std::string& url, HANDLE* outProcess = nullptr) {
    std::string exe = FindBrowserAppExe();
    if (!exe.empty()) {
        std::string cmd = "\"" + exe + "\" --app=\"" + url + "\" --window-size=1280,820 --no-first-run --no-default-browser-check --no-proxy-server";

        STARTUPINFOA si = { sizeof(si) };
        PROCESS_INFORMATION pi;
        if (CreateProcessA(NULL, (LPSTR)cmd.c_str(), NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
            CloseHandle(pi.hThread);
            if (outProcess) {
                *outProcess = pi.hProcess;
            } else {
                CloseHandle(pi.hProcess);
            }
            return true;
        }
    }

    ShellExecuteA(NULL, "open", url.c_str(), NULL, NULL, SW_SHOWNORMAL);
    return false;
}
#else
inline bool OpenInAppWindow(const std::string& url, void* = nullptr) {
    std::string cmd = "xdg-open '" + url + "' >/dev/null 2>&1 &";
    (void)system(cmd.c_str());
    return true;
}
#endif

inline void OpenInBrowser(const std::string& url) {
    OpenInAppWindow(url, nullptr);
}

inline std::string ContentTypeFor(const std::string& name) {
    auto ends = [&](const char* ext) { size_t n = strlen(ext); return name.size() >= n && name.compare(name.size() - n, n, ext) == 0; };
    if (ends(".html")) return "text/html; charset=utf-8";
    if (ends(".js"))   return "application/javascript";
    if (ends(".css"))  return "text/css";
    if (ends(".svg"))  return "image/svg+xml";
    if (ends(".png"))  return "image/png";
    if (ends(".jpg") || ends(".jpeg")) return "image/jpeg";
    if (ends(".ico"))  return "image/x-icon";
    if (ends(".json")) return "application/json";
    return "application/octet-stream";
}

struct LauncherState {
    std::string gameState = "idle"; // "idle", "connecting", "in_game"
    std::string currentServer = "";
    std::string serverName = "";
    std::string clientId = "client_" + std::to_string((unsigned long long)time(nullptr));
    std::atomic<bool> disconnectRequested{ false };
    std::atomic<bool> shouldQuit{ false };
    std::mutex m;
    std::condition_variable cv;
    bool hasConnectPending = false;
    std::string pendingConnectAddr = "";
    std::string pendingServerName = "";
};

inline LauncherState g_launcherState;
inline std::unique_ptr<httplib::Server> g_pLauncherSvr;
inline std::thread g_launcherSvrThread;
#ifdef _WIN32
inline HANDLE g_hUiProcess = NULL;
#endif

inline void KillProcessByName(const std::string& processName) {
#ifdef _WIN32
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snapshot != INVALID_HANDLE_VALUE && Process32First(snapshot, &entry)) {
        do {
            if (_stricmp(entry.szExeFile, processName.c_str()) == 0) {
                HANDLE hProc = OpenProcess(PROCESS_TERMINATE, FALSE, entry.th32ProcessID);
                if (hProc) {
                    TerminateProcess(hProc, 0);
                    CloseHandle(hProc);
                }
            }
        } while (Process32Next(snapshot, &entry));
        CloseHandle(snapshot);
    }
#endif
}

inline std::string GetEmbeddedLauncherHtml() {
#ifdef _WIN32
    HRSRC hRes = FindResourceA(NULL, MAKEINTRESOURCEA(201), (LPCSTR)RT_RCDATA);
    if (hRes) {
        HGLOBAL hMem = LoadResource(NULL, hRes);
        if (hMem) {
            DWORD size = SizeofResource(NULL, hRes);
            const char* data = (const char*)LockResource(hMem);
            if (data && size > 0) {
                return std::string(data, size);
            }
        }
    }
#endif
    return "";
}

inline std::string GetLauncherHtml(const std::string& uiDir, const std::string& baseDir) {
    if (!uiDir.empty()) {
        std::string html = ReadTextFile(uiDir + "\\index.html");
        if (!html.empty()) return html;
    }

    if (!baseDir.empty()) {
        std::string html = ReadTextFile(baseDir + "\\launcher\\index.html");
        if (!html.empty()) return html;

        html = ReadTextFile(baseDir + "\\client-new\\launcher\\index.html");
        if (!html.empty()) return html;

        html = ReadTextFile(baseDir + "\\index.html");
        if (!html.empty()) return html;
    }

    std::string html = GetEmbeddedLauncherHtml();
    if (!html.empty()) return html;

    if (GetEmbeddedHtmlSize() > 0) {
        return std::string(GetEmbeddedHtmlData(), GetEmbeddedHtmlSize());
    }

    return "<!doctype html><meta charset=utf-8><body style='background:#111;color:#eee;padding:40px'><h2>GTAMP Launcher</h2></body>";
}

inline void NotifyPlayerLeave(const std::string& masterlistUrl, const std::string& serverAddr, const std::string& clientId) {
    try {
        httplib::Client proxyCli("127.0.0.1", 7799);
        proxyCli.set_connection_timeout(0, 500000);
        proxyCli.set_read_timeout(0, 500000);
        proxyCli.Get(("/playerLeave?clientId=" + clientId).c_str());
    } catch (...) {}

    try {
        std::string sHost = "127.0.0.1";
        int sPort = 7788;
        size_t col = serverAddr.find(':');
        if (col != std::string::npos) {
            sHost = serverAddr.substr(0, col);
            try { sPort = std::stoi(serverAddr.substr(col + 1)); } catch (...) {}
        } else if (!serverAddr.empty()) {
            sHost = serverAddr;
        }

        std::string mlHost = "127.0.0.1";
        int mlPort = 8080;
        std::string u = masterlistUrl;
        if (u.rfind("http://", 0) == 0) u = u.substr(7);
        else if (u.rfind("https://", 0) == 0) u = u.substr(8);
        size_t slash = u.find('/');
        std::string mlHostPort = (slash != std::string::npos) ? u.substr(0, slash) : u;
        size_t mcol = mlHostPort.find(':');
        if (mcol != std::string::npos) {
            mlHost = mlHostPort.substr(0, mcol);
            try { mlPort = std::stoi(mlHostPort.substr(mcol + 1)); } catch (...) {}
        } else if (!mlHostPort.empty()) {
            mlHost = mlHostPort;
        }

        httplib::Client mlCli(mlHost.c_str(), mlPort);
        mlCli.set_connection_timeout(1, 0);
        mlCli.set_read_timeout(1, 0);
        mlCli.Get(("/api/player/leave?host=" + sHost + "&port=" + std::to_string(sPort) + "&clientId=" + clientId).c_str());
    } catch (...) {}
}

inline bool StartLauncherServer(const std::string& baseDir, const std::string& masterlistUrl, bool openBrowser = true, int idleTimeoutSec = 0) {
    g_baseDir = baseDir;
    g_masterlistUrl = masterlistUrl;
#ifdef _WIN32
    g_uiDir = baseDir + "\\launcher";
#else
    g_uiDir = baseDir + "/launcher";
#endif

    int boundPort = -1;
    for (int p = GTAMP_LAUNCHER_PORT; p < GTAMP_LAUNCHER_PORT + 20; p++) {
        if (IsPortAvailable(p)) {
            boundPort = p;
            break;
        }
    }
    if (boundPort == -1) boundPort = GTAMP_LAUNCHER_PORT;
    g_launcherPort = boundPort;

    g_pLauncherSvr = std::make_unique<httplib::Server>();
    auto& svr = *g_pLauncherSvr;

    svr.set_socket_options([](socket_t sock) {
        int opt = 1;
        setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));
    });

    svr.set_exception_handler([](const auto&, auto& res, std::exception_ptr) {
        res.status = 200;
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        res.set_content(GetLauncherHtml(g_uiDir, g_baseDir), "text/html; charset=utf-8");
    });

    svr.set_error_handler([](const auto&, auto& res) {
        if (res.status == 404 || res.status >= 500) {
            res.status = 200;
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_header("Cache-Control", "no-store");
            res.set_content(GetLauncherHtml(g_uiDir, g_baseDir), "text/html; charset=utf-8");
        }
    });

    auto serveHtml = [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        std::string html = GetLauncherHtml(g_uiDir, g_baseDir);
        res.set_content(html, "text/html; charset=utf-8");
    };

    svr.Get("/", serveHtml);
    svr.Get("/index.html", serveHtml);
    svr.Get("/launcher", serveHtml);
    svr.Get("/launcher/", serveHtml);
    svr.Get("/launcher/index.html", serveHtml);

    svr.Get(R"(/launcher/(.+))", [](const httplib::Request& req, httplib::Response& res) {
        std::string name = req.matches[1];
        if (name.find("..") != std::string::npos) { res.status = 400; return; }
        std::string data = ReadTextFile(g_uiDir + "\\" + name);
        if (data.empty()) data = ReadTextFile(g_baseDir + "\\" + name);
        if (data.empty()) data = ReadTextFile(g_baseDir + "\\client-new\\launcher\\" + name);
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        if (data.empty()) {
            if (name.find(".html") != std::string::npos || name.empty()) {
                res.set_content(GetLauncherHtml(g_uiDir, g_baseDir), "text/html; charset=utf-8");
                return;
            }
            res.status = 404; res.set_content("Not Found", "text/plain"); return;
        }
        res.set_content(data, ContentTypeFor(name));
    });

    svr.Get("/api/config", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        res.set_content("{\"masterlistUrl\":" + JsonStr(g_masterlistUrl) + ",\"version\":\"" GTAMP_LAUNCHER_VERSION "\"}", "application/json");
    });

    svr.Get("/api/heartbeat", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        res.set_content("{\"ok\":true}", "application/json");
    });

    svr.Get("/api/ping", [](const httplib::Request& req, httplib::Response& res) {
        std::string host = req.get_param_value("host");
        int port = 7788; try { port = std::stoi(req.get_param_value("port")); } catch (...) {}
        int ms = host.empty() ? -1 : TcpPingMs(host, port);
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        res.set_content("{\"ms\":" + std::to_string(ms) + "}", "application/json");
    });

    svr.Post("/api/connect", [](const httplib::Request& req, httplib::Response& res) {
        std::string host = JsonField(req.body, "host");
        std::string port = JsonField(req.body, "port");
        std::string name = JsonField(req.body, "name");
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        if (host.empty()) { res.status = 400; res.set_content("{\"error\":\"host required\"}", "application/json"); return; }
        if (port.empty()) port = "7788";
        {
            std::lock_guard<std::mutex> lk(g_launcherState.m);
            g_launcherState.pendingConnectAddr = host + ":" + port;
            g_launcherState.pendingServerName = name.empty() ? (host + ":" + port) : name;
            g_launcherState.currentServer = host + ":" + port;
            g_launcherState.serverName = g_launcherState.pendingServerName;
            g_launcherState.gameState = "connecting";
            g_launcherState.disconnectRequested = false;
            g_launcherState.hasConnectPending = true;
        }
        res.set_content("{\"ok\":true,\"address\":" + JsonStr(host + ":" + port) + "}", "application/json");
        g_launcherState.cv.notify_all();
    });

    svr.Get("/api/gamestate", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        std::lock_guard<std::mutex> lk(g_launcherState.m);
        std::string json = "{"
            "\"state\":\"" + g_launcherState.gameState + "\","
            "\"server\":\"" + g_launcherState.currentServer + "\","
            "\"serverName\":" + JsonStr(g_launcherState.serverName) + ","
            "\"clientId\":\"" + g_launcherState.clientId + "\""
        "}";
        res.set_content(json, "application/json");
    });

    svr.Post("/api/disconnect", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        std::string sAddr, cid;
        {
            std::lock_guard<std::mutex> lk(g_launcherState.m);
            g_launcherState.disconnectRequested = true;
            sAddr = g_launcherState.currentServer;
            cid = g_launcherState.clientId;
            g_launcherState.gameState = "idle";
            g_launcherState.currentServer = "";
            g_launcherState.serverName = "";
        }
        KillProcessByName("altv.exe");
        KillProcessByName("GTA5.exe");
        NotifyPlayerLeave(g_masterlistUrl, sAddr, cid);
        res.set_content("{\"ok\":true}", "application/json");
    });

    svr.Post("/api/quit", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        res.set_content("{\"ok\":true}", "application/json");
        {
            std::lock_guard<std::mutex> lk(g_launcherState.m);
            g_launcherState.shouldQuit = true;
            g_launcherState.disconnectRequested = true;
        }
        KillProcessByName("altv.exe");
        KillProcessByName("GTA5.exe");
        g_launcherState.cv.notify_all();
    });

    svr.Get("/api/localserver", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        try {
            httplib::Client localCli("127.0.0.1", 7799);
            localCli.set_connection_timeout(0, 500000);
            localCli.set_read_timeout(0, 500000);
            if (auto r = localCli.Get("/discord.json")) {
                res.status = r->status;
                res.set_content(r->body, "application/json");
                return;
            }
        } catch (...) {}
        res.status = 502;
        res.set_content("{\"error\":\"Local server not running\"}", "application/json");
    });

    svr.Post("/api/auth/login", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        try {
            httplib::Client webCli("127.0.0.1", 3000);
            webCli.set_connection_timeout(1, 0);
            webCli.set_read_timeout(2, 0);
            if (auto r = webCli.Post("/api/auth/login", req.body, "application/json")) {
                res.status = r->status;
                res.set_content(r->body, "application/json");
                return;
            }
        } catch (...) {}
        res.status = 502;
        res.set_content("{\"error\":\"Website backend not reachable\"}", "application/json");
    });

    svr.Post("/api/auth/register", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        try {
            httplib::Client webCli("127.0.0.1", 3000);
            webCli.set_connection_timeout(1, 0);
            webCli.set_read_timeout(2, 0);
            if (auto r = webCli.Post("/api/auth/register", req.body, "application/json")) {
                res.status = r->status;
                res.set_content(r->body, "application/json");
                return;
            }
        } catch (...) {}
        res.status = 502;
        res.set_content("{\"error\":\"Website backend not reachable\"}", "application/json");
    });

    svr.Post("/api/auth/avatar", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        try {
            httplib::Client webCli("127.0.0.1", 3000);
            webCli.set_connection_timeout(1, 0);
            webCli.set_read_timeout(2, 0);
            if (auto r = webCli.Post("/api/auth/avatar", req.body, "application/json")) {
                res.status = r->status;
                res.set_content(r->body, "application/json");
                return;
            }
        } catch (...) {}
        res.status = 502;
        res.set_content("{\"error\":\"Website backend not reachable\"}", "application/json");
    });

    svr.Get("/api/launcher/ping", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Cache-Control", "no-store");
        std::string id = req.get_param_value("id");
        std::string mlHost = "127.0.0.1";
        int mlPort = 8080;
        std::string u = g_masterlistUrl;
        if (u.rfind("http://", 0) == 0) u = u.substr(7);
        else if (u.rfind("https://", 0) == 0) u = u.substr(8);
        size_t slash = u.find('/');
        std::string mlHostPort = (slash != std::string::npos) ? u.substr(0, slash) : u;
        size_t col = mlHostPort.find(':');
        if (col != std::string::npos) {
            mlHost = mlHostPort.substr(0, col);
            try { mlPort = std::stoi(mlHostPort.substr(col + 1)); } catch (...) {}
        } else {
            mlHost = mlHostPort;
        }

        try {
            httplib::Client mlCli(mlHost.c_str(), mlPort);
            mlCli.set_connection_timeout(1, 0);
            mlCli.set_read_timeout(1, 0);
            if (auto r = mlCli.Get(("/api/launcher/ping?id=" + id).c_str())) {
                res.status = r->status;
                res.set_content(r->body, "application/json");
                return;
            }
        } catch (...) {}
        res.set_content("{\"ok\":true,\"activeLaunchers\":1}", "application/json");
    });

    svr.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Headers", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    });

    if (!svr.bind_to_port("127.0.0.1", boundPort)) {
        for (int p = boundPort + 1; p < GTAMP_LAUNCHER_PORT + 30; p++) {
            if (svr.bind_to_port("127.0.0.1", p)) {
                boundPort = p;
                break;
            }
        }
    }

    g_launcherSvrThread = std::thread([]() {
        if (g_pLauncherSvr) {
            g_pLauncherSvr->listen_after_bind();
        }
    });
    g_pLauncherSvr->wait_until_ready();
    std::this_thread::sleep_for(std::chrono::milliseconds(100));

#ifdef _WIN32
    if (openBrowser) OpenInAppWindow("http://127.0.0.1:" + std::to_string(boundPort) + "/", &g_hUiProcess);
#else
    if (openBrowser) OpenInBrowser("http://127.0.0.1:" + std::to_string(boundPort) + "/");
#endif

    std::thread([]() {
        while (!g_launcherState.shouldQuit) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
            if (g_launcherState.shouldQuit) break;
#ifdef _WIN32
            if (g_hUiProcess != NULL) {
                DWORD exitCode = 0;
                if (GetExitCodeProcess(g_hUiProcess, &exitCode) && exitCode != STILL_ACTIVE) {
                    bool isInGame = false;
                    {
                        std::lock_guard<std::mutex> lk(g_launcherState.m);
                        isInGame = (g_launcherState.gameState == "in_game" || g_launcherState.gameState == "connecting");
                    }
                    if (!isInGame) {
                        std::lock_guard<std::mutex> lk(g_launcherState.m);
                        g_launcherState.shouldQuit = true;
                        g_launcherState.cv.notify_all();
                        break;
                    }
                }
            }
#endif
        }
    }).detach();

    return true;
}

inline bool WaitForConnect(std::string& outAddr, std::string& outName) {
    std::unique_lock<std::mutex> lk(g_launcherState.m);
    while (!g_launcherState.shouldQuit && !g_launcherState.hasConnectPending) {
        g_launcherState.cv.wait_for(lk, std::chrono::milliseconds(500));
    }
    if (g_launcherState.shouldQuit) return false;

    outAddr = g_launcherState.pendingConnectAddr;
    outName = g_launcherState.pendingServerName;
    g_launcherState.hasConnectPending = false;
    return true;
}

inline void StopLauncherServer() {
    {
        std::lock_guard<std::mutex> lk(g_launcherState.m);
        g_launcherState.shouldQuit = true;
    }
    if (g_pLauncherSvr) {
        g_pLauncherSvr->stop();
    }
    if (g_launcherSvrThread.joinable()) {
        g_launcherSvrThread.join();
    }
#ifdef _WIN32
    if (g_hUiProcess) {
        CloseHandle(g_hUiProcess);
        g_hUiProcess = NULL;
    }
#endif
}

inline std::string RunServerBrowser(const std::string& baseDir, const std::string& masterlistUrl,
                                    bool openBrowser = true, int idleTimeoutSec = 0) {
    if (!StartLauncherServer(baseDir, masterlistUrl, openBrowser, idleTimeoutSec)) {
        return "";
    }
    std::string addr, name;
    if (!WaitForConnect(addr, name)) return "";
    return addr;
}

} // namespace gtamp
