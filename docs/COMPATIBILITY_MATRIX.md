# NSM Compatibility Matrix

> Updated 2026-10-12 at `01ed635`. Companion files: `docs/FRAMEWORK_PINS.md`
> (exact framework versions), `docs/CLIENT_COMPATIBILITY.md` (deep client-side
> detail + on-device checklist), `docs/LAUNCH_FLOW.md` (architecture).

## Runtime / game

| Layer | Supported | Notes |
|---|---|---|
| Multiplayer runtime | alt:V-based GTAMP client (`client-new/NSM.exe`, opaque compiled binary) | Connection happens through its documented local API (`POST /api/connect`) |
| Game | GTA V **Legacy** (Steam) — confirmed working install pattern on the target machine | GTA V Enhanced: client has a path probe for it, **untested** |
| OS | Windows 10/11 (client + server) | Development/CI of this repo happens on Linux against the same JS |
| Steam presence | AppID **218** (Source SDK Base 2007) — account must hold the (free) license; `steam_api64.dll` is borrowed at runtime from any installed Steam game (GTA V first) | Verified on a real Windows machine 2026-10-12 |

## Resource / scripting compatibility

| Area | Status |
|---|---|
| Server Lua (FiveM `fxmanifest`/`__resource` semantics, events, exports, commands, convars, statebags, threads/Wait, MySQL via oxmysql API) | Supported — server suite 116/116 (mock transport) |
| Client Lua (same surface, NUI messages/callbacks, key mapping) | Supported in the shipped VMs (fengari + wasmoon cross-validation) — 70/70 mock tests |
| JS/TS resources | Supported via the bundle pipeline (`tools/build-client-bundle.mjs`) |
| Pinned frameworks | qb-core `9b3cddc`, esx-legacy `fe59ca0`, oxmysql `bae715c` (see FRAMEWORK_PINS.md) |
| ESX client bundle | es_extended (18 scripts + UI), esx_lib (5 + medal UI), skinchanger (18) — 41 scripts / 6 resources in `payload.gen.js` |

### Known unsupported / partial (do not paper over these)

- Money/account sync on the ESX join flow; `lib.callback` routing — partial.
- `SetPedHeadBlendData`, `SetPlayerControl`, `GetSelectedPedWeapon` — mock-only
  in tests; real in-game behavior unverified.
- `addKeybind` (esx_lib `imports/addKeybind/client.lua:65`) hits a fengari
  integer-conversion error — reproduces on a real machine too.
- **Encrypted/compiled FiveM resources are NOT supported** (and will not be —
  they are protected).
- **Arbitrary FiveM resources are NOT guaranteed to work.** The supported
  surface is the pinned framework set + the documented API subset above.
- Explicit non-claim: NSM is FiveM-*style*, not "full FiveM compatibility".

## Launcher / browser

| Feature | Status |
|---|---|
| Server list from masterlist | Live — `nsm-masterlist` resource serves `:8080/servers` with this server + live player count; `POST /announce` lets other NSM servers join the list (60 s TTL) |
| Direct connect (`ip:port`, `altv://connect/…`, `>ip:port` in search, F8 `connect`) | Implemented in `launcher/index.html` |
| CONNECTING overlay + return-to-list on exit | Implemented (driven by `/api/gamestate` polling) |
| First-run GTA V picker, updater, accounts | Not implemented — see LAUNCH_FLOW.md "Remaining gaps" |
