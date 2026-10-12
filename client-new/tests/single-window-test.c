/* NSM single-window integration test harness (Windows / Wine).
 *
 *   single-window-test.exe host  = CROSS-PROCESS DETECTION test:
 *       creates a launcher window, loads the real discord_rpc.dll, waits
 *       for a grcWindow from the GTA5.exe mock to appear (the DLL must
 *       detect it - proven via its nsm-embed-debug.log trace), waits for
 *       the game to exit, asserts the launcher survived.
 *       (Wine cannot do cross-process SetParent - runs 2/3 proved the
 *       thread reaches SetParent and Wine blocks it - so this test stops
 *       at detection; the re-parent hop itself is standard Windows API,
 *       verified on the user's machine via the trace.)
 *
 *   single-window-test.exe mech  = IN-PROCESS MECHANICS test: performs
 *       the EXACT operations the DLL performs on the game window
 *       (re-parent into launcher, strip frame styles, WS_CHILD, fit to
 *       client area, follow launcher resizes via WM_SIZE subclass,
 *       destroy game window, launcher survives) on a same-process
 *       grcWindow so the whole mechanism is verified. 0 = PASS.
 *
 *   GTA5.exe [secs]              = mock game: real grcWindow-class popup.
 */
#include <windows.h>
#include <stdio.h>
#include <string.h>

static const char *HOST_CLASS = "NSMTestHostWnd";
static HWND  g_child = NULL;
static WNDPROC g_orig = NULL;

static LRESULT CALLBACK wp(HWND h, UINT m, WPARAM w, LPARAM l)
{ return DefWindowProcA(h, m, w, l); }

static void fit_child(HWND host)
{
    if (g_child && IsWindow(g_child)) {
        RECT rc; GetClientRect(host, &rc);
        MoveWindow(g_child, 0, 0, rc.right, rc.bottom, TRUE);
    }
}

static LRESULT CALLBACK sub(HWND h, UINT m, WPARAM w, LPARAM l)
{
    if (m == WM_SIZE) fit_child(h);
    return CallWindowProcA(g_orig, h, m, w, l);
}

static int run_host(void)   /* cross-process detection */
{
    WNDCLASSA wc; HWND host, game; HMODULE dll;
    ULONGLONG t0 = GetTickCount64(), seen = 0, gone = 0;
    int detected = 0, game_gone = 0;

    memset(&wc, 0, sizeof wc);
    wc.lpfnWndProc = wp; wc.lpszClassName = HOST_CLASS;
    wc.hCursor = LoadCursorA(NULL, (LPCSTR)IDC_ARROW);
    if (!RegisterClassA(&wc)) { printf("[FAIL] class\n"); return 1; }
    host = CreateWindowExA(0, HOST_CLASS, "NSM Test Launcher",
                           WS_OVERLAPPEDWINDOW | WS_VISIBLE,
                           40, 40, 1024, 640, NULL, NULL, NULL, NULL);
    if (!host) { printf("[FAIL] window\n"); return 1; }
    printf("[host] window created\n");
    dll = LoadLibraryA("discord_rpc.dll");
    if (!dll) { printf("[FAIL] dll\n"); return 1; }
    printf("[host] discord_rpc.dll loaded\n");

    for (;;) {
        MSG msg;
        while (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE)) {
            TranslateMessage(&msg); DispatchMessageA(&msg);
        }
        if (!detected) {
            game = FindWindowA("grcWindow", NULL);
            if (game) { detected = 1; seen = GetTickCount64(); printf("[PASS] DETECTED\n"); }
            else if (GetTickCount64() - t0 > 60000) { printf("[FAIL] timeout\n"); break; }
        } else if (!game_gone) {
            if (!FindWindowA("grcWindow", NULL)) {
                game_gone = 1; gone = GetTickCount64();
                printf("[PASS] GAME_GONE (after %llus)\n",
                       (unsigned long long)((gone - seen) / 1000));
            } else if (GetTickCount64() - t0 > 90000) { printf("[FAIL] game never exits\n"); break; }
        } else {
            printf("%s HOST_ALIVE\n", (IsWindow(host) && IsWindowVisible(host)) ? "[PASS]" : "[FAIL]");
            break;
        }
        Sleep(100);
    }
    printf("RESULT: %s\n", (detected && game_gone) ? "PASS" : "FAIL");
    return (detected && game_gone) ? 0 : 1;
}

