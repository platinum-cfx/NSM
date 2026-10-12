@echo off
cd /d "%~dp0"
if exist "packs\mp1.pack" (
  echo packs\mp1.pack is already in place - NSM is ready.
  pause
  exit /b 0
)
if exist "mp1.pack" (
  if not exist packs mkdir packs
  move "mp1.pack" "packs\mp1.pack"
  echo Moved mp1.pack into the packs folder - NSM is ready.
  pause
  exit /b 0
)
echo Could not find mp1.pack in this folder.
echo Copy mp1.pack from your OLD working NSM folder into THIS folder,
echo then double-click this file again.
pause
