@echo off
setlocal

REM Find vcvars64.bat
set "VS_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community"
if not exist "%VS_PATH%\VC\Auxiliary\Build\vcvars64.bat" (
    echo Visual Studio 2022 Community not found at %VS_PATH%
    exit /b 1
)

call "%VS_PATH%\VC\Auxiliary\Build\vcvars64.bat"

set "OUTDIR=%~dp0..\client-new"
if not exist "%OUTDIR%" mkdir "%OUTDIR%"

cd "%~dp0"

echo [1/6] Compiling proxy.dll...
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\proxy\proxy.cpp /link /OUT:proxy.dll ws2_32.lib advapi32.lib crypt32.lib
if errorlevel 1 goto error

echo [2/6] Compiling config.dll...
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\config\config.cpp /link /OUT:config.dll user32.lib advapi32.lib
if errorlevel 1 goto error

echo [3/6] Compiling discord_rpc.dll...
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\discord\discord_rpc.cpp /link /OUT:discord_rpc.dll ws2_32.lib advapi32.lib user32.lib
if errorlevel 1 goto error

echo [4/6] Compiling resources...
rc.exe /nologo resources\mp7.rc
if errorlevel 1 goto error

rc.exe /nologo resources\mp1.rc
if errorlevel 1 goto error
rc.exe /nologo resources\mp2.rc
if errorlevel 1 goto error
rc.exe /nologo resources\mp3.rc
if errorlevel 1 goto error
rc.exe /nologo resources\mp4.rc
if errorlevel 1 goto error
rc.exe /nologo resources\mp5.rc
if errorlevel 1 goto error
rc.exe /nologo resources\mp6.rc
if errorlevel 1 goto error

echo [5/6] Compiling extractors...
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\mp7_extractor.cpp resources\mp7.res /link /OUT:mp7_extractor.dll
if errorlevel 1 goto error

cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\mp1_extractor.cpp resources\mp1.res /link /OUT:mp1_extractor.dll
if errorlevel 1 goto error
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\mp2_extractor.cpp resources\mp2.res /link /OUT:mp2_extractor.dll
if errorlevel 1 goto error
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\mp3_extractor.cpp resources\mp3.res /link /OUT:mp3_extractor.dll
if errorlevel 1 goto error
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\mp4_extractor.cpp resources\mp4.res /link /OUT:mp4_extractor.dll
if errorlevel 1 goto error
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\mp5_extractor.cpp resources\mp5.res /link /OUT:mp5_extractor.dll
if errorlevel 1 goto error
cl.exe /nologo /O2 /LD /EHsc /std:c++17 cpp\mp6_extractor.cpp resources\mp6.res /link /OUT:mp6_extractor.dll
if errorlevel 1 goto error

echo [6/8] Compiling packer.exe and encrypting packs...
cl.exe /nologo /O2 /EHsc /std:c++17 cpp\packer.cpp /link /OUT:packer.exe crypt32.lib user32.lib advapi32.lib
if errorlevel 1 goto error

packer.exe mp7_extractor.dll mp7.pack
if errorlevel 1 goto error
packer.exe mp1_extractor.dll mp1.pack
if errorlevel 1 goto error
packer.exe mp2_extractor.dll mp2.pack
if errorlevel 1 goto error
packer.exe mp3_extractor.dll mp3.pack
if errorlevel 1 goto error
packer.exe mp4_extractor.dll mp4.pack
if errorlevel 1 goto error
packer.exe mp5_extractor.dll mp5.pack
if errorlevel 1 goto error
packer.exe mp6_extractor.dll mp6.pack
if errorlevel 1 goto error

echo [7/8] Generating manifest...
cl.exe /nologo /O2 /EHsc /std:c++17 cpp\manifest_generator.cpp /link /OUT:manifest_generator.exe crypt32.lib advapi32.lib
if errorlevel 1 goto error
manifest_generator.exe
if errorlevel 1 goto error

echo [8/8] Compiling connect.exe...
rc.exe /nologo resources\connect.rc
if errorlevel 1 goto error

cl.exe /nologo /O2 /EHsc /std:c++17 cpp\connect.cpp resources\connect.res /link /OUT:connect.exe user32.lib shell32.lib advapi32.lib crypt32.lib ws2_32.lib
if errorlevel 1 goto error

echo Moving files to release folder...
move /Y connect.exe "%OUTDIR%"
if not exist "%OUTDIR%\launcher" mkdir "%OUTDIR%\launcher"
copy /Y launcher\index.html "%OUTDIR%\launcher\index.html"
if not exist "%OUTDIR%\packs" mkdir "%OUTDIR%\packs"
move /Y mp7.pack "%OUTDIR%\packs"
move /Y mp1.pack "%OUTDIR%\packs"
move /Y mp2.pack "%OUTDIR%\packs"
move /Y mp3.pack "%OUTDIR%\packs"
move /Y mp4.pack "%OUTDIR%\packs"
move /Y mp5.pack "%OUTDIR%\packs"
move /Y mp6.pack "%OUTDIR%\packs"

del *.obj *.lib *.exp *.res

echo.
echo Build Successful! Files are in %OUTDIR%
pause
exit /b 0

:error
echo Build Failed!
pause
exit /b 1
