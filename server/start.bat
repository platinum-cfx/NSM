@echo off
title NSM / GTAMP Server
cd /d "%~dp0"

echo ===================================================
echo   NSM Server Launcher
echo ===================================================

if not exist "libnode.dll" (
    echo [INFO] libnode.dll not found in server directory.
    echo [INFO] Downloading libnode.dll from GitHub Release...
    curl -L -f "https://github.com/platinum-cfx/NSM/releases/download/v1.0.1/libnode.dll" -o "libnode.dll"
    if not exist "libnode.dll" (
        echo [INFO] Retrying with PowerShell...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/platinum-cfx/NSM/releases/download/v1.0.1/libnode.dll' -OutFile 'libnode.dll'"
    )
)

if not exist "modules\js-module.dll" (
    if not exist "modules" mkdir "modules"
    echo [INFO] modules\js-module.dll not found.
    echo [INFO] Downloading js-module.dll from GitHub Release...
    curl -L -f "https://github.com/platinum-cfx/NSM/releases/download/v1.0.1/js-module.dll" -o "modules\js-module.dll"
    if not exist "modules\js-module.dll" (
        echo [INFO] Retrying with PowerShell...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/platinum-cfx/NSM/releases/download/v1.0.1/js-module.dll' -OutFile 'modules\js-module.dll'"
    )
)

if exist "libnode.dll" if not exist "modules\libnode.dll" (
    copy "libnode.dll" "modules\libnode.dll" >nul
)

echo.
echo Starting server...
echo ===================================================
gtamp-server.exe
pause
