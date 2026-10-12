/* mock GTA5.exe: creates a real visible window of class grcWindow (the class
 * the embedding wrapper looks for), keeps it alive ~25s, exits. */
#include <windows.h>
#include <stdio.h>
static LRESULT CALLBACK wp(HWND h, UINT m, WPARAM w, LPARAM l) {
    if (m == WM_DESTROY) { PostQuitMessage(0); return 0; }
    if (m == WM_PAINT) {
        PAINTSTRUCT ps; HDC dc = BeginPaint(h, &ps);
        RECT r; GetClientRect(h, &r);
        FillRect(dc, &r, (HBRUSH)GetStockObject(BLACK_BRUSH));
        SetBkColor(dc, RGB(0,0,0)); SetTextColor(dc, RGB(80,255,80));
        DrawTextA(dc, "MOCK GTA V (grcWindow)", -1, &r, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
        EndPaint(h, &ps); return 0;
    }
    return DefWindowProcA(h, m, w, l);
}
int main(void) {
    WNDCLASSA wc; HWND h; MSG msg; DWORD t0 = GetTickCount();
    Sleep(1200);  /* loading screen */
    memset(&wc, 0, sizeof wc);
    wc.lpfnWndProc = wp; wc.hInstance = GetModuleHandleA(NULL);
    wc.lpszClassName = "grcWindow"; wc.hCursor = LoadCursorA(NULL, IDC_ARROW);
    RegisterClassA(&wc);
    h = CreateWindowExA(0, "grcWindow", "Grand Theft Auto V",
        WS_OVERLAPPEDWINDOW, 80, 80, 1024, 576,
        NULL, NULL, GetModuleHandleA(NULL), NULL);
    ShowWindow(h, SW_SHOW); UpdateWindow(h);
    for (;;) {
        MSG msg;
        while (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE)) {
            if (msg.message == WM_QUIT) return 0;
            TranslateMessage(&msg); DispatchMessageA(&msg);
        }
        if (GetTickCount() - t0 > 22000) break;   /* leave the game */
        Sleep(100);
    }
    return 0;
}
