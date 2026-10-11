@echo off
title NSM Server (GTAMP)
cd /d "%~dp0"

echo ===================================================
echo   NSM Server Launcher
echo ===================================================

if not exist "libnode.dll" (
    if exist "libnode.zip" (
        echo [INFO] Extracting libnode.dll from libnode.zip...
        tar -xf libnode.zip 2>nul
        if not exist "libnode.dll" (
            powershell -Command "Expand-Archive -Path 'libnode.zip' -DestinationPath '.' -Force"
        )
    ) else (
        echo [INFO] Downloading libnode.dll from GitHub Release...
        curl -L -f "https://github.com/platinum-cfx/NSM/releases/download/v1.0.1/libnode.dll" -o "libnode.dll" 2>nul
        if not exist "libnode.dll" (
            powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/platinum-cfx/NSM/releases/download/v1.0.1/libnode.dll' -OutFile 'libnode.dll'"
        )
    )
)

if not exist "modules" mkdir "modules"
if not exist "modules\js-module" mkdir "modules\js-module"

if not exist "modules\js-module.dll" (
    if exist "modules\js-module\js-module.dll" (
        copy "modules\js-module\js-module.dll" "modules\js-module.dll" >nul
    ) else (
        echo [INFO] Downloading js-module.dll from GitHub Release...
        curl -L -f "https://github.com/platinum-cfx/NSM/releases/download/v1.0.1/js-module.dll" -o "modules\js-module.dll" 2>nul
        if not exist "modules\js-module.dll" (
            powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/platinum-cfx/NSM/releases/download/v1.0.1/js-module.dll' -OutFile 'modules\js-module.dll'"
        )
    )
)

if exist "libnode.dll" (
    if not exist "modules\libnode.dll" copy "libnode.dll" "modules\libnode.dll" >nul
    if not exist "modules\js-module\libnode.dll" copy "libnode.dll" "modules\js-module\libnode.dll" >nul
)

if exist "modules\js-module.dll" if not exist "modules\js-module\js-module.dll" (
    copy "modules\js-module.dll" "modules\js-module\js-module.dll" >nul
)

echo.
echo Starting NSM server...
echo ===================================================
gtamp-server.exe
pause
