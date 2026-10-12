/* mock altv.exe: the "game engine" NSM launches. Spawns GTA5.exe from its own
 * directory, waits for it to exit, then exits. */
#include <windows.h>
#include <stdio.h>
int main(void) {
    char dir[MAX_PATH], gta[MAX_PATH * 2];
    STARTUPINFOA si; PROCESS_INFORMATION pi;
    char exe[MAX_PATH]; char *slash;
    Sleep(800);  /* pretend boot */
    GetModuleFileNameA(NULL, exe, sizeof exe);
    slash = strrchr(exe, '\\'); if (slash) *slash = 0;
    lstrcpynA(dir, exe, sizeof dir);
    _snprintf(gta, sizeof gta, "\"%s\\GTA5.exe\"", dir);
    memset(&si, 0, sizeof si); si.cb = sizeof si;
    if (!CreateProcessA(NULL, gta, NULL, NULL, FALSE, 0, NULL, dir, &si, &pi)) return 1;
    WaitForSingleObject(pi.hProcess, INFINITE);
    CloseHandle(pi.hThread); CloseHandle(pi.hProcess);
    return 0;
}
