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
 * Build: x86_64-w64-mingw32-gcc -shared -O2 -o discord_rpc.dll \
 *   nsm-steam-presence-source.c discord.def -ladvapi32 -luser32
 */
#include <windows.h>
#include <stdio.h>
#include <string.h>
#include <tlhelp32.h>

typedef int (*SteamAPI_Init_t)(void);

static void dblog(const char *msg)
{
    HANDLE f = CreateFileA("nsm-embed-debug.log", FILE_APPEND_DATA,
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
    LONG_PTR st;
    HWND host;
    char line[128];

    oc.pid = GetCurrentProcessId(); oc.wnd = NULL;
    EnumWindows(enum_own_cb, (LPARAM)&oc);
    host = oc.wnd;
    if (!host) { dblog("embed: no own window yet\r\n"); return; }
    dblog("embed: own window found\r\n");
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

    if (!g_origProc)
        g_origProc = (WNDPROC)SetWindowLongPtrA(host, GWLP_WNDPROC,
                                                (LONG_PTR)host_subclass_proc);
    g_hostWnd = host;
    g_gameWnd = gameWnd;
    fit_game();
    dblog("embed: fitted\r\n");
    if (!SetFocus(gameWnd)) dblog("embed: SetFocus failed (cosmetic)\r\n");
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

static DWORD WINAPI embed_thread(LPVOID unused)
{
    char line[128];
    (void)unused;
    if (own_exe_is("GTA5.exe")) return 0;   /* never act inside the game */
    Sleep(1500);                            /* let the client UI come up */
    g_initialN = gta_pids(g_initial, 8, 0);
    _snprintf(line, sizeof line, "startup: %d GTA5.exe already running\r\n", g_initialN);
    dblog(line);
    for (;;) {
        DWORD found[8];
        int n = gta_pids(found, 8, 1);
        if (n > 0 && !g_gameWnd) {
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
            }
        }
        if (g_gameWnd) {
            if (IsWindow(g_gameWnd)) keep_embedded();
            else { g_gameWnd = NULL; g_hostWnd = NULL; dblog("game exited\r\n"); }
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
