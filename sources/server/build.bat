@echo off
setlocal
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64

echo Compiling resources...
rc /fo resources.res resources.rc

echo Compiling gtamp-server.exe...
cl.exe /nologo /EHsc /MD server.cpp resources.res /I..\cpp /Fe:..\..\server\gtamp-server.exe Ws2_32.lib Advapi32.lib Crypt32.lib User32.lib Winhttp.lib

echo Cleaning up...
del *.obj *.res
echo Build Successful! Files are in C:\Users\aspidev\Desktop\gtamp\server
pause
