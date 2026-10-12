@echo off
title GTAMP Masterlist
cd /d "%~dp0"

echo ========================================
echo        GTAMP Masterlist Service
echo ========================================
echo.

if exist "%~dp0masterlist.exe" (
    echo Starting standalone masterlist.exe on port 8080...
    "%~dp0masterlist.exe"
    pause
    exit /b 0
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Neither masterlist.exe nor Node.js was found!
    echo Please install Node.js from https://nodejs.org/ or ensure masterlist.exe is present.
    echo.
    pause
    exit /b 1
)

echo Starting Masterlist with Node.js on port 8080...
node server.js
pause
