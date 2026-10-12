/* NSM Steam presence - Discord RPC wrapper (the FiveM approach)
 *
 * The NSM client loads discord_rpc.dll from its own folder at startup.
 * This wrapper takes that place: inside the client's own process it
 * initializes the Steamworks API with the AppID in steam_appid.txt
 * (218 = Source SDK Base 2007 - exactly what FiveM's game process
 * does internally), then forwards Discord work to the real library
 * (discord_rpc_real.dll, unchanged). Steam shows "Playing Source SDK
 * Base 2007" for as long as the client runs.
 *
 * steam_api64.dll is NOT shipped: it is loaded from an installed Steam
 * game (Grand Theft Auto V first), found via the registry. If Steam is
 * not running or anything fails, everything stays silent - Discord
 * presence and the game are never affected.
 *
 * Build:
 *   x86_64-w64-mingw32-gcc -shared -O2 -o discord_rpc.dll \
 *       nsm-steam-presence-source.c discord.def -ladvapi32
 */
#include <windows.h>
#include <stdio.h>
#include <string.h>

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

BOOL WINAPI DllMain(HINSTANCE h, DWORD reason, LPVOID reserved)
{
    (void)reserved;
    if (reason == DLL_PROCESS_ATTACH) {
        DisableThreadLibraryCalls(h);
        CreateThread(NULL, 0, steam_thread, NULL, 0, NULL);
    }
    return TRUE;
}
