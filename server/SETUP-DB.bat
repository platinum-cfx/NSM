@echo off
title NSM database setup (MariaDB + ESX schema + mysql.json)

echo ==================================================
echo  NSM one-click database setup
echo  - creates the 'fivem' database
echo  - imports the ESX schema
echo  - writes mysql.json next to gtamp-server.exe
echo ==================================================
echo.

REM --- find the mysql client -------------------------------------------
set "MYSQL="
where mysql >nul 2>nul && set "MYSQL=mysql"
if not defined MYSQL for /d %%D in ("C:\Program Files\MariaDB*") do if exist "%%D\bin\mysql.exe" set "MYSQL=%%D\bin\mysql.exe"
if not defined MYSQL for /d %%D in ("C:\Program Files (x86)\MariaDB*") do if exist "%%D\bin\mysql.exe" set "MYSQL=%%D\bin\mysql.exe"
if defined MYSQL goto :found

echo [!] mysql.exe not found - MariaDB does not look installed.
echo.
echo     1. Download the MariaDB server installer from:
echo        https://mariadb.org/download/
echo     2. Run it. When the installer asks for a root password,
echo        choose one you will remember.
echo     3. Run this file again.
echo.
pause
exit /b 1

:found
echo [ok] mysql client: %MYSQL%
echo.

REM --- ask for the root password ---------------------------------------
set "PASS="
set /p PASS=MariaDB root password: 
echo.

REM --- test the connection ---------------------------------------------
"%MYSQL%" -u root -p"%PASS%" --connect-timeout=10 -e "SELECT 1;" >nul 2>nul
if errorlevel 1 goto :connfail
echo [ok] connected to MariaDB as root
echo.
goto :createdb

:connfail
echo [!] Could not connect to MariaDB with that password.
echo     - Is the password right?
echo     - Is the MariaDB service running? Check services.msc
echo       (it should be listed as MariaDB, started).
echo.
pause
exit /b 1

:createdb
"%MYSQL%" -u root -p"%PASS%" -e "CREATE DATABASE IF NOT EXISTS fivem CHARACTER SET utf8mb4;"
if errorlevel 1 goto :sqlfail
echo [ok] database 'fivem' ready
echo.

set "SQL=resource_store\esx-legacy\[SQL]\legacy.sql"
if not exist "%SQL%" goto :nosql
"%MYSQL%" -u root -p"%PASS%" fivem < "%SQL%"
if errorlevel 1 goto :sqlfail
echo [ok] ESX schema imported
echo.
goto :writejson

:nosql
echo [!] ESX schema file not found: %SQL%
echo     Continuing anyway - database and mysql.json are still created.
echo.

:writejson
(
  echo {
  echo   "host": "127.0.0.1",
  echo   "port": 3306,
  echo   "user": "root",
  echo   "password": "%PASS%",
  echo   "database": "fivem"
  echo }
) > mysql.json
echo [ok] wrote mysql.json
echo.
echo ==================================================
echo  Done. Now close every old server window and
echo  run START-SERVER.bat
echo ==================================================
pause
exit /b 0

:sqlfail
echo [!] A SQL command failed - see the messages above.
pause
exit /b 1
