#include <windows.h>
/* no-op Discord "real" DLL so the wrapper's forwarder resolves */
__declspec(dllexport) void InitDiscordRPC(void) {}
BOOL WINAPI DllMain(HINSTANCE h, DWORD r, LPVOID p) { (void)h;(void)r;(void)p; return TRUE; }
