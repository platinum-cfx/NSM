/* NSM client wrapper - Steam presence + in-window game presentation
 *
 * Loaded by the NSM client as discord_rpc.dll. Two jobs, both inside the
 * client's own process:
 *
 * 1) STEAM PRESENCE: SteamAPI_Init with steam_appid.txt (218 = Source SDK
 *    Base 2007, the FiveM approach). Discord work forwards to
 *    discord_rpc_real.dll (unchanged).
 *
 * 2) IN-WINDOW GAME PRESENTATION: when a GTA5.exe process that STARTED
 *    AFTER the client (i.e. the game NSM launched when you clicked
 *    Connect) creates its window, that window is re-parented INTO the
 *    client's main window as a WS_CHILD that fills the client area and
 *    follows resizes. One visible window, one taskbar entry. When the
 *    game exits, its window dies and the server browser is visible again
 *    in the same window - reconnect without restart.
 *
 *    Detection is by process NAME (GTA5.exe, any install path - the real
 *    client launches the user's installed/copied GTA V wherever it
 *    lives) plus a creation-time guard: only games started AFTER the
 *    client process are touched, never a GTA V that was already running.
 *    Documented Win32 window APIs only (SetParent/SetWindowLongPtr/
 *    MoveWindow/AttachThreadInput + a WM_SIZE subclass on OUR OWN
 *    window). No injection into the game, no patching, no DRM/anti-cheat
 *    interference. If anything fails, the game stays a normal window -
 *    nothing breaks. If this DLL ever ends up loaded inside GTA5.exe
 *    itself, both threads exit immediately (self-guard).
 *
 * Build: x86_64-w64-mingw32-gcc -shared -O2 -o discord_rpc.dll \
 *   nsm-steam-presence-source.c discord.def -ladvapi32 -luser32
 */
#include <windows.h>
#include <stdio.h>
#include <string.h>
#include <tlhelp32.h>

typedef int (*SteamAPI_Init_t)(void);

static int try_init(const char *dllPath)
{
    HMODULE m = LoadLibraryA(dllPath);
    SteamAPI_Init_t init;
    if (!m) return 0;
    init = (SteamAPI_Init_t)(void *)GetProcAddress(m, "SteamAPI_Init");
    if (init && init()) return 1;
    return 0;
}

/* case-insensitive "is our host process this exe?" */
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

static ULONGLONG ft_to_u64(const FILETIME *ft)
{
    return ((ULONGLONG)ft->dwHighDateTime << 32) | ft->dwLowDateTime;
}

/* PID of the game NSM launched: any GTA5.exe whose process was created
   AFTER our own process started. A GTA V already running before the
   client was opened is never touched. */
static DWORD find_game_pid(void)
{
    HANDLE snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    PROCESSENTRY32 pe;
    BOOL ok;
    DWORD result = 0;
    FILETIME c, e, k, u;
    ULONGLONG ourStart = 0;

    if (GetProcessTimes(GetCurrentProcess(), &c, &e, &k, &u))
        ourStart = ft_to_u64(&c);
    if (snap == INVALID_HANDLE_VALUE) return 0;
    pe.dwSize = sizeof pe;
    ok = Process32First(snap, &pe);
    while (ok && !result) {
        if (_stricmp(pe.szExeFile, "GTA5.exe") == 0 &&
            pe.th32ProcessID != GetCurrentProcessId()) {
            HANDLE h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION,
                                   FALSE, pe.th32ProcessID);
            if (h) {
                if (ourStart == 0 ||
                    (GetProcessTimes(h, &c, &e, &k, &u) && ft_to_u64(&c) > ourStart))
                    result = pe.th32ProcessID;
                CloseHandle(h);
            }
        }
        ok = Process32Next(snap, &pe);
    }
    CloseHandle(snap);
    return result;
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

struct OwnCtx { DWORD pid; HWND wnd; };

static BOOL CALLBACK enum_own_cb(HWND hwnd, LPARAM lp)
{
    struct OwnCtx *ctx = (struct OwnCtx *)lp;
    DWORD wpid = 0;
    GetWindowThreadProcessId(hwnd, &wpid);
    if (wpid != ctx->pid) return TRUE;
    if (!IsWindowVisible(hwnd)) return TRUE;
    if (GetWindow(hwnd, GW_OWNER) != NULL) return TRUE;
    if (GetWindowLongA(hwnd, GWL_EXSTYLE) & WS_EX_TOOLWINDOW) return TRUE;
    if (!ctx->wnd) ctx->wnd = hwnd;   /* first = main window */
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
    struct OwnCtx oc;
    DWORD hostThread, gameThread;
    LONG_PTR st;
    HWND host;

    oc.pid = GetCurrentProcessId(); oc.wnd = NULL;
    EnumWindows(enum_own_cb, (LPARAM)&oc);
    host = oc.wnd;
    if (!host) return;
    if (IsIconic(host)) ShowWindow(host, SW_RESTORE);

    st = GetWindowLongPtrA(gameWnd, GWL_STYLE);
    SetWindowLongPtrA(gameWnd, GWL_STYLE,
        (st & ~(LONG_PTR)(WS_POPUP | WS_CAPTION | WS_THICKFRAME |
                          WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU))
        | (LONG_PTR)WS_CHILD);

    hostThread = GetWindowThreadProcessId(host, NULL);
    gameThread = GetWindowThreadProcessId(gameWnd, NULL);
    if (hostThread != gameThread) AttachThreadInput(hostThread, gameThread, TRUE);

    if (SetParent(gameWnd, host) != NULL) {
        if (!g_origProc)
            g_origProc = (WNDPROC)SetWindowLongPtrA(host, GWLP_WNDPROC,
                                                    (LONG_PTR)host_subclass_proc);
        g_hostWnd = host;
        g_gameWnd = gameWnd;
        fit_game();
        SetFocus(gameWnd);
    } else {
        SetWindowLongPtrA(gameWnd, GWL_STYLE, st);  /* graceful fallback */
    }

    if (hostThread != gameThread) AttachThreadInput(hostThread, gameThread, FALSE);
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

static DWORD WINAPI embed_thread(LPVOID unused)
{
    (void)unused;
    if (own_exe_is("GTA5.exe")) return 0;   /* never act inside the game */
    Sleep(1500);
    for (;;) {
        DWORD gamePid = find_game_pid();
        if (gamePid && !g_gameWnd) {
            HWND gw = NULL;
            for (int tries = 0; tries < 180 && !gw; tries++) {
                struct PidCtx ctx;
                ctx.pid = gamePid; ctx.best = NULL; ctx.fallback = NULL;
                EnumWindows(enum_windows_cb, (LPARAM)&ctx);
                gw = ctx.best ? ctx.best : ctx.fallback;
                if (!gw) { Sleep(500); gamePid = find_game_pid(); if (!gamePid) break; }
            }
            if (gw && gamePid) try_embed(gw);
        }
        if (g_gameWnd) {
            if (IsWindow(g_gameWnd)) keep_embedded();
            else { g_gameWnd = NULL; g_hostWnd = NULL; }  /* game exited */
        }
        Sleep(700);
    }
    return 0;
}

BOOL WINAPI DllMain(HINSTANCE h, DWORD reason, LPVOID reserved)
{
    (void)reserved;
    if (reason == DLL_PROCESS_ATTACH) {
        DisableThreadLibraryCalls(h);
        CreateThread(NULL, 0, steam_thread, NULL, 0, NULL);
        CreateThread(NULL, 0, embed_thread, NULL, 0, NULL);
    }
    return TRUE;
}
