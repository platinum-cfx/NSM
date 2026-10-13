/* minimal reproducer: same CryptoAPI sequence as connect.cpp DecryptDataAES,
 * verbose per-chunk results. usage: test_decrypt.exe <in> <out> */
#include <windows.h>
#include <stdio.h>
#include <wincrypt.h>

int main(int argc, char** argv)
{
    const BYTE aesKey[32] = {
        0x2B, 0x7E, 0x15, 0x16, 0x28, 0xAE, 0xD2, 0xA6,
        0xAB, 0xF7, 0x15, 0x88, 0x09, 0xCF, 0x4F, 0x3C,
        0x76, 0x2E, 0x71, 0x60, 0xF3, 0x8B, 0x4D, 0xA5,
        0x6A, 0x78, 0x4D, 0x90, 0x45, 0x19, 0x0C, 0xFE
    };
    FILE *fin, *fout;
    BYTE iv[16], buffer[4096 + 16];
    HCRYPTPROV hProv;
    HCRYPTKEY hKey;
    struct KeyBlob { BLOBHEADER hdr; DWORD keySize; BYTE keyData[32]; } blob;
    DWORD mode, pad, toRead, bytesRead, dataLen, chunk = 0;
    long fsize, dataSize, processed = 0;
    BOOL isFinal;

    if (argc < 3) { printf("usage: test_decrypt in out\n"); return 1; }
    fin = fopen(argv[1], "rb");
    if (!fin) { printf("cannot open input\n"); return 1; }
    fseek(fin, 0, SEEK_END); fsize = ftell(fin); fseek(fin, 16, SEEK_SET);
    dataSize = fsize - 16;
    rewind(fin);
    if (fread(iv, 1, 16, fin) != 16) { printf("short iv read\n"); return 1; }
    printf("file=%s size=%ld data=%ld blocks=%ld\n", argv[1], fsize, dataSize, dataSize % 16);

    if (!CryptAcquireContext(&hProv, NULL, MS_ENH_RSA_AES_PROV, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        printf("CryptAcquireContext failed %lu\n", GetLastError()); return 1;
    }
    blob.hdr.bType = PLAINTEXTKEYBLOB; blob.hdr.bVersion = CUR_BLOB_VERSION;
    blob.hdr.reserved = 0; blob.hdr.aiKeyAlg = CALG_AES_256;
    blob.keySize = 32; memcpy(blob.keyData, aesKey, 32);
    if (!CryptImportKey(hProv, (BYTE*)&blob, sizeof(blob), 0, 0, &hKey)) {
        printf("CryptImportKey failed %lu\n", GetLastError()); return 1;
    }
    mode = CRYPT_MODE_CBC;
    if (!CryptSetKeyParam(hKey, KP_MODE, (BYTE*)&mode, 0)) printf("KP_MODE failed %lu\n", GetLastError());
    if (!CryptSetKeyParam(hKey, KP_IV, iv, 0)) printf("KP_IV failed %lu\n", GetLastError());
    pad = 0; /* query current padding */
    if (CryptGetKeyParam(hKey, KP_PADDING, (BYTE*)&pad, &(DWORD){4}, 0)) printf("KP_PADDING current=%lu\n", pad);
    else printf("KP_PADDING query failed %lu\n", GetLastError());

    fout = fopen(argv[2], "wb");
    while (processed < dataSize) {
        toRead = 4096;
        if (dataSize - processed < (long)toRead) toRead = (DWORD)(dataSize - processed);
        bytesRead = (DWORD)fread(buffer, 1, toRead, fin);
        if (bytesRead == 0) { printf("chunk %lu: fread returned 0 at %ld\n", chunk, processed); return 1; }
        isFinal = (processed + (long)bytesRead >= dataSize);
        dataLen = bytesRead;
        if (!CryptDecrypt(hKey, 0, isFinal, 0, buffer, &dataLen)) {
            printf("chunk %lu: CryptDecrypt FAILED err=%lu (toRead=%lu final=%d at offset %ld)\n",
                   chunk, GetLastError(), toRead, isFinal, processed);
            return 2;
        }
        fwrite(buffer, 1, dataLen, fout);
        processed += bytesRead;
        chunk++;
    }
    printf("OK: %lu chunks, %ld bytes plaintext\n", chunk, processed);
    fclose(fin); fclose(fout);
    return 0;
}