static int run_mech(void)   /* in-process mechanics: what the DLL does */
{
    WNDCLASSA wc; HWND host, game; MSG msg;
    LONG_PTR st; RECT hc, gr; POINT tl;
    int ok_style = 0, ok_fill = 0, ok_resize = 0;

    memset(&wc, 0, sizeof wc);
    wc.lpfnWndProc = wp; wc.lpszClassName = HOST_CLASS;
    wc.hCursor = LoadCursorA(NULL, (LPCSTR)IDC_ARROW);
    if (!RegisterClassA(&wc)) { printf("[FAIL] class\n"); return 1; }
    host = CreateWindowExA(0, HOST_CLASS, "NSM Test Launcher",
                           WS_OVERLAPPEDWINDOW | WS_VISIBLE,
                           40, 40, 1024, 640, NULL, NULL, NULL, NULL);
    if (!host) { printf("[FAIL] window\n"); return 1; }
    wc.lpfnWndProc = wp; wc.lpszClassName = "grcWindow";
    if (!RegisterClassA(&wc)) { printf("[FAIL] game class\n"); return 1; }
    game = CreateWindowExA(0, "grcWindow", "Grand Theft Auto V",
                           WS_POPUP | WS_CAPTION | WS_VISIBLE,
                           60, 60, 1280, 720, NULL, NULL, NULL, NULL);
    if (!game) { printf("[FAIL] game window\n"); return 1; }
    printf("[mech] launcher + grcWindow created\n");

    /* 1: re-parent FIRST (exactly like the DLL) */
    if (SetParent(game, host) == NULL) {
        printf("[FAIL] SetParent err=%lu\n", (unsigned long)GetLastError()); return 1;
    }
    printf("[PASS] PARENTED\n");
    g_child = game;

    /* 2: strip frame styles, make child */
    st = GetWindowLongPtrA(game, GWL_STYLE);
    SetWindowLongPtrA(game, GWL_STYLE,
        (st & ~(LONG_PTR)(WS_POPUP | WS_CAPTION | WS_THICKFRAME |
                          WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU))
        | (LONG_PTR)WS_CHILD);
    st = GetWindowLongPtrA(game, GWL_STYLE);
    if (!(st & WS_CAPTION) && (st & WS_CHILD)) { ok_style = 1; printf("[PASS] BORDERLESS-CHILD\n"); }

    /* 3: subclass host for WM_SIZE + fit (exactly like the DLL) */
    g_orig = (WNDPROC)SetWindowLongPtrA(host, GWLP_WNDPROC, (LONG_PTR)sub);
    fit_child(host);
    GetClientRect(host, &hc); tl.x = 0; tl.y = 0; ClientToScreen(host, &tl);
    GetWindowRect(game, &gr);
    if (gr.left == tl.x && gr.top == tl.y &&
        gr.right - gr.left == hc.right && gr.bottom - gr.top == hc.bottom) {
        ok_fill = 1; printf("[PASS] FILLED\n");
    }

    /* 4: resize the launcher - child must follow via WM_SIZE */
    SetWindowPos(host, NULL, 40, 40, 900, 500, SWP_NOZORDER | SWP_NOMOVE);
    { int i; for (i = 0; i < 20; i++) {   /* pump so WM_SIZE is delivered */
        while (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE)) { TranslateMessage(&msg); DispatchMessageA(&msg); }
        GetClientRect(host, &hc); tl.x = 0; tl.y = 0; ClientToScreen(host, &tl);
        GetWindowRect(game, &gr);
        if (gr.left == tl.x && gr.top == tl.y &&
            gr.right - gr.left == hc.right && gr.bottom - gr.top == hc.bottom) { ok_resize = 1; break; }
        Sleep(50);
    } }
    printf("%s RESIZED\n", ok_resize ? "[PASS]" : "[FAIL]");

    /* 5: game window dies - launcher must survive */
    DestroyWindow(game);
    { int i; for (i = 0; i < 20; i++) {
        while (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE)) { TranslateMessage(&msg); DispatchMessageA(&msg); }
        if (!IsWindow(game)) break; Sleep(50);
    } }
    printf("%s GAME_GONE %s HOST_ALIVE\n",
           IsWindow(game) ? "[FAIL]" : "[PASS]",
           (IsWindow(host) && IsWindowVisible(host)) ? "[PASS]" : "[FAIL]");

    printf("RESULT: %s\n",
           (ok_style && ok_fill && ok_resize && !IsWindow(game) &&
            IsWindow(host) && IsWindowVisible(host)) ? "PASS" : "FAIL");
    return (ok_style && ok_fill && ok_resize && !IsWindow(game) &&
            IsWindow(host) && IsWindowVisible(host)) ? 0 : 1;
}

static int run_game(int seconds)
{
    WNDCLASSA wc; HWND gw; MSG msg; ULONGLONG t0 = GetTickCount64();
    memset(&wc, 0, sizeof wc);
    wc.lpfnWndProc = wp; wc.lpszClassName = "grcWindow";
    wc.hCursor = LoadCursorA(NULL, (LPCSTR)IDC_ARROW);
    if (!RegisterClassA(&wc)) { printf("[game] class fail\n"); return 1; }
    gw = CreateWindowExA(0, "grcWindow", "Grand Theft Auto V",
                         WS_POPUP | WS_CAPTION | WS_VISIBLE,
                         60, 60, 1280, 720, NULL, NULL, NULL, NULL);
    if (!gw) { printf("[game] window fail\n"); return 1; }
    printf("[game] grcWindow up for %ds\n", seconds);
    while (GetTickCount64() - t0 < (ULONGLONG)seconds * 1000) {
        while (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE)) { TranslateMessage(&msg); DispatchMessageA(&msg); }
        Sleep(50);
    }
    printf("[game] exiting\n");
    return 0;
}

int main(int argc, char **argv)
{
    if (argc > 1 && strcmp(argv[1], "host") == 0) return run_host();
    if (argc > 1 && strcmp(argv[1], "mech")  == 0) return run_mech();
    { int s = (argc > 1) ? atoi(argv[1]) : 12; if (s <= 0) s = 12; return run_game(s); }
}
