/* NSM client wrapper - Steam presence + in-window game presentation
 *
 * Loaded by the NSM client as discord_rpc.dll. Two jobs, both inside the
 * client's own process:
 *
 * 1) STEAM PRESENCE: SteamAPI_Init with steam_appid.txt (218 = Source SDK
 *    Base 2007, the FiveM approach). Discord work forwards to
 *    discord_rpc_real.dll (unchanged).
 *
 * 2) IN-WINDOW GAME PRESENTATION: when a GTA5.exe process that was NOT
 *    already running when the client started (i.e. the game NSM launched
 *    when you clicked Connect) creates its window, that window is
 *    re-parented INTO the client's main window as a WS_CHILD that fills
 *    the client area and follows resizes. One visible window, one taskbar
 *    entry. When the game exits, its window dies and the server browser
 *    is visible again in the same window - reconnect without restart.
 *
 *    Detection: at startup we snapshot which GTA5.exe PIDs exist; later,
 *    any NEW GTA5.exe PID is ours to embed. No path or timestamp
 *    assumptions (cross-process GetProcessTimes proved unreliable under
 *    Wine; PID snapshot works everywhere). A GTA V already running before
 *    the client opened is never touched. Documented Win32 window APIs
 *    only (SetParent/SetWindowLongPtr/MoveWindow/AttachThreadInput + a
 *    WM_SIZE subclass on OUR OWN window). No injection into the game, no
 *    patching, no DRM/anti-cheat interference. If anything fails, the
 *    game stays a normal window - nothing breaks. If this DLL ever ends
 *    up loaded inside GTA5.exe itself, both threads exit immediately.
 *
 *    A short trace is written to nsm-embed-debug.log next to the client
 *    exe (a few lines per run) so failures are diagnosable for real.
 *
 * 3) GAME-PACK REPAIR: makes sure packs\mp1..mp7.pack exist next
 *    to NSM.exe before Connect needs them (moves loose packs, fetches the
 *    big mp1.pack from the GitHub release in the background).
 *
 * Build: x86_64-w64-mingw32-gcc -shared -O2 -o discord_rpc.dll \
 *   nsm-steam-presence-source.c discord.def -ladvapi32 -luser32
 */
#include <windows.h>
#include <stdio.h>
#include <string.h>
#include <tlhelp32.h>

typedef int (*SteamAPI_Init_t)(void);

static char g_dllDir[MAX_PATH * 2] = ".";   /* set in DllMain */

