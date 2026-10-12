#include <windows.h>
#include <string>
#include <fstream>
#include <iostream>

using namespace std;

bool ExtractResource(HMODULE hModule, int resourceId, const string& outputPath) {
    HRSRC hRes = FindResource(hModule, MAKEINTRESOURCE(resourceId), RT_RCDATA);
    if (!hRes) return false;
    
    HGLOBAL hData = LoadResource(hModule, hRes);
    if (!hData) return false;
    
    DWORD dataSize = SizeofResource(hModule, hRes);
    void* pData = LockResource(hData);
    if (!pData || dataSize == 0) return false;
    
    ofstream out(outputPath, ios::binary);
    if (!out.is_open()) return false;
    
    out.write(reinterpret_cast<char*>(pData), dataSize);
    out.close();
    return true;
}

string GetDllDir(HMODULE hModule) {
    char path[MAX_PATH];
    GetModuleFileNameA(hModule, path, MAX_PATH);
    string spath = path;
    size_t pos = spath.find_last_of("\\/");
    return (pos != string::npos) ? spath.substr(0, pos) : "";
}

extern "C" __declspec(dllexport) void RunExtractor(const char* destDir) {
    HMODULE hModule = GetModuleHandleA("multiplayer.dll");
    string baseDir = destDir;
    
    // Create directories
    CreateDirectoryA((baseDir + "\\proxy").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\libs").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\cef").c_str(), NULL);
    
    // Extract proxy.dll
    ExtractResource(hModule, 101, baseDir + "\\proxy\\proxy.dll");
    
    // Extract data files
    ExtractResource(hModule, 102, baseDir + "\\proxy\\launcher_update_modified.json");
    ExtractResource(hModule, 103, baseDir + "\\proxy\\update_release_modified.json");
    ExtractResource(hModule, 104, baseDir + "\\proxy\\backup_update.json");
    ExtractResource(hModule, 105, baseDir + "\\proxy\\EAC7B9E177254512ACD11423A28AABDD");
    ExtractResource(hModule, 106, baseDir + "\\proxy\\skin.bin");
    
    // Extract skin to cache directory
    string cacheDir = baseDir + "\\cache";
    CreateDirectoryA(cacheDir.c_str(), NULL);
    ExtractResource(hModule, 106, cacheDir + "\\skin.bin");
    
    ExtractResource(hModule, 300, baseDir + "\\libs\\bass.dll");
    ExtractResource(hModule, 301, baseDir + "\\libs\\bassmix.dll");
    ExtractResource(hModule, 302, baseDir + "\\libs\\bass_fx.dll");
    ExtractResource(hModule, 303, baseDir + "\\libs\\chrome_100_percent.pak");
    ExtractResource(hModule, 304, baseDir + "\\libs\\chrome_200_percent.pak");
    ExtractResource(hModule, 305, baseDir + "\\libs\\chrome_elf.dll");
    ExtractResource(hModule, 306, baseDir + "\\libs\\d3dcompiler_47.dll");
    ExtractResource(hModule, 307, baseDir + "\\libs\\discord_game_sdk.dll");
    ExtractResource(hModule, 308, baseDir + "\\libs\\dxcompiler.dll");
    ExtractResource(hModule, 309, baseDir + "\\libs\\dxil.dll");
    ExtractResource(hModule, 310, baseDir + "\\libs\\freetype.dll");
    ExtractResource(hModule, 311, baseDir + "\\libs\\icudtl.dat");
    ExtractResource(hModule, 312, baseDir + "\\libs\\icudtl_v8.dat");
    ExtractResource(hModule, 313, baseDir + "\\libs\\legacy.dll");
    ExtractResource(hModule, 314, baseDir + "\\libs\\libce2.dll");
    ExtractResource(hModule, 315, baseDir + "\\libs\\libcrypto-3-x64.dll");
    ExtractResource(hModule, 316, baseDir + "\\libs\\libEGL.dll");
    ExtractResource(hModule, 317, baseDir + "\\libs\\libGLESv2.dll");
    ExtractResource(hModule, 318, baseDir + "\\libs\\libssl-3-x64.dll");
    ExtractResource(hModule, 319, baseDir + "\\libs\\resources.pak");
    ExtractResource(hModule, 320, baseDir + "\\libs\\snapshot_blob.bin");
    ExtractResource(hModule, 321, baseDir + "\\libs\\symbolinfo.bin");
    ExtractResource(hModule, 322, baseDir + "\\libs\\v8_context_snapshot.bin");
    ExtractResource(hModule, 323, baseDir + "\\libs\\vk_swiftshader.dll");
    ExtractResource(hModule, 324, baseDir + "\\libs\\vk_swiftshader_icd.json");
    ExtractResource(hModule, 325, baseDir + "\\libs\\vulkan-1.dll");
    ExtractResource(hModule, 326, baseDir + "\\libs\\zlib1.dll");
    CreateDirectoryA((baseDir + "\\backup").c_str(), NULL);
    ExtractResource(hModule, 400, baseDir + "\\backup\\GTA5.exe");






    
    // Extract client files
    ExtractResource(hModule, 107, baseDir + "\\altv.exe");
    ExtractResource(hModule, 108, baseDir + "\\altv-launcher-patcher.dll");
    ExtractResource(hModule, 109, baseDir + "\\cef\\altv-webengine.exe");
    ExtractResource(hModule, 110, baseDir + "\\altv-client.dll");
    CreateDirectoryA((baseDir + "\\cef\\locales").c_str(), NULL);
    ExtractResource(hModule, 200, baseDir + "\\cef\\locales\\af.pak");
    ExtractResource(hModule, 201, baseDir + "\\cef\\locales\\am.pak");
    ExtractResource(hModule, 202, baseDir + "\\cef\\locales\\ar.pak");
    ExtractResource(hModule, 203, baseDir + "\\cef\\locales\\bg.pak");
    ExtractResource(hModule, 204, baseDir + "\\cef\\locales\\bn.pak");
    ExtractResource(hModule, 205, baseDir + "\\cef\\locales\\ca.pak");
    ExtractResource(hModule, 206, baseDir + "\\cef\\locales\\cs.pak");
    ExtractResource(hModule, 207, baseDir + "\\cef\\locales\\da.pak");
    ExtractResource(hModule, 208, baseDir + "\\cef\\locales\\de.pak");
    ExtractResource(hModule, 209, baseDir + "\\cef\\locales\\el.pak");
    ExtractResource(hModule, 210, baseDir + "\\cef\\locales\\en-GB.pak");
    ExtractResource(hModule, 211, baseDir + "\\cef\\locales\\en-US.pak");
    ExtractResource(hModule, 212, baseDir + "\\cef\\locales\\es-419.pak");
    ExtractResource(hModule, 213, baseDir + "\\cef\\locales\\es.pak");
    ExtractResource(hModule, 214, baseDir + "\\cef\\locales\\et.pak");
    ExtractResource(hModule, 215, baseDir + "\\cef\\locales\\fa.pak");
    ExtractResource(hModule, 216, baseDir + "\\cef\\locales\\fi.pak");
    ExtractResource(hModule, 217, baseDir + "\\cef\\locales\\fil.pak");
    ExtractResource(hModule, 218, baseDir + "\\cef\\locales\\fr.pak");
    ExtractResource(hModule, 219, baseDir + "\\cef\\locales\\gu.pak");
    ExtractResource(hModule, 220, baseDir + "\\cef\\locales\\he.pak");
    ExtractResource(hModule, 221, baseDir + "\\cef\\locales\\hi.pak");
    ExtractResource(hModule, 222, baseDir + "\\cef\\locales\\hr.pak");
    ExtractResource(hModule, 223, baseDir + "\\cef\\locales\\hu.pak");
    ExtractResource(hModule, 224, baseDir + "\\cef\\locales\\id.pak");
    ExtractResource(hModule, 225, baseDir + "\\cef\\locales\\it.pak");
    ExtractResource(hModule, 226, baseDir + "\\cef\\locales\\ja.pak");
    ExtractResource(hModule, 227, baseDir + "\\cef\\locales\\kn.pak");
    ExtractResource(hModule, 228, baseDir + "\\cef\\locales\\ko.pak");
    ExtractResource(hModule, 229, baseDir + "\\cef\\locales\\lt.pak");
    ExtractResource(hModule, 230, baseDir + "\\cef\\locales\\lv.pak");
    ExtractResource(hModule, 231, baseDir + "\\cef\\locales\\ml.pak");
    ExtractResource(hModule, 232, baseDir + "\\cef\\locales\\mr.pak");
    ExtractResource(hModule, 233, baseDir + "\\cef\\locales\\ms.pak");
    ExtractResource(hModule, 234, baseDir + "\\cef\\locales\\nb.pak");
    ExtractResource(hModule, 235, baseDir + "\\cef\\locales\\nl.pak");
    ExtractResource(hModule, 236, baseDir + "\\cef\\locales\\pl.pak");
    ExtractResource(hModule, 237, baseDir + "\\cef\\locales\\pt-BR.pak");
    ExtractResource(hModule, 238, baseDir + "\\cef\\locales\\pt-PT.pak");
    ExtractResource(hModule, 239, baseDir + "\\cef\\locales\\ro.pak");
    ExtractResource(hModule, 240, baseDir + "\\cef\\locales\\ru.pak");
    ExtractResource(hModule, 241, baseDir + "\\cef\\locales\\sk.pak");
    ExtractResource(hModule, 242, baseDir + "\\cef\\locales\\sl.pak");
    ExtractResource(hModule, 243, baseDir + "\\cef\\locales\\sr.pak");
    ExtractResource(hModule, 244, baseDir + "\\cef\\locales\\sv.pak");
    ExtractResource(hModule, 245, baseDir + "\\cef\\locales\\sw.pak");
    ExtractResource(hModule, 246, baseDir + "\\cef\\locales\\ta.pak");
    ExtractResource(hModule, 247, baseDir + "\\cef\\locales\\te.pak");
    ExtractResource(hModule, 248, baseDir + "\\cef\\locales\\th.pak");
    ExtractResource(hModule, 249, baseDir + "\\cef\\locales\\tr.pak");
    ExtractResource(hModule, 250, baseDir + "\\cef\\locales\\uk.pak");
    ExtractResource(hModule, 251, baseDir + "\\cef\\locales\\ur.pak");
    ExtractResource(hModule, 252, baseDir + "\\cef\\locales\\vi.pak");
    ExtractResource(hModule, 253, baseDir + "\\cef\\locales\\zh-CN.pak");
    ExtractResource(hModule, 254, baseDir + "\\cef\\locales\\zh-TW.pak");


    ExtractResource(hModule, 300, baseDir + "\\libs\\bass.dll");
    ExtractResource(hModule, 301, baseDir + "\\libs\\bassmix.dll");
    ExtractResource(hModule, 302, baseDir + "\\libs\\bass_fx.dll");
    ExtractResource(hModule, 303, baseDir + "\\libs\\chrome_100_percent.pak");
    ExtractResource(hModule, 304, baseDir + "\\libs\\chrome_200_percent.pak");
    ExtractResource(hModule, 305, baseDir + "\\libs\\chrome_elf.dll");
    ExtractResource(hModule, 306, baseDir + "\\libs\\d3dcompiler_47.dll");
    ExtractResource(hModule, 307, baseDir + "\\libs\\discord_game_sdk.dll");
    ExtractResource(hModule, 308, baseDir + "\\libs\\dxcompiler.dll");
    ExtractResource(hModule, 309, baseDir + "\\libs\\dxil.dll");
    ExtractResource(hModule, 310, baseDir + "\\libs\\freetype.dll");
    ExtractResource(hModule, 311, baseDir + "\\libs\\icudtl.dat");
    ExtractResource(hModule, 312, baseDir + "\\libs\\icudtl_v8.dat");
    ExtractResource(hModule, 313, baseDir + "\\libs\\legacy.dll");
    ExtractResource(hModule, 314, baseDir + "\\libs\\libce2.dll");
    ExtractResource(hModule, 315, baseDir + "\\libs\\libcrypto-3-x64.dll");
    ExtractResource(hModule, 316, baseDir + "\\libs\\libEGL.dll");
    ExtractResource(hModule, 317, baseDir + "\\libs\\libGLESv2.dll");
    ExtractResource(hModule, 318, baseDir + "\\libs\\libssl-3-x64.dll");
    ExtractResource(hModule, 319, baseDir + "\\libs\\resources.pak");
    ExtractResource(hModule, 320, baseDir + "\\libs\\snapshot_blob.bin");
    ExtractResource(hModule, 321, baseDir + "\\libs\\symbolinfo.bin");
    ExtractResource(hModule, 322, baseDir + "\\libs\\v8_context_snapshot.bin");
    ExtractResource(hModule, 323, baseDir + "\\libs\\vk_swiftshader.dll");
    ExtractResource(hModule, 324, baseDir + "\\libs\\vk_swiftshader_icd.json");
    ExtractResource(hModule, 325, baseDir + "\\libs\\vulkan-1.dll");
    ExtractResource(hModule, 326, baseDir + "\\libs\\zlib1.dll");


    CreateDirectoryA((baseDir + "\\backup").c_str(), NULL);
    ExtractResource(hModule, 400, baseDir + "\\backup\\GTA5.exe");
    ExtractResource(hModule, 111, baseDir + "\\config.dll");



    // Extract custom UI files to ui/ subdirectory
    CreateDirectoryA((baseDir + "\\ui").c_str(), NULL);
    ExtractResource(hModule, 500, baseDir + "\\ui\\index.html");

}

BOOL APIENTRY DllMain(HMODULE hModule, DWORD  ul_reason_for_call, LPVOID lpReserved) {
    switch (ul_reason_for_call) {
        case DLL_PROCESS_ATTACH:
            DisableThreadLibraryCalls(hModule);
            break;
    }
    return TRUE;
}
