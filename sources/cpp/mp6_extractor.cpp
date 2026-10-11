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
    HMODULE hModule = GetModuleHandleA("mp6_ext.dll");
    string baseDir = destDir;
    
    // Create directories
    CreateDirectoryA((baseDir + "\\libs").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\cef").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\cef\\locales").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\backup").c_str(), NULL);
    CreateDirectoryA((baseDir + "\\ui").c_str(), NULL);
    
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

}
