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

extern "C" __declspec(dllexport) void RunExtractor(const char* destDir) {
    HMODULE hModule = GetModuleHandleA("mp5_ext.dll");
    string baseDir = destDir;
    
    // Create directories
    CreateDirectoryA((baseDir + "\\libs").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\cef").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\cef\\locales").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\backup").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\ui").c_str(), NULL);
    
    ExtractResource(hModule, 300, baseDir + "\\libs\\bass.dll");
    ExtractResource(hModule, 301, baseDir + "\\libs\\bassmix.dll");
    ExtractResource(hModule, 302, baseDir + "\\libs\\bass_fx.dll");
    ExtractResource(hModule, 303, baseDir + "\\libs\\chrome_100_percent.pak");
    ExtractResource(hModule, 304, baseDir + "\\libs\\chrome_200_percent.pak");
    ExtractResource(hModule, 305, baseDir + "\\libs\\chrome_elf.dll");
    ExtractResource(hModule, 306, baseDir + "\\libs\\d3dcompiler_47.dll");
    ExtractResource(hModule, 307, baseDir + "\\libs\\discord_game_sdk.dll");
    ExtractResource(hModule, 309, baseDir + "\\libs\\dxil.dll");
    ExtractResource(hModule, 310, baseDir + "\\libs\\freetype.dll");
    ExtractResource(hModule, 313, baseDir + "\\libs\\legacy.dll");
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

}
