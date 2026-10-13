/* TEST-ONLY dummy pack extractor (mimics the production pack contract).
 * Production packs decrypt to a PE DLL exporting RunExtractor(const char*)
 * which installs the real game files into the given directory. This dummy
 * creates every manifest file EXCEPT \altv.exe and \cache\skin.bin at the
 * exact expected size, zero-extended (fast, near-zero disk usage), so the
 * launcher's real extraction, LoadLibrary, RunExtractor and post-extraction
 * manifest-verification code paths all execute against the mock rig. */
#include <windows.h>
#include <string.h>

typedef struct { const char* relPath; size_t expectedSize; } FileManifest;
static const FileManifest g_DummyManifest[] = {
#include "mock_pack_manifest.h"
};

static void ensure_parent_dirs(char* path)
{
    char* p = path;
    while (*p) {
        if ((*p == '\\' || *p == '/') && p != path) {
            char saved = *p; *p = 0;
            CreateDirectoryA(path, NULL);
            *p = saved;
        }
        ++p;
    }
}

__declspec(dllexport) void RunExtractor(const char* targetDir)
{
    char path[MAX_PATH * 2];
    size_t i, n = sizeof(g_DummyManifest) / sizeof(g_DummyManifest[0]);
    for (i = 0; i < n; ++i) {
        HANDLE h;
        lstrcpynA(path, targetDir, MAX_PATH);
        lstrcatA(path, g_DummyManifest[i].relPath);
        ensure_parent_dirs(path);
        h = CreateFileA(path, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
        if (h == INVALID_HANDLE_VALUE) continue;
        if (g_DummyManifest[i].expectedSize > 0) {
            LONG hi = (LONG)(g_DummyManifest[i].expectedSize >> 32);
            SetFilePointer(h, (LONG)(g_DummyManifest[i].expectedSize & 0xFFFFFFFF), &hi, FILE_BEGIN);
            SetEndOfFile(h);
        }
        CloseHandle(h);
    }
}

BOOL WINAPI DllMain(HINSTANCE h, DWORD r, LPVOID p) { (void)h; (void)r; (void)p; return TRUE; }