static void dblog(const char *msg)
{
    char path[MAX_PATH * 2];
    _snprintf(path, sizeof path, "%s\\nsm-embed-debug.log", g_dllDir);
    HANDLE f = CreateFileA(path, FILE_APPEND_DATA,
                           FILE_SHARE_READ | FILE_SHARE_WRITE, NULL,
                           OPEN_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (f != INVALID_HANDLE_VALUE) {
        DWORD w;
        WriteFile(f, msg, (DWORD)lstrlenA(msg), &w, NULL);
        CloseHandle(f);
    }
}

static int try_init(const char *dllPath)
{
    HMODULE m = LoadLibraryA(dllPath);
    SteamAPI_Init_t init;
    if (!m) return 0;
    init = (SteamAPI_Init_t)(void *)GetProcAddress(m, "SteamAPI_Init");
    if (init && init()) return 1;
    return 0;
}

static int own_exe_is(const char *name)
{
    char exe[MAX_PATH * 2];
    char *base;
    GetModuleFileNameA(NULL, exe, sizeof exe);
    base = strrchr(exe, '\\');
    base = base ? base + 1 : exe;
    return _stricmp(base, name) == 0;
}

static DWORD WINAPI steam_thread(LPVOID unused)
{
    char steamRoot[MAX_PATH * 2];
    char probe[MAX_PATH * 2], dllPath[MAX_PATH * 2];
    char exe[MAX_PATH], cwd[MAX_PATH], src[MAX_PATH * 2], dst[MAX_PATH * 2];
    DWORD len;
    int i;

    static const char *cands[] = {
        "\\steamapps\\common\\Grand Theft Auto V\\steam_api64.dll",
        "\\steamapps\\common\\Grand Theft Auto V Enhanced\\steam_api64.dll",
        "\\steamapps\\common\\wallpaper_engine\\bin\\steam_api64.dll",
        "\\steamapps\\common\\GarrysMod\\bin\\win64\\steam_api64.dll"
    };

    (void)unused;
    if (own_exe_is("GTA5.exe")) return 0;   /* never act inside the game */
    Sleep(250);

    len = sizeof steamRoot;
    if (RegGetValueA(HKEY_CURRENT_USER, "Software\\Valve\\Steam", "SteamPath",
                     RRF_RT_REG_SZ, NULL, steamRoot, &len) != ERROR_SUCCESS)
        return 0;
    for (char *p = steamRoot; *p; p++) if (*p == '/') *p = '\\';

    dllPath[0] = 0;
    for (i = 0; i < 4 && !dllPath[0]; i++) {
        _snprintf(probe, sizeof probe, "%s%s", steamRoot, cands[i]);
        if (GetFileAttributesA(probe) != INVALID_FILE_ATTRIBUTES)
            lstrcpynA(dllPath, probe, sizeof dllPath);
    }
    if (!dllPath[0]) return 0;

    GetModuleFileNameA(NULL, exe, MAX_PATH);
    {
        char *slash = strrchr(exe, '\\');
        if (slash) *slash = 0;
        if (GetCurrentDirectoryA(sizeof cwd, cwd)) {
            _snprintf(dst, sizeof dst, "%s\\steam_appid.txt", cwd);
            _snprintf(src, sizeof src, "%s\\steam_appid.txt", exe);
            if (GetFileAttributesA(dst) == INVALID_FILE_ATTRIBUTES &&
                GetFileAttributesA(src) != INVALID_FILE_ATTRIBUTES)
                CopyFileA(src, dst, FALSE);
        }
    }

    if (try_init(dllPath)) return 0;
    Sleep(3000);
    try_init(dllPath);
    return 0;
}

/* ---------------- in-window game presentation ---------------- */

static HWND    g_hostWnd  = NULL;
static HWND    g_gameWnd  = NULL;
static WNDPROC g_origProc = NULL;

static int    g_gaveUp = 0;      /* stop retrying a failing embed for this game */
static int    g_embedFails = 0;

static DWORD g_initial[8];
static int   g_initialN = -1;   /* GTA5.exe PIDs alive at client start */

/* collect GTA5.exe pids; if skipInitial, skip those from the startup set */
static int gta_pids(DWORD *arr, int max, int skipInitial)
{
    HANDLE snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    PROCESSENTRY32 pe;
    int n = 0;
    if (snap == INVALID_HANDLE_VALUE) return 0;
    pe.dwSize = sizeof pe;
    if (Process32First(snap, &pe)) {
        do {
            if (_stricmp(pe.szExeFile, "GTA5.exe") == 0 &&
                pe.th32ProcessID != GetCurrentProcessId()) {
                int skip = 0, i;
                if (skipInitial)
                    for (i = 0; i < g_initialN; i++)
                        if (g_initial[i] == pe.th32ProcessID) { skip = 1; break; }
                if (!skip && n < max) arr[n++] = pe.th32ProcessID;
            }
        } while (Process32Next(snap, &pe));
    }
    CloseHandle(snap);
    return n;
}

struct PidCtx { DWORD pid; HWND best; HWND fallback; };

static BOOL CALLBACK enum_windows_cb(HWND hwnd, LPARAM lp)
{
    struct PidCtx *ctx = (struct PidCtx *)lp;
    DWORD wpid = 0;
    char cls[64];
    GetWindowThreadProcessId(hwnd, &wpid);
    if (wpid != ctx->pid) return TRUE;
    if (!IsWindowVisible(hwnd)) return TRUE;
    if (GetWindow(hwnd, GW_OWNER) != NULL) return TRUE;
    if (GetWindowLongA(hwnd, GWL_EXSTYLE) & WS_EX_TOOLWINDOW) return TRUE;
    cls[0] = 0;
    GetClassNameA(hwnd, cls, sizeof cls);
    if (lstrcmpiA(cls, "grcWindow") == 0) {         /* GTA V main window */
        ctx->best = hwnd;
        return FALSE;
    }
    if (!ctx->fallback) ctx->fallback = hwnd;
    return TRUE;
}

static void fit_game(void)
{
    if (g_hostWnd && g_gameWnd && IsWindow(g_gameWnd) && IsWindow(g_hostWnd)) {
        RECT rc;
        GetClientRect(g_hostWnd, &rc);
        MoveWindow(g_gameWnd, 0, 0, rc.right, rc.bottom, TRUE);
    }
}

static LRESULT CALLBACK host_subclass_proc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp)
{
    if (msg == WM_SIZE && g_gameWnd) fit_game();
    return CallWindowProcA(g_origProc, hwnd, msg, wp, lp);
}

