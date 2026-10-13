# NSM Real-Windows Acceptance Runbook (click-by-click)

> The Wine E2E rig (42/42) proves the launcher logic with mocks. It cannot
> prove real GTA V behavior. This runbook is how we close that gap on a real
> Windows machine with a real GTA V install and a real, separately running
> GTAMP server. **No terminal commands are needed for the player flow.**

## What you need

1. A Windows 10/11 machine with GTA V **Legacy** installed (`GTA5.exe`
   present — GTA V Enhanced-only is not supported by the alt:V client) and
   Steam installed (for the Steam authentication flow the client uses).
2. The new build: `NSM.exe`, `connect.exe`, `discord_rpc.dll` from the
   `fix/client-architecture` branch, placed in your GTAMP folder (next to
   `packs\` and `altv-runtime\`).
3. `.config` with `masterlist_url` pointing at your VPS masterlist and
   `gta_path` either empty (auto-detect) or set to your GTA V folder.
4. Your GTAMP server started by you (the server owner) **before** connecting,
   announcing to the masterlist.

## Run (5–10 minutes)

1. Double-click `NSM.exe`.
   - [ ] The server browser window opens and lists servers from the VPS.
   - [ ] Task manager shows **no** `masterlist.exe` and **no** `gtamp-server.exe`
         started by NSM (only the ones you started yourself).
   - [ ] No empty "NSM" window appears.
2. Click **Connect** on your server.
   - [ ] The browser shows a CONNECTING overlay with a **live stage line**
         ("preparing game files", "launching client", "waiting for GTA V", ...).
   - [ ] Steam/Rockstar authentication, if it appears, completes normally.
   - [ ] GTA V starts and the **NSM window appears with the game inside it** —
         never before the game is visible, never blank/white.
   - [ ] The overlay line changes to "in game - <server>".
   - [ ] Clicking Connect again anywhere does NOT launch a second game.
3. Play for a minute, then quit GTA V.
   - [ ] The NSM window disappears; the browser is back and usable.
   - [ ] You can immediately connect to another server (no NSM restart).
4. Failure drill A — offline server: stop your GTAMP server, click Connect.
   - [ ] A clear "NSM - Connection Error" dialog appears (server unreachable);
         nothing is started locally; the browser returns to the list.
5. Failure drill B — client dies: rename the game's `altv.exe` folder content
   (or temporarily move `%LOCALAPPDATA%\<hash>\altv.exe` away), click Connect.
   - [ ] A clear error appears with the **Windows error code** or the client's
         **exit code**, and NSM recovers to the browser.

## If something fails: send the two log files

- `%LOCALAPPDATA%\<sha1("gtamp")>\logs\connect.log`
  (the full launch trace: stage by stage, with error codes)
- `nsm-embed-debug.log` from the folder containing `NSM.exe`
  (the embed trace)

`connect.log` now records: pre-launch checklist (client present, GTA5.exe
present, wrapper present, working dir), the exact command line, the client
PID, when GTA5.exe appeared, every embed event, the client's exit code if it
died, and which timeout/error ended the session. With those two files the
failing branch is identifiable without another round trip.

## RESOLVED (2026-10-13): libce2.dll - the real-machine root cause

The owner's first diagnostic run confirmed it:
`Client exited before starting GTA V (exit code 3221225477)` =
0xC0000005 - the client crashes because `libs\libce2.dll` (listed in the
client's own update hashList, SHA1 1affc48a...) was in no distribution
channel. Fixed by:

1. the `game-packs` release (real mp1.pack + standalone libce2.dll,
   SHA1-verified against the client's hashList), and
2. the wrapper's pack-guard, which detects the stub mp1.pack at startup
   and downloads the full pack in the background.

UPDATE (2026-10-13): the pack served on the release until this date
(226,614,288 B) was encrypted with an incompatible key and could never be
decrypted by the launcher - placing it in packs\\ produced the false
"mp1.pack not found" error. The release now serves a REBUILT full pack
(228,682,672 B, SHA1 2b75525b54e0880b9d42b3518e6598bec3ab5770), verified
end to end in Wine (stub -> guard download -> Connect -> game files
verified, real libce2.dll 226,394,112 B). If your machine still has the
old 226,614,288 B mp1.pack, delete it (or just start NSM.exe - the guard
replaces it automatically).

Manual quick fix if you prefer not to wait for the background download:
download `libce2.dll` from the game-packs release and place it in
`%LOCALAPPDATA%\39a4cb14b4afd8c1eef1667c74e3b5936238c44f\libs\`, or
download `mp1.pack` into `client-new\packs\` (replacing the stub).

## Known limits (honest)

- The launcher observes process/window-level truth (GTA5.exe alive, game
  window embedded). Whether the client completes the *network* connection to
  the server is internal to the alt:V client — the launcher cannot see it.
- The server browser runs in an Edge/Chrome app window (a separate OS window
  from the NSM game window). One persistent native window for both browser
  and gameplay requires the WebView2 host — researched in FIVEM_RESEARCH.md
  §6, deliberately not shipped until it can be validated on real Windows.
- On Wine (test rig only) the X11 driver may keep the hidden host window
  mapped; at the Win32 layer it is hidden (this is a Wine artifact, not a
  product bug — see the E2E notes).
