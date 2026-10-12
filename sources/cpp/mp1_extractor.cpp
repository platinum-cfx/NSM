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
    HMODULE hModule = GetModuleHandleA("mp1_ext.dll");
    string baseDir = destDir;
    
    // Create directories
    CreateDirectoryA((baseDir + "\\libs").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\cef").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\cef\\locales").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\backup").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\ui").c_str(), NULL);
    
    ExtractResource(hModule, 314, baseDir + "\\libs\\libce2.dll");

}
