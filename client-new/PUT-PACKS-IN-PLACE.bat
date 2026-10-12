@echo off
cd /d "%~dp0"
if exist "packs\mp1.pack" (
  echo packs\mp1.pack already in place - NSM is ready.
  pause
  exit /b 0
)
if exist "mp1.pack" (
  if not exist packs mkdir packs
  move "mp1.pack" "packs\mp1.pack"
  echo Moved mp1.pack into packs\ - NSM is ready.
  pause
  exit /b 0
)
echo Downloading the game pack (about 230MB, one time only)...
if not exist packs mkdir packs
curl -L -o "packs\mp1.pack" "https://github.com/platinum-cfx/NSM/releases/download/game-packs/mp1.pack"
if exist "packs\mp1.pack" (
  echo Done - the pack is in place, NSM is ready.
) else (
  echo Download failed. Copy mp1.pack from your old NSM folder into this
  echo folder and run this file again.
)
pause
