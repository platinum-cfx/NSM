@echo off
title NSM FiveM Server
cd /d "%~dp0server-data"
if not exist "..\FXServer\FXServer.exe" (
    echo [ERROR] FXServer not found. Run install-nsm-fivem.ps1 first.
    pause
    exit /b 1
)
"..\FXServer\FXServer.exe" +exec server.cfg
pause
