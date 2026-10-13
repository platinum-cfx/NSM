/* mock altv.exe (TEST ONLY): stays alive without ever starting GTA5.exe -
 * used by the E2E to verify the game-start timeout kills the client and
 * recovers to the browser with a clear error. */
#include <windows.h>
int main(void) { Sleep(300000); return 0; }
