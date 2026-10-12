/* nsm-shim - Steam presence launcher for NSM (the FiveM trick, FiveM-style)
 *
 * This is what NSM.exe is now: on double-click it initializes the Steamworks
 * API with the AppID in steam_appid.txt (244310 = Source SDK Base 2007 - the
 * same app FiveM shows), then starts the real client (nsm-game.exe) and
 * stays alive until the game closes, so your Steam status shows
 * "Playing Source SDK Base 2007" for the whole session.
 *
 * Requirements: Steam installed and running, and your Steam account must own
 * AppID 244310 (free: Steam -> Library -> Tools -> Source SDK Base 2007).
 * If Steam or the DLL is missing, or init fails, the game STILL launches -
 * presence never blocks playing.
 *
 * It loads steam_api64.dll from any installed Steam game (searches Steam's
 * install via the registry; Grand Theft Auto V first, then any game) - no
 * DLLs are shipped or modified.
 *
 * Build (from this folder):
 *   x86_64-w64-mingw32-gcc -O2 -mwindows -o NSM.exe nsm-shim-source.c -ladvapi32
 */
#include <windows.h>
#include <stdio.h>
#include <string.h>

typedef int (*SteamAPI_Init_t)(void);

static char gDir[MAX_PATH];        /* directory of this exe */
static char gDll[MAX_PATH * 2];    /* steam_api64.dll found */

static void toBackslashes(char *s) { for (; *s; s++) if (*s == '/') *s = '\\'; }

static int findSteamRoot(char *out, DWORD outLen)
{
    DWORD len = outLen;
    if (RegGetValueA(HKEY_CURRENT_USER, "Software\\Valve\\Steam", "SteamPath",
                     RRF_RT_REG_SZ, NULL, out, &len) == ERROR_SUCCESS) {
        char probe[MAX_PATH * 2];
        toBackslashes(out);
        _snprintf(probe, sizeof probe, "%s\\steamapps", out);
        DWORD att = GetFileAttributesA(probe);
        return (att != INVALID_FILE_ATTRIBUTES && (att & FILE_ATTRIBUTE_DIRECTORY));
    }
    return 0;
}

static int findDllRecursive(const char *dir, int depth)
{
    char pattern[MAX_PATH * 2];
    WIN32_FIND_DATAA fd;
    HANDLE h;
    if (depth < 0 || gDll[0]) return gDll[0] != 0;
    _snprintf(pattern, sizeof pattern, "%s\\*", dir);
    h = FindFirstFileA(pattern, &fd);
    if (h == INVALID_HANDLE_VALUE) return 0;
    do {
        char full[MAX_PATH * 2];
        if (!strcmp(fd.cFileName, ".") || !strcmp(fd.cFileName, "..")) continue;
        _snprintf(full, sizeof full, "%s\\%s", dir, fd.cFileName);
        if (fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
            if (findDllRecursive(full, depth - 1)) { FindClose(h); return 1; }
        } else if (!_stricmp(fd.cFileName, "steam_api64.dll")) {
            lstrcpynA(gDll, full, sizeof gDll);
            FindClose(h);
            return 1;
        }
    } while (FindNextFileA(h, &fd));
    FindClose(h);
    return 0;
}

static int findDll(const char *steamRoot)
{
    static const char *cands[] = {
        "Grand Theft Auto V\\steam_api64.dll",
        "Grand Theft Auto V Enhanced\\steam_api64.dll",
        "wallpaper_engine\\bin\\steam_api64.dll",
        "GarrysMod\\bin\\win64\\steam_api64.dll",
        "Team Fortress 2\\bin\\steam_api64.dll"
    };
    char base[MAX_PATH * 2];
    unsigned i;
    for (i = 0; i < sizeof cands / sizeof cands[0]; i++) {
        _snprintf(base, sizeof base, "%s\\steamapps\\common\\%s", steamRoot, cands[i]);
        if (GetFileAttributesA(base) != INVALID_FILE_ATTRIBUTES) {
            lstrcpynA(gDll, base, sizeof gDll);
            return 1;
        }
    }
    _snprintf(base, sizeof base, "%s\\steamapps\\common", steamRoot);
    return findDllRecursive(base, 3);
}

int WINAPI WinMain(HINSTANCE hI, HINSTANCE hP, LPSTR cmdLine, int nShow)
{
    char exe[MAX_PATH];
    char steamRoot[MAX_PATH * 2];
    char childPath[MAX_PATH * 2];
    char fullCmd[32768];
    const char *child = "nsm-game.exe";
    const char *cl, *args = "";
    char *slash;
    STARTUPINFOA si;
    PROCESS_INFORMATION pi;

    (void)hI; (void)hP; (void)cmdLine; (void)nShow;

    GetModuleFileNameA(NULL, exe, MAX_PATH);
    lstrcpynA(gDir, exe, MAX_PATH);
    slash = strrchr(gDir, '\\');
    if (slash) *slash = 0;
    SetCurrentDirectoryA(gDir); /* steam_appid.txt lives next to this exe */

    /* Steam handshake - best effort, never fatal */
    if (findSteamRoot(steamRoot, sizeof steamRoot) && findDll(steamRoot)) {
        HMODULE m = LoadLibraryA(gDll);
        if (m) {
            SteamAPI_Init_t init =
                (SteamAPI_Init_t)(void *)GetProcAddress(m, "SteamAPI_Init");
            if (init && init()) {
                /* Steam now shows us playing AppID 244310. */
            }
        }
    }

    /* Launch the real client, passing through any arguments we got. */
    _snprintf(childPath, sizeof childPath, "%s\\%s", gDir, child);
    if (GetFileAttributesA(childPath) == INVALID_FILE_ATTRIBUTES) {
        child = "connect.exe";
        _snprintf(childPath, sizeof childPath, "%s\\%s", gDir, child);
    }
    if (GetFileAttributesA(childPath) == INVALID_FILE_ATTRIBUTES) {
        MessageBoxA(NULL,
            "NSM could not find nsm-game.exe or connect.exe next to NSM.exe.\n"
            "Please re-extract the full NSM download.",
            "NSM", MB_ICONERROR);
        return 1;
    }

    cl = GetCommandLineA();
    if (cl) {
        if (cl[0] == '"') {
            const char *e = strchr(cl + 1, '"');
            if (e) args = e + 1;
        } else {
            const char *e = strchr(cl, ' ');
            if (e) args = e;
        }
        while (*args == ' ') args++;
    }
    _snprintf(fullCmd, sizeof fullCmd, "\"%s\"%s%s", childPath,
              (*args ? " " : ""), args);

    ZeroMemory(&si, sizeof si);
    si.cb = sizeof si;
    if (!CreateProcessA(NULL, fullCmd, NULL, NULL, FALSE, 0, NULL, gDir, &si, &pi)) {
        char msg[512];
        _snprintf(msg, sizeof msg,
                  "NSM could not start %s (Windows error %lu).",
                  child, (unsigned long)GetLastError());
        MessageBoxA(NULL, msg, "NSM", MB_ICONERROR);
        return 1;
    }
    WaitForSingleObject(pi.hProcess, INFINITE); /* hold the Steam status */
    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);
    return 0;
}
