@echo off
title NSM Steam check
set "NSMCHK=%~f0"
echo.
echo  NSM Steam presence check - only LOOKS, changes nothing.
echo  Best: keep nsm.exe open while running this.
echo  Takes 20-60 seconds, then saves STEAM-CHECK.txt to your Desktop.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c=[IO.File]::ReadAllText($env:NSMCHK); $m='# --- PS START ---'; $i=$c.IndexOf($m); Invoke-Expression $c.Substring($i+$m.Length)"
echo.
echo  Finished. STEAM-CHECK.txt should now be on your Desktop.
pause
goto :eof
# --- PS START ---
$ErrorActionPreference = 'SilentlyContinue'
Write-Host 'Check running, please wait...'
$out  = New-Object System.Collections.Generic.List[string]
function Add-Line([string]$s) { $script:out.Add($s) }

Add-Line "=== NSM STEAM CHECK ==="
Add-Line ("Time:    " + (Get-Date -Format 'yyyy-MM-dd HH:mm'))
Add-Line ("Windows: " + [Environment]::OSVersion.VersionString)
Add-Line ""

# ---- 1. Is Steam running? -------------------------------------------------
$steamProc = Get-Process steam | Select-Object -First 1
if ($steamProc) {
    Add-Line ("[OK] Steam IS running (PID " + $steamProc.Id + ")")
    if ($steamProc.Path) { Add-Line ("     Steam exe: " + $steamProc.Path) }
} else {
    Add-Line "[!!] Steam is NOT running right now - the status cannot show without Steam running"
}

# ---- 2. Steam install + which apps are installed ---------------------------
$steamPath = (Get-ItemProperty 'HKCU:\Software\Valve\Steam').SteamPath
if (-not $steamPath) { $steamPath = (Get-ItemProperty 'HKLM:\SOFTWARE\WOW6432Node\Valve\Steam').SteamPath }
if ($steamPath) {
    $steamPath = $steamPath -replace '/', '\'
    Add-Line ("Steam install path: " + $steamPath)
    $manifests = Get-ChildItem (Join-Path $steamPath 'steamapps') -Filter 'appmanifest_*.acf'
    if ($manifests) {
        Add-Line "Installed Steam apps (installed = owned for our purposes):"
        foreach ($m in $manifests) {
            $name = ''
            $raw  = [string](Get-Content $m.FullName -Raw)
            if ($raw -match '"name"\s+"([^"]+)"') { $name = $Matches[1] }
            Add-Line ("   " + $m.BaseName.Replace('appmanifest_','') + " = " + $name)
        }
    } else {
        Add-Line "[!!] No Steam apps appear to be installed in that Steam"
    }
    Add-Line ("Has Source SDK Base 2007 manifest: " + (Test-Path (Join-Path $steamPath 'steamapps\appmanifest_244310.acf')))
} else {
    Add-Line "[!!] Steam not found in the registry - is the Steam client installed?"
}
Add-Line ""

# ---- 3. Game-ish processes running RIGHT NOW -------------------------------
Add-Line "=== Game-ish processes running right now ==="
$procs = Get-Process | Where-Object { $_.Path -and ($_.Name -match 'nsm|gtamp|altv|fivem|gta|steam') }
if ($procs) {
    foreach ($p in $procs) { Add-Line ("   " + $p.Name + "  ->  " + $p.Path) }
} else {
    Add-Line "   (none - run this check again WHILE nsm.exe is open for the best data)"
}
Add-Line ""

# ---- 4. Search the usual places --------------------------------------------
Add-Line "=== Searching for nsm.exe / client exes / steam_appid.txt ==="
$patterns = 'nsm.exe','gtamp*.exe','altv*.exe','FiveM.exe','gta_sa.exe','GTA5.exe','steam_appid.txt'

$roots = @(
    [Environment]::GetFolderPath('Desktop'),
    (Join-Path $env:USERPROFILE 'Downloads'),
    (Join-Path $env:USERPROFILE 'Documents'),
    $env:ProgramFiles,
    ${env:ProgramFiles(x86)},
    $env:ProgramData,
    $steamPath
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

$found = @()
foreach ($r in $roots) {
    Write-Host ('   searching: ' + $r)
    $found += Get-ChildItem $r -Recurse -Depth 2 -Include $patterns -File
}

if (Test-Path $env:LOCALAPPDATA) {
    Write-Host ('   searching: ' + $env:LOCALAPPDATA)
    $skipRx = '^(Temp|Packages|Microsoft.*|D3DSCache|CrashDumps|com\.|ConnectedDevicesPlatform|SquirrelTemp|DockingService)'
    Get-ChildItem $env:LOCALAPPDATA -Directory | Where-Object { $_.Name -notmatch $skipRx } | ForEach-Object {
        $found += Get-ChildItem $_.FullName -Recurse -Depth 1 -Include $patterns -File
    }
}

$found = $found | Group-Object FullName | ForEach-Object { $_.Group[0] }

Add-Line ""
if (-not $found) {
    Add-Line "[!!] Found NOTHING: no nsm.exe and no steam_appid.txt anywhere in the usual places"
}

foreach ($f in $found) {
    Add-Line ("FOUND: " + $f.FullName)
    if ($f.Name -ieq 'steam_appid.txt') {
        $c = [string](Get-Content $f.FullName -Raw)
        Add-Line ("   content: [" + $c.Trim() + "]  size " + $f.Length + "B")
    } else {
        $dir = $f.DirectoryName
        $appidFile = Join-Path $dir 'steam_appid.txt'
        if (Test-Path $appidFile) {
            $c = [string](Get-Content $appidFile -Raw)
            Add-Line ("   steam_appid.txt next to this exe: YES  content [" + $c.Trim() + "]")
        } else {
            Add-Line "   steam_appid.txt next to this exe: NO   <-- would explain a missing status"
        }
        Add-Line "   other exes in same folder:"
        $sib = Get-ChildItem $dir -Filter '*.exe' -File | Where-Object { $_.Name -ne $f.Name }
        if ($sib) { foreach ($s in $sib) { Add-Line ("      " + $s.Name) } } else { Add-Line "      (none)" }
        Add-Line "   exes one level below:"
        $sub = Get-ChildItem $dir -Directory | ForEach-Object { Get-ChildItem $_.FullName -Filter '*.exe' -File } | Select-Object -First 15
        if ($sub) { foreach ($s in $sub) { Add-Line ("      " + $s.Directory.Name + "\" + $s.Name) } } else { Add-Line "      (none)" }
    }
    Add-Line ""
}

# ---- 5. Desktop shortcuts that point at the game ---------------------------
Add-Line "=== Desktop shortcuts pointing at game exes ==="
$sh = New-Object -ComObject WScript.Shell
$desk = [Environment]::GetFolderPath('Desktop')
$hits = 0
Get-ChildItem $desk -Filter '*.lnk' | ForEach-Object {
    $t = $sh.CreateShortcut($_.FullName).TargetPath
    if ($t -and $t -match 'nsm|gtamp|altv|fivem|gta') {
        Add-Line ("   " + $_.Name + "  ->  " + $t); $hits++
    }
}
if ($hits -eq 0) { Add-Line "   (no game shortcuts on the Desktop)" }

# ---- 6. Write the report ----------------------------------------------------
$report = Join-Path $desk 'STEAM-CHECK.txt'
$out | Set-Content -Path $report -Encoding ASCII
Write-Host ''
Write-Host '================================================'
Write-Host ' Done. Report saved on your Desktop:'
Write-Host (' ' + $report)
Write-Host ' Open it and send the whole contents back.'
Write-Host '================================================'