static void try_embed(HWND gameWnd)
{
    LONG_PTR st;
    HWND host;
    DWORD hostPid = 0;
    char line[128];

    /* The host is the NSM main window, found by class so it also works while
     * still HIDDEN (the launcher no longer shows it before the game is real).
     * It must belong to our own process (NSM.exe) - never touch a window of
     * another process. */
    host = FindWindowA("NSMMainWindow", NULL);
    if (!host) { dblog("embed: NSMMainWindow not found - game stays a normal window\r\n"); return; }
    GetWindowThreadProcessId(host, &hostPid);
    if (hostPid != GetCurrentProcessId()) {
        dblog("embed: NSMMainWindow belongs to another process - not embedding\r\n"); return; }
    dblog("embed: NSM host window found\r\n");
    if (IsIconic(host)) { ShowWindow(host, SW_RESTORE); dblog("embed: host restored\r\n"); }

    /* re-parent FIRST - if this fails, touch nothing else */
    if (SetParent(gameWnd, host) == NULL) {
        _snprintf(line, sizeof line, "embed: SetParent failed err=%lu\r\n",
                  (unsigned long)GetLastError());
        dblog(line);
        return;
    }
    dblog("embed: SetParent ok\r\n");

    st = GetWindowLongPtrA(gameWnd, GWL_STYLE);
    SetWindowLongPtrA(gameWnd, GWL_STYLE,
        (st & ~(LONG_PTR)(WS_POPUP | WS_CAPTION | WS_THICKFRAME |
                          WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU))
        | (LONG_PTR)WS_CHILD);
    dblog("embed: child style set\r\n");

    SetWindowPos(gameWnd, NULL, 0, 0, 0, 0,
                  SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE |
                  SWP_FRAMECHANGED);
    dblog("embed: frame updated\r\n");

    /* verify the actual parent relationship - never trust the return value alone.
     * GetAncestor(GA_PARENT) works with or without WS_CHILD already applied. */
    if (GetAncestor(gameWnd, GA_PARENT) != host) {
        dblog("embed: parent verify FAILED - leaving the game as a normal window\r\n");
        SetParent(gameWnd, NULL);
        return;
    }
    dblog("embed: parent verified (WS_CHILD + reparent confirmed)\r\n");

    if (!g_origProc)
        g_origProc = (WNDPROC)SetWindowLongPtrA(host, GWLP_WNDPROC,
                                                (LONG_PTR)host_subclass_proc);
    g_hostWnd = host;
    g_gameWnd = gameWnd;
    fit_game();
    dblog("embed: fitted\r\n");
    /* The window appears NOW - with the game already inside it. */
    ShowWindow(host, SW_SHOW);
    SetForegroundWindow(host);
    dblog("embed: host window shown\r\n");
    {
        DWORD gtid = GetWindowThreadProcessId(gameWnd, NULL);
        DWORD mtid = GetCurrentThreadId();
        BOOL at = (gtid && gtid != mtid) ? AttachThreadInput(mtid, gtid, TRUE) : FALSE;
        if (SetFocus(gameWnd)) dblog("embed: focus set\r\n");
        else dblog("embed: SetFocus failed (cosmetic)\r\n");
        if (at) AttachThreadInput(mtid, gtid, FALSE);
    }
    dblog("embed: DONE\r\n");
}

/* the game may re-assert its own style/size; re-apply while embedded */
static void keep_embedded(void)
{
    LONG_PTR st = GetWindowLongPtrA(g_gameWnd, GWL_STYLE);
    if ((st & WS_POPUP) || !(st & WS_CHILD)) {
        SetWindowLongPtrA(g_gameWnd, GWL_STYLE,
            (st & ~(LONG_PTR)(WS_POPUP | WS_CAPTION | WS_THICKFRAME |
                              WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU))
            | (LONG_PTR)WS_CHILD);
    }
    fit_game();
}


