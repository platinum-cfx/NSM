# NSM Launch Flow — audit and design

> Updated 2026-10-12 at commit `01ed635`. Every **confirmed** claim cites a file in
> this repo or a test that actually ran. **Opaque** = a compiled binary we ship but
> cannot inspect or modify in this repo. **Not verified** = needs a real Windows +
> GTA V run (see the acceptance checklist in TESTING.md).

## Components

| Component | Path | Role | Status |
|---|---|---|---|
| NSM.exe (client) | `client-new/NSM.exe` (3.8 MB, sha `27768d5d`, identical blob to `client-new/connect.exe`) | alt:V-based GTAMP client bootstrap: hosts the CEF browser UI, detects GTA V, spawns the game process on connect, runs the local launcher API | **Opaque** (compiled; source lives in the upstream GTAMP project, not vendored here) |
| Server browser UI | `client-new/launcher/index.html` (ours) | FiveM-style home page, server list, direct connect, F8 console, CONNECTING overlay | Confirmed (source-audited) |
| Client config | `client-new/.config` | `gta_path` (empty = auto-detect), `masterlist_url`, voice settings | Confirmed |
| Masterlist service | `server/resources/nsm-masterlist/` (ours) | Serves `http://127.0.0.1:8080/servers` with THIS server always present + live player count; `/api/launcher/ping`, `/api/player/leave`, `POST /announce` | Confirmed (live HTTP test 2026-10-12; runs with the game server, zero extra steps) |
| Steam presence | `client-new/discord_rpc.dll` (wrapper, source `nsm-steam-presence-source.c`) + `discord_rpc_real.dll` + `steam_appid.txt` (`218`) | Initializes Steamworks inside the client process at startup → Steam shows "Playing Source SDK Base 2007"; forwards Discord RPC untouched | **Verified on a real Windows machine 2026-10-12** (user-confirmed) |
| Dedicated server | `server/gtamp-server.exe` → `altv-server.exe` + js-module; resources per `server/.cfg`: `nsm-masterlist`, `fivem-compat`, `fivem-client`, `vmenu` | Game server + FiveM-compatible Lua/JS runtime | Confirmed (server suites, see TESTING.md) |
| Database | MariaDB via `server/mysql.json` (`SETUP-DB.bat`, `START-SERVER.bat` warns if missing) | ESX player persistence | Confirmed (db suite 20/20) |

## The flow

```
 Player        NSM.exe (CEF)      launcher/index.html     local API 9987-10005    masterlist :8080      server :7788
   |                |                     |                        |                    |                   |
   |--double-click->|   loads page        |                        |                    |                   |
   |                |-------------------->|  GET /api/config       |                    |                   |
   |                |                     |-----GET /servers--------------------------->| live list        |
   |                |                     |<----[this server + announced]---------------| (player count)   |
   |--click Connect-|-------------------->|  POST /api/connect {host,port,name}          |                   |
   |                |  client locates GTA V (Steam registry / .cfg gta_path)              |                   |
   |                |  spawns the game process and connects -------------------------------------->|
   |                |                     |<-poll GET /api/gamestate (overlay stays up)  |                   |
   |== in game =====|                     |                        |                    |                   |
   |--exit game ----|                     |<-gamestate: finished -> back to browser list |                   |
```

## Local launcher API (confirmed from `client-new/launcher/index.html`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/heartbeat` | GET | 5 s keepalive |
| `/api/config` | GET | version + masterlistUrl |
| `/api/connect` | POST `{host,port,name}` | join a server (JSON body — no shell string building anywhere) |
| `/api/gamestate` | GET | polled; "finished" returns the browser to a usable state |
| `/api/disconnect` | POST | leave server |
| `/api/quit` | POST | F8 `quit` command |
| `/api/ping?host&port` | GET | client-side server ping |

## GTA V discovery (confirmed via binary strings in NSM.exe)

Reads `HKCU\Software\Valve\Steam` (`SteamPath`, `SteamAppId`), probes
`\steamapps\common\Grand Theft Auto V` (+ `libraryfolders.vdf` for extra
libraries), plus common `Program Files` locations; `client-new/.config`
`gta_path` overrides. **Not verified:** the failure mode when no GTA V is
found (opaque binary) — the first-run picker UI for that case is a documented
gap, see "Remaining gaps".

## How this maps to FiveM (Phase 2 research)

Confirmed from the public citizenfx/fivem source documentation (deepwiki index
of github.com/citizenfx/fivem; its license restricts code reuse — **no FiveM
code or assets are copied**; NSM's UI is its own implementation):

- FiveM.exe = launcher personality ("handles updates and bootstrap"); the game
  runs as a spawned `CitizenFX_SubProcess_game_*` host process; the UI is a CEF
  subprocess. One umbrella — the player never opens GTA V separately.
- NSM's shape is the same: NSM.exe hosts the CEF browser (`launcher/index.html`,
  ours) and spawns the game process on connect via `/api/connect`.
- Difference: FiveM opens the Rockstar Games Launcher alongside to validate game
  ownership; NSM/alt:V locates and launches the game directly (registry + game
  files) with no RGL step.

## Remaining gaps vs the FiveM experience (honest list)

1. **First-run GTA V picker** — if the game isn't found there is no browse-to-
   GTA5.exe UI yet (needs either client API support, or the upstream GTAMP
   client source, which is not vendored in this repo).
2. **No auto-updater / signed releases** — files update by re-downloading the
   ZIP; `START-SERVER.bat` does ship a self-healing js-module fixer.
3. **Join progress stages** — the overlay's stages are driven by
   `/api/gamestate` polling; whether the client exposes fine-grained
   (downloading-resources etc.) events is **not verified**.
4. **`altv://` deep links** — referenced by the UI's direct-connect box; whether
   the protocol handler is registered on a clean machine is **not verified**.
5. Accounts, server favorites sync, server-side purchase history — not present.

## UPDATE 2026-10-12 (later) — masterlist is the standalone masterlist.exe

The `nsm-masterlist` server resource described above has been removed. The
masterlist is `masterlist/masterlist.exe` (upstream GTAMP component, in-repo):
open it separately, keep it running; game servers announce to it every 30 s
(key-protected, or OPEN_ANNOUNCE=1 for dev) and the launcher reads
`http://127.0.0.1:8080/servers` from it. `server/.cfg` `[masterlist]` feeds
the announce. The server binary itself starts no masterlist.

## UPDATE 2026-10-12 (later) — in-window game presentation

On connect, the NSM-spawned game's window (GTA5.exe under AppData\Local,
class `grcWindow`) is re-parented into the NSM main window as a WS_CHILD
that fills it and follows resizes (implemented in the discord_rpc.dll
wrapper; documented Win32 APIs only; graceful degradation if anything
fails; exclusive fullscreen is skipped). One visible window during play;
the browser returns automatically when the game exits. See
docs/SINGLE_WINDOW_EXPERIENCE.md.
