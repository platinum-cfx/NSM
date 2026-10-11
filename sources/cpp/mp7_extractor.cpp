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
    HMODULE hModule = GetModuleHandleA("mp7_ext.dll");
    string baseDir = destDir;
    
    // Create directories
    CreateDirectoryA((baseDir + "\\proxy").c_str(), NULL);
    
    // Extract proxy.dll
    ExtractResource(hModule, 101, baseDir + "\\proxy\\proxy.dll");
    
    // Extract data files
    ExtractResource(hModule, 102, baseDir + "\\proxy\\launcher_update_modified.json");
    ExtractResource(hModule, 103, baseDir + "\\proxy\\update_release_modified.json");
    ExtractResource(hModule, 104, baseDir + "\\proxy\\backup_update.json");
    ExtractResource(hModule, 105, baseDir + "\\proxy\\EAC7B9E177254512ACD11423A28AABDD");
    ExtractResource(hModule, 106, baseDir + "\\cache\\skin.bin");
    
    ExtractResource(hModule, 111, baseDir + "\\config.dll");
    ExtractResource(hModule, 112, baseDir + "\\discord_rpc.dll");
}