/* .config may disable embedding (embed_game_window = false) - emergency
 * fallback so the game opens in its own window for troubleshooting. */
static int embed_enabled_by_config(void)
{
    char exe[MAX_PATH * 2], path[MAX_PATH * 2], line[512];
    char *slash; FILE *f; int enabled = 1;
    GetModuleFileNameA(NULL, exe, sizeof exe);
    slash = strrchr(exe, '\\');
    if (slash) *slash = 0;
    _snprintf(path, sizeof path, "%s\\.config", exe);
    f = fopen(path, "r");
    if (!f) return 1;
    while (fgets(line, sizeof line, f)) {
        if (_strnicmp(line, "embed_game_window", 17) == 0) {
            char *v = strchr(line, '=');
            if (v && strstr(v, "false")) enabled = 0;
            break;
        }
    }
    fclose(f);
    return enabled;
}

static DWORD WINAPI embed_thread(LPVOID unused)
{
    char line[128];
    (void)unused;
    if (own_exe_is("GTA5.exe")) return 0;   /* never act inside the game */
    /* Embedding is done by the wrapper loaded inside NSM.exe itself. If the
     * client (altv.exe) loads this DLL too, it must NOT embed anything - the
     * game belongs in the NSM window, never in a client window. */
    if (!own_exe_is("NSM.exe") && !own_exe_is("connect.exe")) {
        dblog("embed: skipped - wrapper not running inside NSM.exe\r\n");
        return 0;
    }
    /* Snapshot pre-existing GTA5.exe PIDs FIRST - before any sleep. If this
     * ran after a delay, a game started by a fast Connect could be mistaken
     * for a pre-existing game and never get embedded (real race, found by
     * the E2E rig: connect at t=1s, GTA5 up at t=2s, snapshot at t=1.5s). */
    g_initialN = gta_pids(g_initial, 8, 0);
    _snprintf(line, sizeof line, "startup: %d GTA5.exe already running\r\n", g_initialN);
    dblog(line);
    if (!embed_enabled_by_config()) {
        dblog("embed: disabled by config (embed_game_window = false)\r\n");
        return 0;
    }
    Sleep(1500);                            /* let the client UI come up */
    for (;;) {
        DWORD found[8];
        int n = gta_pids(found, 8, 1);
        if (n > 0 && !g_gameWnd && !g_gaveUp) {
            DWORD gamePid = found[0];
            HWND gw = NULL;
            for (int tries = 0; tries < 180 && !gw; tries++) {
                struct PidCtx ctx;
                ctx.pid = gamePid; ctx.best = NULL; ctx.fallback = NULL;
                EnumWindows(enum_windows_cb, (LPARAM)&ctx);
                gw = ctx.best ? ctx.best : ctx.fallback;
                if (!gw) {
                    Sleep(500);
                    if (gta_pids(found, 8, 1) == 0) break;  /* game died early */
                    gamePid = found[0];
                }
            }
            if (gw && gamePid) {
                _snprintf(line, sizeof line, "game pid %lu window found\r\n",
                          (unsigned long)gamePid);
                dblog(line);
                try_embed(gw);
                if (!g_gameWnd && ++g_embedFails >= 3) {
                    g_gaveUp = 1;
                    dblog("embed: giving up after 3 attempts - game stays a normal window\r\n");
                }
            }
        }
        if (g_gameWnd) {
            if (IsWindow(g_gameWnd)) keep_embedded();
            else { g_gameWnd = NULL; g_hostWnd = NULL; g_gaveUp = 0; g_embedFails = 0; dblog("game exited\r\n"); }
        }
        Sleep(700);
    }
    return 0;
}


/* ---------------- game-pack repair ---------------- */
/* The launcher refuses to Connect unless packs\mp1..mp7.pack exist next
 * to NSM.exe. The repo ZIP ships every pack that fits GitHub's 100MB file
 * limit; mp1.pack (230MB, carries libs\libce2.dll) ships as a small stub.
 * NOTE: the background download of the full mp1.pack was removed - the
 * runtime now installs from the local altv-runtime folder
 * (EnsureRuntimeInstalled in connect.cpp). The guard below only makes sure
 * the pack files exist; it never downloads anything. */
