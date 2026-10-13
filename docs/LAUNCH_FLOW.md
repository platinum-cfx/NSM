# NSM Launch Flow — current architecture (2026-10-13)

> Rewritten for the rebuilt launcher (`sources/cpp/connect.cpp`) after the
> client-architecture correction. The previous version of this file described
> the old opaque upstream NSM.exe and is superseded. Companion documents:
> `FIVEM_RESEARCH.md` (reference research), `LAUNCH_FAILURE_AUDIT.md`
> (process/window map and root-cause analysis of the blank-window bug),
> `REAL_WINDOWS_TEST.md` (acceptance runbook).

## Components

| Component | Path | Role |
|---|---|---|
| NSM.exe / connect.exe | built from `sources/cpp/connect.cpp` (identical binaries) | Player launcher: local API + server browser host, GTA V detection, client launch, session supervision, NSM main window |
| Server browser UI | `client-new/launcher/index.html` | FiveM-style home page, server list from the masterlist, direct connect, F8 console, CONNECTING overlay with live stage detail |
| Wrapper DLL | `client-new/discord_rpc.dll` (source `nsm-steam-presence-source.c`) | Loaded by NSM.exe: Steam presence, pack guard, and the game-window embed into `NSMMainWindow` |
| Client runtime | `%LOCALAPPDATA%\<sha1("gtamp")>\altv.exe` | Installed add-only from `altv-runtime/<hash>/` next to the launcher or extracted from `packs/mp*.pack`; owned by the game session |
| Masterlist | VPS (configured in `.config` `masterlist_url`) | Serves `/servers`; NOT started by the launcher |
| Game server | `gtamp-server.exe`, run by the server owner | NOT started by the launcher |

## The flow (verified by `client-new/tests/e2e-production.sh`, 42/42)

```
Player        NSM.exe                browser UI (Edge/Chrome --app)      masterlist (VPS)     gtamp-server (owner)
  |  double-click  |                          |                              |                     |
  |--------------->| log first, detect GTA V  |                              |                     |
  |                | local API :9987-9988     |                              |                     |
  |                |-- opens app window ------>|                              |                     |
  |                |                          |-- GET /servers ------------->| list                |
  |-- click Connect -------------------------->| POST /api/connect {host,port}|                     |
  |                |<-- hasConnectPending -----|                              |                     |
  |                | [state: connecting/detail stages]                        |                     |
  |                | 1. reachability check (TCP, fast refused-path)           |                     |
  |                | 2. GTA path check (picker only here, never at startup)   |                     |
  |                | 3. packs -> runtime (add-only) -> config                 |                     |
  |                | 4. pre-launch checklist logged                           |                     |
  |                | 5. CreateProcess altv.exe -connecturl altv://connect/H:P |                     |
  |                | 6. watch: pid, GTA5.exe appearance, embed log, timeouts  |                     |
  |                |    wrapper: find grcWindow -> SetParent into NSMMainWindow
  |                |    -> verify -> fit -> SHOW host (never before!)         |                     |
  |                | [state: in_game]                                         |                     |
  |<-- game embedded in the NSM window, one visible app window ------------- |                     |
  |-- quit game ---| GTA5 gone -> cleanup, hide host window                  |                     |
  |                | [state: idle] - browser still open, reconnect allowed   |                     |
```

## Failure paths (each logs a timestamped reason + Win32 error and recovers to idle)

- Server unreachable → `Server H:P is unreachable - not launching the client.` + dialog; nothing started.
- Client fails to launch → `Failed to launch the client: ... (Windows error N)` + dialog.
- Client exits before GTA V → real exit code logged and reported.
- Client alive but no GTA V within `game_start_timeout_sec` (default 120) → client terminated, clear error.
- GTA V alive but not embedded within `embed_timeout_sec` (default 90) → game continues in its own window (logged); no blank window is ever shown.
- Duplicate Connect while connecting/in_game → refused (`busy`), a second client can never launch.

## Logs

- `%LOCALAPPDATA%\<sha1("gtamp")>\logs\connect.log` — the complete launch trace
  (stage details, pre-launch checklist, client pid, GTA5 appearance, embed
  events, exit codes, timeouts, the Win32-visible host hide).
- `nsm-embed-debug.log` next to `discord_rpc.dll` — wrapper embed trace
  (startup snapshot, window found, SetParent, parent verify, host shown, DONE).

## Configuration (`client-new/.config`)

- `gta_path` — GTA V folder (auto-detected: registry/Rockstar/Epic/Steam + libraryfolders.vdf + drive scan; folder picker at Connect time if missing)
- `masterlist_url` — the VPS masterlist (production value, not localhost)
- `embed_game_window` — embed the game into the NSM window (default true)
- `game_start_timeout_sec`, `embed_timeout_sec` — supervision timeouts

## Rockstar / Steam / Epic legitimacy

NSM only *locates* an existing GTA V installation and launches the multiplayer
client with `SteamAppId=271590`; any ownership/authentication flow belongs to
the official launcher/Steam/Epic and the client itself. NSM never fakes
verification and never bypasses ownership checks. `GTA5.exe` (Legacy) must be
present — GTA V Enhanced-only installs are reported as "GTA V not found" with
the folder-picker instead of a blank window.
