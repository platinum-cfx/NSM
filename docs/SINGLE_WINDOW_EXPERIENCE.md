# NSM Single-Window Experience

> Status: implemented; full connect → embed → leave → reconnect cycle verified
> end-to-end in the Wine test rig (mock game, real launcher binaries — see
> Verification). Final acceptance: one real GTA V run on the owner's machine.

## Goal

One window, FiveM-style: double-click NSM.exe → server list → Connect →
the game is presented inside the NSM window → leave the game → the
server list is back → reconnect without restart.

## How it works (fix/embedding branch)

1. `client-new\NSM.exe` starts, sets up logging FIRST, silently detects the
   GTA V install (registry / Steam / common paths) and — if the masterlist URL
   points at localhost and nothing is listening — starts
   `masterlist\masterlist.exe` itself.
2. The **NSM host window** (class `NSMMainWindow`, owned by NSM.exe) is
   created hidden at startup. It is the application window the game is
   embedded into.
3. On Connect:
   - If the server address is local (`127.0.0.1`) and nothing answers,
     NSM starts `server\gtamp-server.exe` itself and waits for its port.
   - If the GTA path is still not known, the GTA5.exe folder picker appears
     NOW (never at startup), and the choice is saved to `.config`.
   - The game packs are checked/extracted as before.
   - If the game runtime in `%LOCALAPPDATA%\<sha1("gtamp")>` is missing
     (fresh install / after a reboot), it is installed add-only from the
     `altv-runtime\` folder shipped in the same ZIP. **No 230MB pack
     download and no GitHub release are needed anymore.** The runtime is
     also no longer wiped on reboot — files persist, missing ones are
     re-copied.
   - The host window is shown ("NSM - <server>") and `altv.exe` is launched
     with `-connecturl ... -directlaunch -customui ...`.
4. Our `discord_rpc.dll` wrapper (loaded by NSM.exe) snapshots running
   GTA5.exe PIDs at startup; when a NEW GTA5.exe appears (the game NSM
   launched), it finds that game's window (class `grcWindow` preferred),
   re-parents it INTO the NSM host window as a `WS_CHILD`, removes the
   frame, fits it to the client area, follows resizes, and **verifies the
   parent relationship with `GetAncestor`** — not just the `SetParent`
   return value. Every step is logged.
5. When the game exits, its window dies, the host window hides, and the
   server browser is the app again. Reconnect works without restarting.

Safety: the game process is only OBSERVED (name + PID); only documented
Win32 window APIs are used; a GTA V already running before NSM opened is
never touched; if embedding fails 3 times the game simply stays a normal
window and NSM keeps working; the wrapper disables itself entirely inside
GTA5.exe. No injection, no patching, no DRM/anti-cheat interference.

## Settings (client-new\.config)

```toml
# Show the game inside the NSM window (false = GTA V opens in its own window)
embed_game_window = true
```

`embed_game_window = false` is the emergency fallback for troubleshooting:
the game opens in its own window exactly like a plain launcher.

## Requirements

- GTA V Display Mode: **Windowed or Borderless** (exclusive fullscreen
  cannot be embedded; it is skipped safely).
- A fresh ZIP of the branch is preferred over old extracted copies.

## Diagnostics

- `%LOCALAPPDATA%\39a4cb14b4afd8c1eef1667c74e3b5936238c44f\logs\connect.log`
  — launcher decisions (GTA detection, server/masterlist auto-start, pack
  extraction, runtime install, game launch).
- `nsm-embed-debug.log` next to NSM.exe — every embedding step:
  `startup: N GTA5.exe already running` → `game pid N window found` →
  `embed: own window found` → `SetParent ok` → `child style set` →
  `frame updated` → `parent verified` → `fitted` → `focus set` → `DONE` →
  `game exited`. If the game opens separately, this file names the exact
  step that stopped.

## Verification (2026-10-12, Wine test rig, real launcher binaries)

Mock game (real `grcWindow`-class window), mock server/masterlist, real
NSM.exe + wrapper DLL from this branch, driven through the real launcher
HTTP API:

    Starting connect.exe / NSM.exe
    Starting local masterlist... / Local masterlist is running.
    Starting local game server (gtamp-server.exe)... / Local game server is running.
    Extracting game packs into ... / Packs successfully extracted.
    Installing game runtime from: ...\altv-runtime\39a4... / Game runtime install complete.
    Launching: "...altv.exe" -connecturl altv://connect/127.0.0.1:7788 ...

    embed: game pid N window found → own window found → SetParent ok →
    child style set → frame updated → parent verified → fitted →
    focus set → DONE → game exited

Full cycle proven twice in one NSM process: connect → `in_game` → game
exit → `idle` (browser back) → connect again → `in_game` → exit → `idle`.
Second connect logged `Local game server already running` (no double start).

Remaining for the owner's machine: one real GTA V run (real alt:V client,
real game process, real input/F8) — see the acceptance checklist below.

## Acceptance checklist (real machine)

1. Fresh ZIP of this branch → extract → run `client-new\NSM.exe`
2. Server list appears (local masterlist auto-starts)
3. Connect → GTA V appears INSIDE the NSM window
4. Game fills the window and follows resizing
5. Mouse/keyboard work; F8 opens the client console; `disconnect` leaves
6. Server list returns in NSM; connect to another server without restart
7. If anything fails: collect `connect.log` + `nsm-embed-debug.log`

## F8 console

The browser-side F8 console (server list) supports `connect`, `status`,
`servers`, `ping`, `disconnect`, `refresh`, `clear`, `quit`. The in-game
F8 console belongs to the compiled client runtime (alt:V native), which is
not part of this repo — it is exercised on the real machine, not claimed
from the test rig.

## Files

- `client-new/nsm-steam-presence-source.c` - wrapper source (Steam presence
  + verified embedding + config fallback)
- `client-new/discord_rpc.dll` - built wrapper (forwards Discord to
  discord_rpc_real.dll)
- `client-new/tests/single-window-test.c` - older in-process mechanics rig
- `sources/cpp/connect.cpp` - launcher: logging-first startup, connect-time
  GTA picker, local server/masterlist auto-start, direct runtime install,
  NSM host window