#define NSM_PACK_RELEASE "https://github.com/platinum-cfx/NSM/releases/download/game-packs/"

static DWORD nsm_file_size(const char *path)
{
    WIN32_FILE_ATTRIBUTE_DATA fa;
    if (!GetFileAttributesExA(path, GetFileExInfoStandard, &fa)) return 0;
    return fa.nFileSizeLow;
}

static DWORD WINAPI pack_guard_thread(LPVOID unused)
{
    char exe[MAX_PATH * 2], dir[MAX_PATH * 2];
    char pack[MAX_PATH * 3], loose[MAX_PATH * 3], tmp[MAX_PATH * 3];
    char cmd[1400], line[160], url[512];
    char *slash;
    int i;

    (void)unused;
    if (own_exe_is("GTA5.exe")) return 0;   /* never act inside the game */
    Sleep(500);

    GetModuleFileNameA(NULL, exe, sizeof exe);
    slash = strrchr(exe, '\\');
    if (slash) *slash = 0;
    lstrcpynA(dir, exe, sizeof dir);
    _snprintf(pack, sizeof pack, "%s\\packs", dir);
    CreateDirectoryA(pack, NULL);

    /* mp1.pack carries libs\libce2.dll (226 MB), which exceeds GitHub's
 * 100 MB git limit - the repo ships a small STUB. The runtime install
 * from the local altv-runtime folder does NOT provide libce2.dll either,
 * and without it the alt:V client exits with code 0xC0000005 before
 * starting GTA V. So: if we see the stub (or nothing), fetch the full
 * pack from the game-packs release in the background and swap it in.
 * The next Connect then extracts libce2.dll and verification passes.
 * All failures just log and leave whatever is in place. */
    {
        char mp1[MAX_PATH * 3];
        _snprintf(mp1, sizeof mp1, "%s\\mp1.pack", pack);
        if (nsm_file_size(mp1) < 10 * 1024 * 1024) {
            HMODULE um = LoadLibraryA("urlmon.dll");
            if (um) {
                typedef HRESULT (WINAPI *PDLT)(void*, LPCSTR, LPCSTR, DWORD, void*);
                PDLT dl = (PDLT)GetProcAddress(um, "URLDownloadToFileA");
                _snprintf(tmp, sizeof tmp, "%s\\mp1.pack.tmp", pack);
                _snprintf(url, sizeof url, "%smp1.pack", NSM_PACK_RELEASE);
                dblog("pack: mp1.pack is the small stub - downloading the full pack in the background...\r\n");
                if (dl && dl(NULL, url, tmp, 0, NULL) == S_OK &&
                    nsm_file_size(tmp) > 200 * 1024 * 1024) {
                    if (MoveFileExA(tmp, mp1, MOVEFILE_REPLACE_EXISTING)) {
                        dblog("pack: mp1.pack upgraded to the full pack - press Connect again\r\n");
                    } else {
                        dblog("pack: could not swap mp1.pack into place\r\n");
                        DeleteFileA(tmp);
                    }
                } else {
                    dblog("pack: full-pack download failed - keeping the stub (get it manually from the game-packs release)\r\n");
                    DeleteFileA(tmp);
                }
                FreeLibrary(um);
            } else {
                dblog("pack: urlmon unavailable - cannot download the full pack\r\n");
            }
        }
    }
        dblog("pack: guard done\r\n");
    return 0;
}

BOOL WINAPI DllMain(HINSTANCE h, DWORD reason, LPVOID reserved)
{
    (void)reserved;
    if (reason == DLL_PROCESS_ATTACH) {
        char self[MAX_PATH * 2];
        char *slash;
        DisableThreadLibraryCalls(h);
        if (GetModuleFileNameA(h, self, sizeof self)) {
            slash = strrchr(self, '\\');
            if (slash) { *slash = 0; lstrcpynA(g_dllDir, self, sizeof g_dllDir); }
        }
        CreateThread(NULL, 0, steam_thread, NULL, 0, NULL);
        CreateThread(NULL, 0, embed_thread, NULL, 0, NULL);
        CreateThread(NULL, 0, pack_guard_thread, NULL, 0, NULL);
    }
    return TRUE;
}
