# NSM Architecture Map

> Status: **audited 2026-10-11** against repo commit `a82d23e` (v2.1 compat layer).
> Every statement below was read directly from source. Line numbers refer to that commit.

## 1. Component inventory

```
platinum-cfx/NSM
├── server/                  The game server a server-owner runs (Windows)
│   ├── gtamp-server.exe     C++ wrapper (sources/server/server.cpp, 607 lines)
│   ├── .cfg                 Simple key=value config (user-facing)
│   ├── server.toml          alt:V server config (rewritten from .cfg at every start)
│   ├── resources/
│   │   ├── fivem-compat/    FiveM→alt:V compatibility layer (JS + Lua runtime, v2.1)
│   │   ├── gtamp-online/    Spawn / respawn / under-map rescue (JS)
│   │   └── vmenu/           Server side of the in-game menu (JS; vMenu client UI is C#/alt:V native)
│   └── fix-jsmodule.ps1     js-module.dll SDK-version repair script
├── masterlist/              Server directory service (plain Node, no deps)
│   ├── server.js            514 lines, HTTP on :8080
│   └── masterlist.exe       pkg-packaged build of the same
├── website/                 Community site (Express + EJS + ws, port 3000)
│   ├── server.js            609 lines
│   ├── lib/{store,seed}.js  JSON-file persistence + seed data
│   └── views/ (16 EJS), data/*.json
├── client-new/              The player-side launcher (Windows)
│   ├── NSM.exe / connect.exe  C++ launcher (sources/cpp/connect.cpp, 1039 lines)
│   ├── launcher/index.html  Custom UI served to the alt:V client
│   ├── fivem-shim.js        Copy of the server-side JS shim (client sandbox experiments)
│   ├── .config              masterlist_url, voice settings
│   └── discord_rpc.dll
├── sources/                 C++ source for wrapper + launcher + tools
│   ├── server/server.cpp    gtamp-server.exe source (+ runpe.h)
│   ├── cpp/connect.cpp      launcher source; cpp/manifest*.cpp (resource packers)
│   └── browser/             launcher's embedded HTTP UI server (browser_server.h)
└── altv-js-module-v1/       Vendored copy of alt:V's JS module source (reference)
```

## 2. Runtime topology (what actually executes)

### 2.1 Server side — one machine, one process tree

1. **`gtamp-server.exe`** (the wrapper, `sources/server/server.cpp`) starts first.
   - Reads `.cfg`, rewrites `server.toml` in place (`UpdateServerToml`, ~line 168).
   - Places `libnode.dll` / `js-module.dll` into `modules\` and `modules\js-module\`
     (`EnsureServerDependencies`, line 130).
   - Starts three HTTP listeners **before** the game server exists:
     - `0.0.0.0:7799` catch-all POST proxy (line 371). Any POST whose body contains
       `clientTokenHashes` is answered with a synthesized JSON array of `true` values,
       one per submitted hash (lines 386–410). `GET /updateOnline` sets Discord-RPC state.
     - `127.0.0.1:7898` `/update` (Discord RPC state, local only, line 497).
     - `0.0.0.0:7899` `/rpc` (public, CORS `*`, read-only status JSON, line 513).
   - Optionally announces to the masterlist every `announce_interval` s via WinHTTP
     with `X-Server-Key` (lines 532–570).
   - **RunPE-hollows itself** with `altv-server.exe` embedded as RCDATA resource 101
     (`runpe.h`, line 586) and waits on that process.

2. **alt:V server 16.4.39 (c150769)** — the real, unmodified alt:V server binary, run
   hollowed inside the wrapper's process image. Loads:
   - `modules/js-module.dll` (Node 18 runtime) → runs **all** JS resources.
   - `resources/fivem-compat` — our FiveM compatibility layer. It is the entry point
     that emulates FiveM's server API surface in JS and, for Lua resources, embeds
     **wasmoon** (Wasm Lua 5.4) to execute FiveM Lua server scripts after a fork-syntax
     transform. (Details: `docs/RUNTIME_DECISION.md`, `docs/LUA_RUNTIME.md` when written.)
   - `resources/gtamp-online` — alt:V-native JS: Legion-Square spawn, server-owns-spawn
     flow, under-map rescue watchdog, player-count heartbeat to `127.0.0.1:7799`.
   - `resources/vmenu` — alt:V-native JS handling `vmenu:*` client events (vehicle spawn,
     ped change, heal, weapons, teleport, weather/time).

3. **Client side (separate machines)** — `NSM.exe`/`connect.exe` launcher
   (`sources/cpp/connect.cpp`): serves its own UI (`127.0.0.1:9988/ui/index.html`),
   fetches the masterlist (`:8080/servers`), then launches the **real alt:V client**
   (`altv.exe`) with `-connecturl altv://connect/<host:port> -directlaunch -customui …`
   (line 974). Voice config lives in `client-new/.config [voice]`.

