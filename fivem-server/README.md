# NSM — FiveM Server (real FXServer)

This is a **real FiveM server** (FXServer). Every FiveM resource ever written —
QBCore, ESX, vMenu, ox_lib, anything on the Cfx.re forums or Tebex — runs on it
**natively, zero porting**. It uses the official prebuilt server artifacts, which
are the exact same code as the `platinum-cfx/fivem-source` mirror, already
compiled and licensed for redistribution by Cfx.re. **You never need to compile
the fork yourself** — and rebranding/rebuilding it would violate the Cfx.re /
Take-Two platform license agreement, so use these official artifacts as-is.

## Quick start (about 5 minutes)

1. **Get a free server key** (30 seconds):
   - Go to <https://keymaster.fivem.net/> and log in with your Cfx.re account
   - Register a server (any name) → copy the `sv_licenseKey` it shows you
   - This is free and required for any FXServer, anywhere, to boot.

2. **Install** (from this folder, in PowerShell):
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install-nsm-fivem.ps1 -LicenseKey "YOUR_KEY"
   ```
   This downloads and sets up, automatically:
   - FXServer Windows artifacts (recommended build, pinned)
   - `cfx-server-data` base resources (spawn manager, map manager, base events, …)
   - vMenu (latest release from TomGrobbe/vMenu)
   - `server.cfg` with your key, vMenu permissions, and QBCore/ESX slots ready

3. **Run:** double-click `run-server.bat`.
   - First boot opens the **txAdmin** setup wizard at <http://localhost:40120> —
     one time: create your admin account, then press Start.
   - The server listens on port **30120**.

Verified end-to-end on the current artifacts: the server boots, scans and finds
all resources including vMenu, and the *only* thing it halts on without a key is
the license check — with your key it boots fully.

## Adding QBCore / ESX / any resource

Drop the resource folder into `server-data\resources\` and add `ensure <name>`
to `server.cfg`. Frameworks like QBCore/ESX also need a MySQL server
(e.g. MariaDB) and `oxmysql` — the txAdmin recipe system can set all of this up
automatically for you (Server → Recipes).

## Updating the server build

Check <https://artifacts.jgscripts.com> for the current recommended build, then
re-run the installer with `-Build "NNNNN-hash"` (delete the `FXServer` folder
first, or let it live beside the old one).

## The client side — important, read this

Players join with the **FiveM client** (<https://fivem.net>), not the GTAMP/alt:V
client. The two protocols are fundamentally incompatible — no amount of source
code on the server side can make an alt:V client join an FXServer or vice versa.
This is true for every FiveM server on earth; it is not a limitation of this kit.

**NSM still fits in as the launcher / server browser:**
- Point your masterlist at FiveM servers (ip + port) as usual
- In the launcher's `connect` tool (C++ / `sources/cpp`), replace the alt:V launch
  with the FiveM connect protocol:
  ```
  fivem://connect/<ip>:<port>
  ```
  e.g. open it with `ShellExecute(NULL, "open", "fivem://connect/127.0.0.1:30120", ...)`
  — the locally installed FiveM client handles the rest, joins the server, and
  every script on it just works.

The alt:V/GTAMP server itself (and the Lua compat layer already in this repo
under `fivem-compat/`) stays as-is for players using the GTAMP client.

## Folder layout after install

```
FXServer\          official artifacts (FXServer.exe + all DLLs)
server-data\       resources, server.cfg, cache
run-server.bat     starts the server
install-nsm-fivem.ps1
```
