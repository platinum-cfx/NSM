@echo off
title NSM Steam presence setup

echo ==================================================
echo  NSM Steam presence - the FiveM trick
echo  Places steam_appid.txt (244310) next to your
echo  gtamp client exe, so Steam shows
echo  "Playing Source SDK Base 2007" like FiveM does.
echo ==================================================
echo.

cd /d "%~dp0"
if not exist "steam_appid.txt" (
  echo [!] steam_appid.txt is missing next to this script.
  pause
  exit /b 1
)

echo A file picker will open. Select the exe you launch
echo to play - the gtamp client / launcher exe.
echo.

set "TARGET="
for /f "usebackq delims=" %%P in (`powershell -NoProfile -STA -Command "Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.OpenFileDialog; $f.Title = 'Pick your gtamp client exe'; $f.Filter = 'Executable (*.exe)|*.exe'; $f.CheckFileExists = $true; if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $f.FileName }"`) do set "TARGET=%%P"

if not defined TARGET (
  echo [!] Nothing selected - nothing was changed.
  pause
  exit /b 1
)

for %%F in ("%TARGET%") do set "TDIR=%%~dpF"

if exist "%TDIR%steam_appid.txt" (
  copy /y "%TDIR%steam_appid.txt" "%TDIR%steam_appid.backup.txt" >nul
  echo [ok] existing steam_appid.txt backed up to steam_appid.backup.txt
)

copy /y "steam_appid.txt" "%TDIR%steam_appid.txt" >nul
if errorlevel 1 (
  echo [!] Could not write to "%TDIR%"
  echo     Pick a folder your user can write to, or run this as admin.
  pause
  exit /b 1
)

echo [ok] steam_appid.txt placed in: %TDIR%
echo.
echo Next:
echo   1. Restart Steam once - it caches the status
echo   2. Launch the game like usual
echo   3. Steam will show: Playing Source SDK Base 2007
echo.
echo To undo: delete steam_appid.txt in that folder,
echo or rename steam_appid.backup.txt back over it.
echo.
pause
