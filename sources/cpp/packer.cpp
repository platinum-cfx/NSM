#define _WIN32_WINNT 0x0A00
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <wincrypt.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <string>

#pragma comment(lib, "crypt32.lib")

using namespace std;

const string SECRET_KEY = "GTAMP_SECURE_KEY_2026_!@#";

bool EncryptFileAES(const string& inputFile, const string& outputFile) {
    ifstream in(inputFile, ios::binary);
    if (!in) {
        cerr << "Failed to open input file: " << inputFile << endl;
        return false;
    }
    vector<char> data((istreambuf_iterator<char>(in)), istreambuf_iterator<char>());
    in.close();

    HCRYPTPROV hProv;
    HCRYPTHASH hHash;
    HCRYPTKEY hKey;

    if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        cerr << "CryptAcquireContext failed" << endl;
        return false;
    }

    if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) {
        cerr << "CryptCreateHash failed" << endl;
        CryptReleaseContext(hProv, 0);
        return false;
    }

    if (!CryptHashData(hHash, (const BYTE*)SECRET_KEY.c_str(), SECRET_KEY.length(), 0)) {
        cerr << "CryptHashData failed" << endl;
        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return false;
    }

    if (!CryptDeriveKey(hProv, CALG_AES_256, hHash, 0, &hKey)) {
        cerr << "CryptDeriveKey failed" << endl;
        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return false;
    }

    DWORD dataLen = data.size();
    DWORD bufLen = dataLen + 16;
    data.resize(bufLen);

    if (!CryptEncrypt(hKey, 0, TRUE, 0, (BYTE*)data.data(), &dataLen, bufLen)) {
        cerr << "CryptEncrypt failed. Error: " << GetLastError() << endl;
        CryptDestroyKey(hKey);
        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return false;
    }

    ofstream out(outputFile, ios::binary);
    if (!out) {
        cerr << "Failed to open output file: " << outputFile << endl;
        CryptDestroyKey(hKey);
        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return false;
    }
    out.write(data.data(), dataLen);
    out.close();

    CryptDestroyKey(hKey);
    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);

    cout << "Successfully encrypted " << inputFile << " -> " << outputFile << endl;
    return true;
}

int main(int argc, char** argv) {
    if (argc != 3) {
        cout << "Usage: packer.exe <input_dll> <output_pack>" << endl;
        cout << "Example: packer.exe multiplayer.dll data.pack" << endl;
        return 1;
    }

    string inputFile = argv[1];
    string outputFile = argv[2];

    if (EncryptFileAES(inputFile, outputFile)) {
        return 0;
    }
    return 1;
}
