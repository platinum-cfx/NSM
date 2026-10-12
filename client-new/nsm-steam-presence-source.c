/* NSM client wrapper - Steam presence + in-window game presentation
 *
 * The NSM client loads discord_rpc.dll from its own folder at startup.
 * This wrapper takes that place and does two jobs inside the client's
 * own process:
 *
 * 1) STEAM PRESENCE (the FiveM approach): initializes the Steamworks API
 *    with the AppID in steam_appid.txt (218 = Source SDK Base 2007 - what
 *    FiveM's game process does internally), then forwards Discord work to
 *    the real library (discord_rpc_real.dll, unchanged). Steam shows
 *    "Playing Source SDK Base 2007" while the client runs.
 *
 * 2) IN-WINDOW GAME PRESENTATION (single-window experience): when the
 *    NSM-spawned game (GTA5.exe running from the alt:V runtime folder
 *    under AppData\Local) creates its window, that window is re-parented
 *    INTO our main launcher window as a WS_CHILD that fills the client
 *    area and follows resizes. One visible window, one taskbar entry.
 *    When the game exits, its window dies and the embedded server
 *    browser is simply visible again - no restart, no extra windows.
 *
 *    The game process is only ever OBSERVED and its WINDOW re-parented
 *    via documented Win32 APIs (SetParent/SetWindowLongPtr/MoveWindow) -
 *    no code injection into the game, no memory patching, no DRM or
 *    anti-cheat interference. A Steam/Epic/Rockstar-installed GTA V
 *    (different folder) is never touched. REQUIREMENT: the game must run
 *    windowed or borderless (exclusive fullscreen cannot be embedded);
 *    if anything fails, the game simply stays a normal window like
 *    before - nothing breaks.
 *
 * steam_api64.dll is NOT shipped: it is loaded from an installed Steam
 * game (Grand Theft Auto V first), found via the registry. If Steam is
 * not running or anything fails, everything stays silent - Discord
 * presence and the game are never affected.
 *
 * Build:
 *   x86_64-w64-mingw32-gcc -shared -O2 -o discord_rpc.dll \
 *       nsm-steam-presence-source.c discord.def -ladvapi32 -luser32
 */
#include <windows.h>
#include <stdio.h>
#include <string.h>
#include <tlhelp32.h>

typedef int (*SteamAPI_Init_t)(void);

/* forwarder export InitDiscordRPC -> discord_rpc_real.InitDiscordRPC
 * is declared in discord.def, so the client's GetProcAddress call
 * resolves straight through to the real library unchanged. */

static int try_init(const char *dllPath)
{
    HMODULE m = LoadLibraryA(dllPath);
    SteamAPI_Init_t init;
    if (!m) return 0;
    init = (SteamAPI_Init_t)(void *)GetProcAddress(m, "SteamAPI_Init");
    if (init && init()) return 1;
    return 0;
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
    Sleep(250); /* let the client finish loading this DLL first */

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

    /* SteamAPI_Init reads steam_appid.txt from the working directory.
       It ships next to the client exe; copy it to the cwd if needed. */
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
    /* one retry in case Steam was still starting */
    Sleep(3000);
    try_init(dllPath);
    return 0;
}

/* ------------------------------------------------------------------ */
/* In-window game presentation (the single-window experience)          */
/* ------------------------------------------------------------------ */

static HWND    g_hostWnd  = NULL;   /* our main launcher window   */
static HWND    g_gameWnd  = NULL;   /* re-parented game window    */
static WNDPROC g_origProc = NULL;   /* original host window proc  */

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

/* our own main window (visible, top-level, not a tool window) */
struct OwnCtx { DWORD pid; HWND wnd; int count; };

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
    ctx->count++;
    return TRUE;
}

/* PID of the NSM-spawned game, 0 if not running. The NSM game copy
   lives in the alt:V runtime folder under AppData\Local; Steam, Epic
   and Rockstar installs run from elsewhere and are never touched. */
static DWORD find_nsm_game_pid(void)
{
    HANDLE snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    PROCESSENTRY32 pe;
    BOOL ok;
    DWORD result = 0;
    if (snap == INVALID_HANDLE_VALUE) return 0;
    pe.dwSize = sizeof pe;
    ok = Process32First(snap, &pe);
    while (ok && !result) {
        if (_stricmp(pe.szExeFile, "GTA5.exe") == 0) {
            char path[MAX_PATH * 2] = "";
            HANDLE h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION,
                                   FALSE, pe.th32ProcessID);
            if (h) {
                DWORD n = sizeof path;
                if (QueryFullProcessImageNameA(h, 0, path, &n) && path[0] &&
                    strstr(path, "\\AppData\\Local\\") != NULL)
                    result = pe.th32ProcessID;
                CloseHandle(h);
            }
        }
        ok = Process32Next(snap, &pe);
    }
    CloseHandle(snap);
    return result;
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

    oc.pid = GetCurrentProcessId(); oc.wnd = NULL; oc.count = 0;
    EnumWindows(enum_own_cb, (LPARAM)&oc);
    host = oc.wnd;
    if (!host) return;

    /* strip popup/frame styles, make it a child of our window */
    st = GetWindowLongPtrA(gameWnd, GWL_STYLE);
    SetWindowLongPtrA(gameWnd, GWL_STYLE,
        (st & ~(LONG_PTR)(WS_POPUP | WS_CAPTION | WS_THICKFRAME |
                          WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU))
        | (LONG_PTR)WS_CHILD);

    /* tie input queues so focus moves cleanly across processes */
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
        /* embedding failed: restore the style so the game stays usable
           as a normal window (graceful degradation, never a broken game) */
        SetWindowLongPtrA(gameWnd, GWL_STYLE, st);
    }

    if (hostThread != gameThread) AttachThreadInput(hostThread, gameThread, FALSE);
}

static DWORD WINAPI embed_thread(LPVOID unused)
{
    (void)unused;
    Sleep(1500); /* let the client UI come up first */
    for (;;) {
        DWORD gamePid = find_nsm_game_pid();
        if (gamePid && !g_gameWnd) {
            /* wait for the game's window to appear (up to ~90 s) */
            HWND gw = NULL;
            for (int tries = 0; tries < 180 && !gw; tries++) {
                struct PidCtx ctx;
                ctx.pid = gamePid; ctx.best = NULL; ctx.fallback = NULL;
                EnumWindows(enum_windows_cb, (LPARAM)&ctx);
                gw = ctx.best ? ctx.best : ctx.fallback;
                if (!gw) { Sleep(500); gamePid = find_nsm_game_pid(); if (!gamePid) break; }
            }
            if (gw && gamePid) try_embed(gw);
        }
        /* game gone? allow the next join to embed again */
        if (g_gameWnd && !IsWindow(g_gameWnd)) { g_gameWnd = NULL; g_hostWnd = NULL; }
        if (!gamePid && g_gameWnd) g_gameWnd = NULL;
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
