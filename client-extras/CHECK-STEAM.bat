@echo off
title NSM Steam check
echo.
echo  NSM Steam presence check - this only LOOKS, it changes nothing.
echo  Best: keep nsm.exe open while running this.
echo  Takes about 20-60 seconds, then a report opens on your Desktop.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-steam.ps1"
