@echo off
cd /d "%~dp0"
if exist "%~dp0NSM.exe" (
    start "" "%~dp0NSM.exe"
) else (
    start "" "%~dp0connect.exe"
)
exit
