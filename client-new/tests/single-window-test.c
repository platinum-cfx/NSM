/* NSM single-window integration test harness (Windows / Wine).
 *   single-window-test.exe host  = mock NSM launcher: creates a window,
 *                                  loads discord_rpc.dll, asserts the game
 *                                  window is really re-parented INTO it.
 *   GTA5.exe [secs]               = mock game: grcWindow-class window.
 * Asserts: DETECTED, PARENTED (GetParent==host), BORDERLESS, FILLED,
 * RESIZED (follows host resizes), GAME_GONE, HOST_ALIVE. 0 = PASS.
 * Build: x86_64-w64-mingw32-gcc -O2 -o t.exe single-window-test.c -luser32 -mconsole
 */
#include <windows.h>
#include <stdio.h>
#include <string.h>

static const char *HOST_CLASS = "NSMTestHostWnd";

static LRESULT CALLBACK wp(HWND h, UINT m, WPARAM w, LPARAM l)
{ return DefWindowProcA(h, m, w, l); }

static int run_host(void)
{
    WNDCLASSA wc; HWND host = NULL, game = NULL; HMODULE dll;
    ULONGLONG t0 = GetTickCount64();
    int detected=0, parented=0, borderless=0, filled=0;
    int resized=0, game_gone=0, host_alive=0, did_resize=0;
    RECT hc; POINT tl; RECT gr;

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
    if (!dll) { printf("[FAIL] dll not loaded\n"); return 1; }
    printf("[host] discord_rpc.dll loaded\n");

    for (;;) {
        ULONGLONG now = GetTickCount64();
        if (now - t0 > 90000) { printf("[FAIL] timeout\n"); break; }
        if (!detected) {
            game = FindWindowA("grcWindow", NULL);
            if (game) { detected = 1; printf("[PASS] DETECTED\n"); }
        } else if (!parented) {
            if (!IsWindow(game)) { printf("[FAIL] game gone early\n"); break; }
            if (GetParent(game) == host) { parented = 1; printf("[PASS] PARENTED\n"); }
            else if (now - t0 > 40000) { printf("[FAIL] never re-parented\n"); break; }
        } else {
            LONG_PTR st = GetWindowLongPtrA(game, GWL_STYLE);
            if (!borderless && !(st & WS_CAPTION) && (st & WS_CHILD)) {
                borderless = 1; printf("[PASS] BORDERLESS\n");
            }
            GetClientRect(host, &hc); tl.x = 0; tl.y = 0; ClientToScreen(host, &tl);
            GetWindowRect(game, &gr);
            if (borderless && !filled && gr.left == tl.x && gr.top == tl.y &&
                gr.right - gr.left == hc.right && gr.bottom - gr.top == hc.bottom) {
                filled = 1; printf("[PASS] FILLED\n");
            }
            if (filled && !did_resize) {
                SetWindowPos(host, NULL, 40, 40, 900, 500, SWP_NOZORDER | SWP_NOMOVE);
                did_resize = 1; printf("[host] resized to 900x500\n");
            } else if (did_resize && !resized) {
                GetClientRect(host, &hc); tl.x = 0; tl.y = 0; ClientToScreen(host, &tl);
                GetWindowRect(game, &gr);
                if (gr.left == tl.x && gr.top == tl.y &&
                    gr.right - gr.left == hc.right && gr.bottom - gr.top == hc.bottom) {
                    resized = 1; printf("[PASS] RESIZED\n");
                }
            }
            if (!IsWindow(game)) {
                game_gone = 1; printf("[PASS] GAME_GONE\n");
                host_alive = IsWindow(host) && IsWindowVisible(host);
                printf("%s HOST_ALIVE\n", host_alive ? "[PASS]" : "[FAIL]");
                break;
            }
        }
        Sleep(100);
    }
    printf("RESULT: %s (det=%d par=%d bor=%d fil=%d res=%d gone=%d alive=%d)\n",
           (detected && parented && borderless && filled && resized && game_gone && host_alive)
               ? "PASS" : "FAIL",
           detected, parented, borderless, filled, resized, game_gone, host_alive);
    return (detected && parented && borderless && filled && resized && game_gone && host_alive) ? 0 : 1;
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
        while (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE)) {
            TranslateMessage(&msg); DispatchMessageA(&msg);
        }
        Sleep(50);
    }
    printf("[game] exiting\n");
    return 0;
}

int main(int argc, char **argv)
{
    if (argc > 1 && strcmp(argv[1], "host") == 0) return run_host();
    { int s = (argc > 1) ? atoi(argv[1]) : 12; if (s <= 0) s = 12; return run_game(s); }
}
