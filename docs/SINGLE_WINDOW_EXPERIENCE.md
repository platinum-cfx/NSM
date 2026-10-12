# NSM Single-Window Experience

> Status: implemented, end-to-end verified in the test rig (see below).
> Final acceptance: one real GTA V run on the user's machine.

## Goal

One window, FiveM-style: double-click NSM.exe → server list → Connect →
the game is presented inside the main NSM window → leave the game → the
server list is back in the same window → reconnect without restart.

## How NSM really works (evidence: user-uploaded runtime + its logs)

1. `client-new\NSM.exe` (bootstrap) runs the real launcher from
   `%LOCALAPPDATA%\<hash>\altv.exe` ("gtamp Launcher 16.3.7").
2. **First-run GTA V detection is NATIVE** (previously documented as a
   gap - now proven by strings in altv.exe): the launcher auto-detects
   the GTA V install (Steam / Rockstar), and if it cannot, it shows a
   picker: "Select the GTA V folder" / "We are not able to automatically
   find your GTA V installation. Please select it manually from the
   list." The choice is validated ("This does not appear to be a GTA V
   installation...") and stored as `gtapath` in `altv.toml`
   (changeable). Pirated copies are explicitly rejected.
3. On Connect, the launcher validates/copies `GTA5.exe` +
   `steam_api64.dll` (kept in `backup\`), patches, launches GTA5.exe and
   injects its client - the game is a separate OS process by design.
4. Our `discord_rpc.dll` wrapper (loaded by the NSM client itself):
   snapshots running GTA5.exe PIDs at startup; when a NEW GTA5.exe
   appears (the game NSM launched), finds its window (class grcWindow
   preferred), and re-parents it INTO the NSM main window as a WS_CHILD
   that fills the client area and follows resizes. One visible window,
   one taskbar entry. When the game exits, its window dies and the
   server browser is simply visible again.

Safety: the game process is only OBSERVED (name + PID); only documented
Win32 window APIs are used; a GTA V already running before NSM opened is
never touched; if anything fails the game stays a normal window; the
wrapper disables itself entirely if it ever ends up inside GTA5.exe.
No injection by us, no patching, no DRM/anti-cheat interference.

## Verification (2026-10-12, Wine test rig)

The actual shipped DLL, run against a mock launcher + mock GTA5.exe with
a real grcWindow-class window, produced this trace:

    startup: 0 GTA5.exe already running
    game pid 304 window found
    embed: own window found
    embed: SetParent ok
    embed: child style set
    embed: fitted
    embed: DONE

In-process mechanics test (`tests/single-window-test.exe mech`): 6/6
PASS (re-parent, borderless child style, fill, resize-follow, game-exit,
launcher survival). Cross-process detection + exit handling: PASS.
Only cosmetic miss: automatic focus (SetFocus cross-process) - click the
game once. Remaining unknown: a real GTA V run (user machine).

## Requirements

- **Fresh ZIP** - old extracted copies (e.g. Desktop\NSM-main) contain
  the old DLL and will keep opening GTA separately. Delete, re-download,
  extract, run `client-new\NSM.exe`.
- GTA V Display Mode: **Windowed or Borderless** (exclusive fullscreen
  cannot be embedded; it is skipped safely).

## Acceptance checklist

1. `masterlist\masterlist.exe` + `server\START-SERVER.bat` running
2. Open `client-new\NSM.exe` (fresh copy) → server list
3. Connect → the game appears INSIDE the NSM window (one taskbar entry)
4. Leave/close the game → server list returns in the same window
5. Connect again without restarting NSM

## Diagnostics: nsm-embed-debug.log

Written next to NSM.exe; each line means:
- `startup: N GTA5.exe already running` - the PID snapshot was taken
- `game pid N window found` - the launched game + its window were found
- `embed: own window found` - the NSM main window was found
- `embed: SetParent ok/failed err=N` - the re-parent step
- `embed: child style set / fitted / DONE` - embedding completed
- `game exited` - game window gone; browser visible again
If the game still opens separately, this file says exactly which step
stopped - attach it to any bug report.

## F8 console

The browser-side F8 console (server list) supports `connect`, `status`,
`servers`, `ping`, `disconnect` (leave server, return to the list),
`refresh`, `clear`, `quit`. An in-game F8 overlay belongs to the
compiled client runtime, which is not part of this repo.

## Files

- `client-new/nsm-steam-presence-source.c` - wrapper source (Steam
  presence + embedding)
- `client-new/discord_rpc.dll` - built wrapper (forwards Discord to
  discord_rpc_real.dll)
- `client-new/tests/single-window-test.c` - test rig (modes: host =
  cross-process detection, mech = in-process mechanics, game = mock GTA)