### 2.2 Masterlist + website (hosting operator)

- **masterlist** (`:8080`): game servers `POST /announce` every ~30 s (or the wrapper's
  WinHTTP loop does). In-memory `servers` Map, `keys.json` on disk, 60 req/min IP rate
  limit on announce, optional TCP probe of the announced game port, presence tracking
  via `/api/player/heartbeat` + `/api/launcher/ping`.
- **website** (`:3000`): Express+EJS community site (accounts, forum, marketplace,
  keymaster, docs, badges) that **mirrors** masterlist data every 2.5 s
  (`syncMasterlistServers`, website/server.js:96) and serves the launcher UI statics.

## 3. Data & control flow (end-to-end)

```
Player                     Launcher host              Server host              Hosting operator
──────                     ─────────────              ───────────              ────────────────
NSM.exe ─ browse ───────────────────────────────────────────────────────▶ masterlist :8080 /servers
  └─ launch altv.exe ─connecturl─▶ gtamp-server.exe :7788 (alt:V server)
                                      └─ js-module → fivem-compat → wasmoon Lua VMs
                                      └─ announce loop ──────────▶ masterlist :8080 /announce
connect.exe heartbeats ──────────────────────────────────────────────▶ masterlist /api/player/heartbeat
website :3000 ◀─ mirror (2.5 s poll) ──────────────────────────────── masterlist /servers
website ◀─ /api/servers/report (launcher direct reports)
```

Auth tokens that exist today:
- masterlist `X-Server-Key` (minted with `X-Admin-Key` via `POST /keys`) — announce auth.
- website session cookie (express-session, default secret `'gtamp-dev-secret-change-me'`).
- hardcoded `'CravenzOwnerKey'` + username `'Cravenz'` website admin backdoor (see audit).
- **No** game-level auth: the 7799 token-verification proxy answers `true` for everything.

## 4. Where FiveM resources live in this stack

`server/resources/fivem-compat` is the only piece that speaks FiveM. A dropped-in
qb-core/ESX resource is executed as: fxmanifest.lua → manifest v2 parser → Lua scripts
→ fork-syntax transform (backtick keys, `?.`, compound assignment) → wasmoon VM with a
FiveM-shaped `_G` (Citizen, events, exports, natives stubs, statebag proxy). Frameworks
verified loading clean as of v3 (`6af03b7`): qb-core (12 shared + 7 server scripts),
esx_lib + es_extended (27 scripts). Since v3 all resources share **one** wasmoon VM with
per-resource environment tables, and cross-resource exports are **live direct calls** —
`exports['qb-core']:GetCoreObject()` returns the real table (functions, identity, shared
mutations). Startup is dependency-ordered (`loadAll()`), and unsupported manifest
directives are reported rather than silently ignored. Runtime design record:
`docs/RUNTIME_DECISION.md`.

## 5. Build/packaging pipeline (as shipped)

- Server: `sources/cpp/build.bat` compiles the wrapper (needs `resources.rc` embedding
  `altv-server.exe` as RCDATA 101); the shipped `gtamp-server.exe` is committed.
- Masterlist: `masterlist.exe` = pkg build of `server.js`.
- Website: `NSMwebsite.exe` = pkg build of `website/server.js`.
- Launcher: `NSM.exe` / `connect.exe` built from `sources/cpp/connect.cpp`.
- Nothing in the repo builds the alt:V server/client themselves; those are upstream
  binaries (`altv-server.exe` 16.4.39 / c150769 at time of audit).
