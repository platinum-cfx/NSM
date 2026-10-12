@echo off
title NSM join check
set "NSMCHK=%~f0"
echo.
echo  NSM join check - only LOOKS, changes nothing.
echo  Run this WHILE the problem is happening: server started,
echo  NSM.exe open, right after a failed join attempt.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c=[IO.File]::ReadAllText($env:NSMCHK); $m='# --- PS START ---'; $i=$c.IndexOf($m); Invoke-Expression $c.Substring($i+$m.Length)"
echo.
echo  Finished - the report should have opened in Notepad by itself.
pause
goto :eof
# --- PS START ---
$ErrorActionPreference = 'SilentlyContinue'
Write-Host 'Join check running, please wait...'
$out  = New-Object System.Collections.Generic.List[string]
function Add-Line([string]$s) { $script:out.Add($s) }

Add-Line "=== NSM JOIN CHECK ==="
Add-Line ("Time: " + (Get-Date -Format 'yyyy-MM-dd HH:mm'))
Add-Line ""

# ---- 1. Processes ----------------------------------------------------------
Add-Line "=== Game-ish processes running right now ==="
$procs = Get-Process | Where-Object { $_.Path -and ($_.Name -match 'gtamp|altv|nsm|gta|connect') }
if ($procs) {
    foreach ($p in ($procs | Select-Object -Unique Path)) { Add-Line ("   " + $p.Name + "  ->  " + $p.Path) }
} else {
    Add-Line "   (none: no server, no client, no game running)"
}
Add-Line ""

# ---- 2. Masterlist on 8080 -------------------------------------------------
Add-Line "=== Masterlist http://127.0.0.1:8080/servers ==="
try {
    $r = Invoke-WebRequest 'http://127.0.0.1:8080/servers' -UseBasicParsing -TimeoutSec 5
    $body = [string]$r.Content
    if ($body.Length -gt 600) { $body = $body.Substring(0,600) + ' ...' }
    Add-Line ("   [OK] HTTP " + $r.StatusCode)
    Add-Line ("   BODY: " + $body)
} catch {
    Add-Line ("   [!!] NOT reachable: " + $_.Exception.Message)
    Add-Line "   (masterlist runs INSIDE the game server - is START-SERVER.bat running,"
    Add-Line "    and did the console print '[nsm-masterlist] server list is LIVE'?)"
}
Add-Line ""

# ---- 3. Game server port 7788 ----------------------------------------------
Add-Line "=== Game server port 127.0.0.1:7788 ==="
$tcp = New-Object System.Net.Sockets.TcpClient
$ok = $tcp.ConnectAsync('127.0.0.1', 7788).Wait(3000)
if ($ok -and $tcp.Connected) { Add-Line "   [OK] port 7788 is open - the game server is listening" }
else { Add-Line "   [!!] port 7788 NOT reachable - game server not running or blocked" }
$tcp.Close()
Add-Line ""

# ---- 4. NSM folders: new files present? ------------------------------------
Add-Line "=== NSM downloads found (new vs old) ==="
$roots = @([Environment]::GetFolderPath('Desktop'), (Join-Path $env:USERPROFILE 'Downloads')) |
    Where-Object { $_ -and (Test-Path $_) }
$servers = @()
foreach ($r in $roots) {
    $servers += Get-ChildItem $r -Recurse -Depth 3 -Filter 'gtamp-server.exe' -File
}
$servers = $servers | Group-Object FullName | ForEach-Object { $_.Group[0] }
if (-not $servers) { Add-Line "   (no gtamp-server.exe found on Desktop/Downloads)" }
foreach ($s in $servers) {
    $dir = $s.DirectoryName
    $hasML = Test-Path (Join-Path $dir 'resources\nsm-masterlist\index.js')
    Add-Line ("FOLDER: " + $dir)
    Add-Line ("   nsm-masterlist resource: " + $(if ($hasML) {'PRESENT (new version)'} else {'MISSING (old version - re-download the ZIP!)'}))
    $cfg = Join-Path $dir '.cfg'
    if (Test-Path $cfg) {
        $line = (Get-Content $cfg | Where-Object { $_ -match '^\s*resources\s*=' } | Select-Object -First 1)
        Add-Line ("   .cfg resources: " + $line.Trim())
    }
    Add-Line ("   server folder modified: " + $s.LastWriteTime)
    Add-Line ""
}

# ---- 5. Client logs ---------------------------------------------------------
Add-Line "=== Recent client logs (last 25 lines each) ==="
$logFiles = @()
foreach ($s in $servers) {
    $cn = Join-Path $s.DirectoryName '..\client-new'
    if (Test-Path $cn) {
        $logFiles += Get-ChildItem $cn -Recurse -Depth 2 -Filter '*.log' -File
    }
}
$skipRx = '^(Temp|Packages|Microsoft.*|D3DSCache|CrashDumps|com\.|SquirrelTemp)'
Get-ChildItem $env:LOCALAPPDATA -Directory | Where-Object { $_.Name -notmatch $skipRx } | ForEach-Object {
    $logFiles += Get-ChildItem $_.FullName -Recurse -Depth 1 -Filter '*.log' -File
}
$logFiles = $logFiles | Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-2) } |
            Sort-Object LastWriteTime -Descending | Select-Object -First 4
if (-not $logFiles) { Add-Line "   (no recent .log files found)" }
foreach ($lf in $logFiles) {
    Add-Line ("LOG: " + $lf.FullName + "  (" + $lf.LastWriteTime + ")")
    $lines = Get-Content $lf.FullName -Tail 25
    foreach ($l in $lines) {
        if ($l.Length -gt 200) { $l = $l.Substring(0,200) }
        Add-Line ("   " + $l)
    }
    Add-Line ""
}

# ---- 6. Report --------------------------------------------------------------
if (-not $desk) { $desk = [Environment]::GetFolderPath('Desktop') }
$report  = Join-Path $desk 'JOIN-CHECK.txt'
$report2 = Join-Path $env:USERPROFILE 'Downloads\JOIN-CHECK.txt'
$out | Set-Content -Path $report  -Encoding ASCII
$out | Set-Content -Path $report2 -Encoding ASCII
Write-Host ''
Write-Host '================================================'
Write-Host ' DONE - opening the report for you now.'
Write-Host (' Saved: ' + $report)
Write-Host (' Also:  ' + $report2)
Write-Host '================================================'
Invoke-Item $report
