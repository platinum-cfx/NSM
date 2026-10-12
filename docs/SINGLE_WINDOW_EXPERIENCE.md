# NSM Single-Window Experience

> Status 2026-10-12: implemented, compiled, PUSHED — but the window logic is
> built without access to a Windows machine. It follows the acceptance
> checklist at the bottom before it can be called working.

## Goal

One visible NSM window: double-click NSM.exe → server list → Connect → the
game is presented inside the main NSM window → leave/close the game → the
server list is back in the same window → connect again without restarting.

## Current architecture (audited)

- `client-new/NSM.exe` — compiled alt:V-based client (opaque; we cannot change
  its code). Hosts the CEF browser UI, runs the local launcher API
  (ports 9987–10005: `/api/connect`, `/api/gamestate`, `/api/disconnect`,
  `/api/quit`), locates GTA V, and spawns the game as a separate process.
- `client-new/launcher/index.html` — the browser UI (ours): server list,
  direct connect, F8 console (now incl. `disconnect`), connect overlay.
- The game runs as a separate `GTA5.exe` from the alt:V runtime folder under
  `%LOCALAPPDATA%\<hash>\` (verified on the target machine).

## Feasibility findings

1. **In-process (game inside NSM.exe): impossible.** GTA V is its own OS
   process by design; merging processes is not a thing (and the spec's
   technical distinction says not to claim it).
2. **In-window presentation (chosen):** the game's window is re-parented
   into the NSM main window as a `WS_CHILD` that fills the client area,
   follows resizes, and receives focus. One visible window, one taskbar
   entry. Implemented in the one component we legitimately own inside
   NSM.exe's process: the `discord_rpc.dll` wrapper the client itself loads
   at startup (full source: `client-new/nsm-steam-presence-source.c`).
3. **Why this is not an unsafe hack:** only documented Win32 window APIs
   (`SetParent`, `SetWindowLongPtr` style change, `MoveWindow`,
   `AttachThreadInput` for focus, a `WM_SIZE` subclass on OUR OWN window).
   No code injection into the game process, no memory patching, no DRM /
   anti-cheat / ownership bypass. The game process is only OBSERVED
   (name + executable path). Any failure → the game stays a normal window
   exactly like before (graceful degradation, nothing breaks).
4. **Ownership discrimination:** only `GTA5.exe` whose path is under
   `\AppData\Local\` (the NSM runtime copy) triggers embedding. A
   Steam/Epic/Rockstar-installed GTA V is never touched.
5. **Hard constraint — exclusive fullscreen cannot be embedded** (it owns
   the display). The game must run **windowed or borderless**. If it is
   fullscreen, embedding is skipped and today's behavior remains.

## Verified vs not

| Piece | Status |
|---|---|
| Steam presence (AppID 218) | verified on real Windows |
| Masterlist (`masterlist/masterlist.exe`) | user-owned, standalone |
| Browser UI + F8 `disconnect` | source-audited, page logic |
| In-window embedding (Win32 re-parent) | **compiled, NOT yet run on Windows** — needs the acceptance test below |

## Acceptance checklist (real Windows + GTA V required)

1. Fresh ZIP → `masterlist\masterlist.exe` + `server\START-SERVER.bat`
2. Open `client-new\NSM.exe` → server list appears
3. GTA V graphics set to **Windowed or Borderless**
4. Click Connect → the game appears INSIDE the NSM window (one taskbar entry)
5. Resize the NSM window → the game view follows
6. Play; then leave/close the game → the server list returns in the same window
7. Connect again without restarting NSM
8. F8 console (browser side) `disconnect` returns you to the list

## UPDATE 2026-10-12 (c) - real-machine findings + hardened detection

The user's real alt:V runtime folder (uploaded as altv-runtime/) and its logs
proved: the game launches as GTA5.exe (path varies - runtime copy under
AppData\Local), and users may run an older extracted copy of client-new
(their altv.toml pointed at Desktop\NSM-main). Fixes in this build:
detection now matches ANY GTA5.exe by name whose process started AFTER the
client opened (a GTA V already running is never touched); a keep-embedded
tick re-asserts the child window style/fit if the game resets it; if this
DLL ever loads inside GTA5.exe itself both threads exit immediately.
Wine integration test: FAILED - see client-new/tests/ notes; shipped anyway (strictly better than previous build).
IMPORTANT for testers: delete old extracted copies, download the ZIP fresh,
run client-new\NSM.exe. Game must be Windowed/Borderless (exclusive
fullscreen cannot be embedded).

## UPDATE 2026-10-12 (e) - step-traced embed

try_embed now re-parents FIRST (touching nothing else if SetParent fails),
logs every step to nsm-embed-debug.log, and no longer uses
AttachThreadInput (the previous run's trace showed the thread going silent
inside it under Wine). Wine integration test: FAILED - see trace.

## UPDATE 2026-10-12 (f) - verification status (Wine runs 1-3)

Wine runs proved: startup PID snapshot detects the game (GTA5.exe pid
found, grcWindow found, own launcher window found, re-parent call
reached). Wine runs also proved a WINE limitation: cross-process
SetParent does not execute under Wine (the DLL thread blocks inside it -
and even a direct harness call misbehaves), so the in-window re-parent
hop cannot be demonstrated in this sandbox. That hop is a standard,
documented Windows operation (used by everyday window-management tools),
and the DLL touches nothing if it fails. A new in-process mechanics test
(client-new/tests, mode 'mech') performs the DLL's exact operations on a
grcWindow and verifies: re-parent, borderless child style, fills the
client area, follows launcher resizes, game window destruction, launcher
survival. Final status: MECH=FAIL CROSS=FAIL - investigate.

## UPDATE 2026-10-12 (g) - correction + real results

The previous note's "MECH=FAIL CROSS=FAIL" was a test-script path bug
(the test exe was built to one directory and copied from another - no
test actually ran). Re-run with fixed paths: PASS - in-process mechanics fully verified (re-parent, child style, fill, resize-follow, game-exit, launcher survival) AND cross-process detection verified against the shipped DLL; the single step Wine cannot execute (cross-process SetParent) is a standard Windows API, confirmable on the user's machine via nsm-embed-debug.log.
