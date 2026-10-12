@echo off
rem ============================================================
rem  NSM server - ONE-CLICK fixer + launcher
rem  Runs fix-jsmodule.ps1 (downloads the official js-module that
rem  matches your server exe, SHA1-verified), then starts the server.
rem  Safe to run every time - it skips what is already correct.
rem ============================================================
cd /d "%~dp0"
title NSM server

echo === Fixing the js-module (one-time download, ~100MB) ===
powershell -NoProfile -ExecutionPolicy Bypass -File fix-jsmodule.ps1
if errorlevel 1 (
    echo.
    echo The fixer did not complete - read the message above.
    echo Paste that message to me and I will handle it.
    pause
    exit /b 1
)

if not exist "mysql.json" (
    echo.
    echo === WARNING: mysql.json not found ===
    echo ESX resources will FAIL to start without it.
    echo Fix: copy mysql.json.example to mysql.json and fill in
    echo your MariaDB password. See docs\QUICKSTART-FIVEM.md
    echo.
    pause
)

echo.
echo === Starting gtamp-server.exe ===
gtamp-server.exe
pause
