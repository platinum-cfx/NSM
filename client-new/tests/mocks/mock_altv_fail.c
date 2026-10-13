/* mock altv.exe (TEST ONLY): exits immediately with code 42 without starting
 * GTA5.exe - used by the E2E to verify the launcher reports the real exit
 * code and recovers to the browser. */
#include <windows.h>
int main(void) { return 42; }
