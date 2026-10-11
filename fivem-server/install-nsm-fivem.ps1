# =============================================================================
# NSM FiveM server installer
# Sets up a real FXServer (FiveM) with base resources + vMenu in one run.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\install-nsm-fivem.ps1 -LicenseKey "YOUR_KEY"
#
# Get a FREE license key (takes 30 seconds):
#   1. Go to https://keymaster.fivem.net/ and log in with your Cfx.re account
#   2. Register a server (any name), copy the key it gives you
#   3. Pass it as -LicenseKey above
# =============================================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$LicenseKey,

    # Recommended artifact build (Oct 2026). Check https://artifacts.jgscripts.com
    # for newer recommended builds and pass: -Build "NNNNN-hash"
    [string]$Build = '37150-a74c2ccf0a56546dbb591b4545c643f56acebd3d',

    [int]$Port = 30120,
    [string]$ServerName = 'NSM Server'
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }
Set-Location $root

Write-Host "== [1/4] FXServer artifacts (build $($Build.Split('-')[0])) ==" -ForegroundColor Cyan
if (-not (Test-Path "$root\FXServer\FXServer.exe")) {
    $url = "https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/$Build/server.zip"
    Write-Host "   downloading $url"
    Invoke-WebRequest -Uri $url -OutFile "$root\server.zip"
    Expand-Archive "$root\server.zip" -DestinationPath "$root\FXServer" -Force
    Remove-Item "$root\server.zip" -Force
} else { Write-Host "   already installed" }

Write-Host "== [2/4] server-data (base resources) ==" -ForegroundColor Cyan
if (-not (Test-Path "$root\server-data\resources")) {
    Invoke-WebRequest -Uri 'https://codeload.github.com/citizenfx/cfx-server-data/zip/refs/heads/master' -OutFile "$root\server-data.zip"
    Expand-Archive "$root\server-data.zip" -DestinationPath "$root\sd-tmp" -Force
    Move-Item "$root\sd-tmp\cfx-server-data-master" "$root\server-data"
    Remove-Item "$root\sd-tmp" -Recurse -Force
    Remove-Item "$root\server-data.zip" -Force
} else { Write-Host "   already installed" }

Write-Host "== [3/4] vMenu (TomGrobbe/vMenu) ==" -ForegroundColor Cyan
if (-not (Test-Path "$root\server-data\resources\vMenu\fxmanifest.lua")) {
    $rel = Invoke-RestMethod -Uri 'https://api.github.com/repos/TomGrobbe/vMenu/releases/latest' -Headers @{ 'User-Agent' = 'nsm-installer' }
    $asset = $rel.assets | Where-Object { $_.name -match '^vMenu-\d' } | Select-Object -First 1
    if (-not $asset) { throw 'Could not find a vMenu release asset on GitHub' }
    Write-Host "   downloading $($asset.name)"
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile "$root\vmenu.zip"
    Expand-Archive "$root\vmenu.zip" -DestinationPath "$root\server-data\resources\vMenu" -Force
    Remove-Item "$root\vmenu.zip" -Force
} else { Write-Host "   already installed" }

Write-Host "== [4/4] server.cfg ==" -ForegroundColor Cyan
$cfg = @"
endpoint_add_tcp "0.0.0.0:$Port"
endpoint_add_udp "0.0.0.0:$Port"

sv_hostname "$ServerName"
sv_maxclients 32
sv_licenseKey "$LicenseKey"

set gamename "gta5"
sv_scriptHookAllowed 0

# base resources
ensure baseevents
ensure mapmanager
ensure spawnmanager
ensure playernames

# vMenu (order matters: permissions before ensure)
exec "resources/vMenu/config/permissions.cfg"
ensure vMenu

# --- add QBCore / ESX / oxmysql resources below this line ---
# ensure oxmysql
# ensure qb-core
# ensure es_extended
"@
Set-Content -Path "$root\server-data\server.cfg" -Value $cfg -Encoding ASCII
Write-Host "   written server-data\server.cfg"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " DONE — start your server with run-server.bat" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host " First boot: the txAdmin setup wizard opens at"
Write-Host "   http://localhost:40120  (one time — create your admin"
Write-Host "   account when prompted, then press Start)."
Write-Host ""
Write-Host " Players connect from the FiveM client via Direct Connect:"
Write-Host "   <your-ip>:$Port"
Write-Host ""
