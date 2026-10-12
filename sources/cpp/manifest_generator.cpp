#include <windows.h>
#include <wincrypt.h>
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <regex>
#include <sstream>
#include <iomanip>

#pragma comment(lib, "crypt32.lib")
#pragma comment(lib, "advapi32.lib")

using namespace std;

// Function to compute SHA1 of a file
string ComputeFileSHA1(const string& filename) {
    HCRYPTPROV hProv = 0;
    HCRYPTHASH hHash = 0;
    string result = "";

    if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_FULL, CRYPT_VERIFYCONTEXT)) {
        return "";
    }

    if (!CryptCreateHash(hProv, CALG_SHA1, 0, 0, &hHash)) {
        CryptReleaseContext(hProv, 0);
        return "";
    }

    ifstream file(filename, ios::binary);
    if (!file.is_open()) {
        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return "";
    }

    const int bufSize = 32768;
    char* buffer = new char[bufSize];
    while (file.read(buffer, bufSize)) {
        CryptHashData(hHash, (BYTE*)buffer, bufSize, 0);
    }
    if (file.gcount() > 0) {
        CryptHashData(hHash, (BYTE*)buffer, (DWORD)file.gcount(), 0);
    }
    delete[] buffer;

    DWORD hashLen = 0;
    CryptGetHashParam(hHash, HP_HASHVAL, NULL, &hashLen, 0);
    
    if (hashLen > 0) {
        BYTE* hash = new BYTE[hashLen];
        if (CryptGetHashParam(hHash, HP_HASHVAL, hash, &hashLen, 0)) {
            ostringstream oss;
            for (DWORD i = 0; i < hashLen; i++) {
                oss << hex << setw(2) << setfill('0') << (int)hash[i];
            }
            result = oss.str();
        }
        delete[] hash;
    }

    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);
    return result;
}

// Function to get file size
size_t GetFileSizeStr(const string& filename) {
    ifstream file(filename, ios::binary | ios::ate);
    if (!file.is_open()) return 0;
    return file.tellg();
}

int main() {
    cout << "Starting generator..." << endl;
    map<int, string> rcPaths;
    map<int, string> extPaths;

    // Parse all mpX.rc files
    for (int i = 1; i <= 7; ++i) {
        string rcName = "resources/mp" + to_string(i) + ".rc";
        cout << "Parsing " << rcName << endl;
        ifstream file(rcName);
        if (!file.is_open()) continue;
        string line;
        while (getline(file, line)) {
            if (line.find("RCDATA") != string::npos) {
                size_t space1 = line.find(' ');
                if (space1 == string::npos) continue;
                int id = stoi(line.substr(0, space1));
                
                size_t quote1 = line.find('"');
                size_t quote2 = line.rfind('"');
                if (quote1 != string::npos && quote2 != string::npos && quote1 < quote2) {
                    string path = line.substr(quote1 + 1, quote2 - quote1 - 1);
                    string cleanPath = path;
                    size_t pos = 0;
                    while ((pos = cleanPath.find("\\\\", pos)) != string::npos) {
                        cleanPath.replace(pos, 2, "\\");
                        pos += 1;
                    }
                    string realPath = "resources\\" + cleanPath;
                    rcPaths[id] = realPath;
                }
            }
        }
    }

    // Parse all mpX_extractor.cpp files
    cout << "Parsing extractors..." << endl;
    for (int i = 1; i <= 7; ++i) {
        string extName = "cpp/mp" + to_string(i) + "_extractor.cpp";
        cout << "Parsing " << extName << endl;
        ifstream file(extName);
        if (!file.is_open()) continue;
        string line;
        while (getline(file, line)) {
            size_t pos = line.find("ExtractResource");
            if (pos != string::npos && line.find("bool ExtractResource") == string::npos) {
                size_t comma1 = line.find(',', pos);
                size_t comma2 = line.find(',', comma1 + 1);
                if (comma1 != string::npos && comma2 != string::npos) {
                    string idStr = line.substr(comma1 + 1, comma2 - comma1 - 1);
                    idStr.erase(0, idStr.find_first_not_of(" \t"));
                    size_t endpos = idStr.find_last_not_of(" \t");
                    if(string::npos != endpos) idStr = idStr.substr(0, endpos+1);
                    
                    int id = 0;
                    try {
                        id = stoi(idStr);
                    } catch (...) {
                        cout << "Failed to parse ID: " << idStr << endl;
                        continue;
                    }

                    size_t quote1 = line.find('"', comma2);
                    size_t quote2 = line.find('"', quote1 + 1);
                    if (quote1 != string::npos && quote2 != string::npos) {
                        string destPath = line.substr(quote1 + 1, quote2 - quote1 - 1);
                        size_t p = 0;
                        while ((p = destPath.find("\\\\", p)) != string::npos) {
                            destPath.replace(p, 2, "\\");
                            p += 1;
                        }
                        extPaths[id] = destPath;
                    }
                }
            }
        }
    }

    cout << "Generating manifest.h..." << endl;
    // Generate manifest.h
    ofstream out("cpp/manifest.h");
    out << "#pragma once\n";
    out << "#include <cstddef>\n\n";
    out << "struct FileManifest {\n";
    out << "    const char* relPath;\n";
    out << "    size_t expectedSize;\n";
    out << "    const char* expectedSha1;\n";
    out << "};\n\n";
    
    out << "FileManifest g_Manifest[] = {\n";

    for (auto const& [id, relPath] : extPaths) {
        cout << "Processing ID " << id << " -> " << relPath << endl;
        string realPath = rcPaths[id];
        size_t fsize = GetFileSizeStr(realPath);
        string sha1 = ComputeFileSHA1(realPath);
        
        if (fsize == 0 && sha1 == "") {
            cout << "Warning: Could not read file for ID " << id << " at " << realPath << endl;
        }

        string escapedRelPath = relPath;
        size_t p = 0;
        while ((p = escapedRelPath.find("\\", p)) != string::npos) {
            escapedRelPath.replace(p, 1, "\\\\");
            p += 2;
        }

        out << "    { \"" << escapedRelPath << "\", " << fsize << ", \"" << sha1 << "\" },\n";
    }

    out << "};\n";
    out << "const int g_ManifestSize = sizeof(g_Manifest) / sizeof(FileManifest);\n";
    out.close();

    cout << "manifest.h generated successfully with " << extPaths.size() << " entries." << endl;
    return 0;
}
