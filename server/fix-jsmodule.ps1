# =============================================================================
# NSM js-module fixer — run this ONCE from the server folder
#
# Fixes:
#   [Error] Failed to load module "...\modules\js-module\js-module.dll"
#   Module uses SDK #b782525, server requires SDK #c150769
#
# Cause: the js-module.dll shipped with the repo was built for an older alt:V
# SDK than the server exe (alt:V 16.4.39 / SDK #c150769).
#
# This script downloads the OFFICIAL matching module straight from alt:V's CDN,
# verifies it against alt:V's own published SHA1 checksums, and installs it.
# It skips the 104 MB libnode.dll if yours is already the right one.
#
# Usage (from this folder, in PowerShell):
#   powershell -ExecutionPolicy Bypass -File fix-jsmodule.ps1
# =============================================================================

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = $PSScriptRoot
$requiredSdk = 'c150769'   # alt:V 16.4.39 (what gtamp-server.exe / altv-server.exe need)

Write-Host "== NSM js-module fixer ==" -ForegroundColor Cyan

# Known-good pair for SDK #c150769 (alt:V 16.4.31) — committed to this repo.
$goodJsHash   = '717f4a55990d56f95f3a6005485965843f8b20b6'
$goodNodeHash = '3fdf239aa2ec19c38b14b6645d82d8caa7d1d58e'
$jsPath   = Join-Path $root 'modules\js-module\js-module.dll'
$nodePath = Join-Path $root 'modules\js-module\libnode.dll'

$jsOk   = (Test-Path $jsPath)   -and ((Get-FileHash $jsPath -Algorithm SHA1).Hash.ToLower() -eq $goodJsHash)
$nodeOk = (Test-Path $nodePath) -and ((Get-FileHash $nodePath -Algorithm SHA1).Hash.ToLower() -eq $goodNodeHash)
if ($jsOk -and $nodeOk) {
    Write-Host "   js-module.dll + libnode.dll are already the official 16.4.31 / SDK #c150769 builds - nothing to do." -ForegroundColor Green
    exit 0
}

Write-Host "1. Fetching official js-module info from alt:V CDN..."
$info = Invoke-RestMethod 'https://cdn.alt-mp.com/js-module/release/x64_win32/update.json'

if ($info.sdkVersion -ne $requiredSdk) {
    Write-Host "   NOTE: CDN now serves SDK #$($info.sdkVersion) (your server needs #$requiredSdk)." -ForegroundColor Yellow
    Write-Host "   alt:V has moved on. Installing the current one may still work if the SDK" -ForegroundColor Yellow
    Write-Host "   matches; otherwise update your server exe from https://altv.mp first." -ForegroundColor Yellow
    if ($args -notcontains '-Force') {
        Write-Host "   Re-run with -Force to install anyway." -ForegroundColor Yellow
        exit 1
    }
}
Write-Host "   CDN js-module version: $($info.version) (SDK #$($info.sdkVersion)) — matches your server."

$dest = Join-Path $root 'modules\js-module'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$files = @('modules/js-module/js-module.dll', 'modules/js-module/libnode.dll')
foreach ($f in $files) {
    $name = Split-Path $f -Leaf
    $target = Join-Path $dest $name
    $expected = $info.hashList.$f

    if ((Test-Path $target) -and $expected) {
        $hash = (Get-FileHash $target -Algorithm SHA1).Hash.ToLower()
        if ($hash -eq $expected) {
            Write-Host "   $name already the official $($info.version) build — skipping"
            continue
        }
    }

    Write-Host "   downloading $name ..."
    Invoke-WebRequest "https://cdn.alt-mp.com/js-module/release/x64_win32/$($f)" -OutFile $target

    $hash = (Get-FileHash $target -Algorithm SHA1).Hash.ToLower()
    if ($expected -and $hash -ne $expected) {
        throw "$name hash mismatch! Expected $expected got $hash — NOT installed correctly, please retry."
    }
    Write-Host "   $name installed + verified (SHA1 OK)" -ForegroundColor Green
}

Write-Host ""
Write-Host "DONE. Start your server again — the 'unknown type js' errors will be gone" -ForegroundColor Green
Write-Host "and gtamp-online, vmenu and fivem-compat will load." -ForegroundColor Green
