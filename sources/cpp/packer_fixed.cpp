// packer_fixed.cpp - builds .pack files the launcher can actually decrypt.
//
// WHY THIS EXISTS: sources/cpp/packer.cpp derives its AES key from
// SHA-256("GTAMP_SECURE_KEY_2026_!@#") and writes NO IV, while the launcher
// (connect.cpp DecryptDataAES) decrypts with the fixed key below and expects
// "IV(16 bytes) || AES-256-CBC/PKCS7(data)". Packs made by the old packer
// could never be decrypted by the launcher - the real full mp1.pack shipped
// on the game-packs release was one of them and produced the
// "mp1.pack not found" false error. This tool emits the launcher's format:
//   output = <16-byte random IV> <AES-256-CBC(data, PKCS7 padding)>
#define _WIN32_WINNT 0x0A00
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <wincrypt.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <string>

using namespace std;

// MUST match connect.cpp DecryptDataAES
static const BYTE PACK_KEY[32] = {
    0x2B, 0x7E, 0x15, 0x16, 0x28, 0xAE, 0xD2, 0xA6,
    0xAB, 0xF7, 0x15, 0x88, 0x09, 0xCF, 0x4F, 0x3C,
    0x76, 0x2E, 0x71, 0x60, 0xF3, 0x8B, 0x4D, 0xA5,
    0x6A, 0x78, 0x4D, 0x90, 0x45, 0x19, 0x0C, 0xFE
};

int main(int argc, char** argv) {
    if (argc != 3) {
        cout << "usage: packer.exe <input_file> <output_pack>" << endl;
        cout << "output = <16-byte IV> <AES-256-CBC/PKCS7(input)>" << endl;
        return 1;
    }
    ifstream in(argv[1], ios::binary);
    if (!in) { cerr << "cannot open input: " << argv[1] << endl; return 1; }
    vector<char> data((istreambuf_iterator<char>(in)), istreambuf_iterator<char>());
    in.close();
    if (data.empty()) { cerr << "input is empty" << endl; return 1; }
    cout << "input: " << data.size() << " bytes" << endl;

    HCRYPTPROV hProv;
    if (!CryptAcquireContext(&hProv, NULL, MS_ENH_RSA_AES_PROV, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        cerr << "CryptAcquireContext failed " << GetLastError() << endl; return 1;
    }
    BYTE iv[16];
    if (!CryptGenRandom(hProv, 16, iv)) { cerr << "CryptGenRandom failed" << endl; return 1; }

    struct KeyBlob { BLOBHEADER hdr; DWORD keySize; BYTE keyData[32]; } blob;
    blob.hdr.bType = PLAINTEXTKEYBLOB; blob.hdr.bVersion = CUR_BLOB_VERSION;
    blob.hdr.reserved = 0; blob.hdr.aiKeyAlg = CALG_AES_256;
    blob.keySize = 32; memcpy(blob.keyData, PACK_KEY, 32);

    HCRYPTKEY hKey;
    if (!CryptImportKey(hProv, (BYTE*)&blob, sizeof(blob), 0, 0, &hKey)) {
        cerr << "CryptImportKey failed " << GetLastError() << endl; return 1;
    }
    DWORD mode = CRYPT_MODE_CBC;
    CryptSetKeyParam(hKey, KP_MODE, (BYTE*)&mode, 0);
    CryptSetKeyParam(hKey, KP_IV, iv, 0);

    DWORD dataLen = (DWORD)data.size();
    DWORD bufLen = dataLen + 16;
    data.resize(bufLen);
    if (!CryptEncrypt(hKey, 0, TRUE, 0, (BYTE*)data.data(), &dataLen, bufLen)) {
        cerr << "CryptEncrypt failed " << GetLastError() << endl; return 1;
    }
    cout << "ciphertext: " << dataLen << " bytes (PKCS7)" << endl;

    ofstream out(argv[2], ios::binary);
    if (!out) { cerr << "cannot open output: " << argv[2] << endl; return 1; }
    out.write((const char*)iv, 16);
    out.write(data.data(), dataLen);
    out.close();
    cout << "wrote " << argv[2] << ": " << (unsigned long long)(dataLen + 16) << " bytes total" << endl;

    CryptDestroyKey(hKey);
    CryptReleaseContext(hProv, 0);
    return 0;
}
