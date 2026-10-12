# =============================================================================
# NSM Steam presence - ONE-TIME helper, run automatically by START-SERVER.bat
#
# Places steam_appid.txt (AppID 244310, "Source SDK Base 2007" - the exact
# trick FiveM ships with its installer) next to the client exe you launch to
# play, so Steam shows you as playing it.
#
# Runs once: writes steam-presence.txt as a marker and never bothers you
# again. Search order: nsm.exe / gtamp-ish folders in common locations; if
# that is ambiguous, ONE file-picker dialog. Cancel = skip forever (delete
# server\steam-presence.txt to retry).
# =============================================================================

$ErrorActionPreference = 'SilentlyContinue'

$marker = Join-Path $PSScriptRoot 'steam-presence.txt'
if (Test-Path $marker) { exit 0 }

# the appid payload ships in client-extras\ next to the server folder
$src = @(
    (Join-Path $PSScriptRoot 'steam_appid.txt'),
    (Join-Path (Split-Path $PSScriptRoot) 'client-extras\steam_appid.txt')
) | Where-Object { Test-Path $_ } | Select-Object -First 1

function Place-AppId([string]$exePath) {
    $dir = Split-Path -Parent $exePath
    $dst = Join-Path $dir 'steam_appid.txt'
    if (Test-Path $dst) {
        Copy-Item $dst (Join-Path $dir 'steam_appid.backup.txt') -Force
        Write-Host '[ok] existing steam_appid.txt backed up to steam_appid.backup.txt'
    }
    Copy-Item $src $dst -Force
    ("PLACED|" + $dir) | Out-File $marker -Encoding ascii
    Write-Host "[ok] Steam status enabled: $dst"
    Write-Host '     Restart Steam once, launch your game, and Steam shows'
    Write-Host '     "Playing Source SDK Base 2007" (the FiveM trick).'
}

if (-not $src) {
    'NOFILE' | Out-File $marker -Encoding ascii
    Write-Host '[i] steam_appid.txt not found in client-extras\ - skipping'
    exit 0
}

# never suggest exes inside this NSM download itself
$ownRoot = (Split-Path $PSScriptRoot).TrimEnd('\') + '\'

$roots = @(
    (Join-Path $env:USERPROFILE 'Desktop'),
    (Join-Path $env:USERPROFILE 'Downloads'),
    (Join-Path $env:USERPROFILE 'Documents'),
    $env:ProgramFiles,
    ${env:ProgramFiles(x86)},
    $env:LOCALAPPDATA,
    $env:ProgramData,
    $env:USERPROFILE
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

$candidates = New-Object System.Collections.Generic.List[string]
foreach ($root in $roots) {
    # a launcher literally named nsm.exe anywhere directly in these roots
    Get-ChildItem -Path $root -Filter 'nsm.exe' -File -ErrorAction SilentlyContinue |
        ForEach-Object { $candidates.Add($_.FullName) }
    # gtamp/nsm/altv-ish folders (two levels deep)
    Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '(?i)gtamp|^nsm|altv' } |
        ForEach-Object {
            Get-ChildItem -Path $_.FullName -Filter '*.exe' -File -ErrorAction SilentlyContinue |
                ForEach-Object { $candidates.Add($_.FullName) }
            Get-ChildItem -Path $_.FullName -Directory -ErrorAction SilentlyContinue |
                ForEach-Object {
                    Get-ChildItem -Path $_.FullName -Filter '*.exe' -File -ErrorAction SilentlyContinue |
                        ForEach-Object { $candidates.Add($_.FullName) }
                }
        }
}

$candidates = @($candidates |
    Where-Object { $_ -and (-not $_.StartsWith($ownRoot, [System.StringComparison]::OrdinalIgnoreCase)) } |
    Select-Object -Unique)

if ($candidates.Count -eq 1) {
    Place-AppId $candidates[0]
    exit 0
}

if ($candidates.Count -gt 1) {
    Write-Host "[i] found $($candidates.Count) possible game exes - pick yours once:"
    $candidates | ForEach-Object { Write-Host "      $_" }
}

Add-Type -AssemblyName System.Windows.Forms
$f = New-Object System.Windows.Forms.OpenFileDialog
$f.Title = 'One-time: pick the exe you launch to play NSM (enables the Steam status)'
$f.Filter = 'Executable (*.exe)|*.exe'
$f.CheckFileExists = $true
if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    Place-AppId $f.FileName
} else {
    'SKIPPED' | Out-File $marker -Encoding ascii
    Write-Host '[i] skipped. To retry later: delete server\steam-presence.txt'
}
exit 0
