# Client extras — Steam presence (the FiveM trick)

FiveM shows up in Steam as "Playing Source SDK Base 2007" because its exe
initializes the Steamworks API with AppID 244310 (a free Source app) while it
runs. **NSM now does exactly the same thing, the same way.**

## How it works in this download

- `client-new/NSM.exe` — a tiny launcher (full source: `client-new/nsm-shim-source.c`).
  On double-click it registers with Steam as AppID 244310, then starts the real
  client (`nsm-game.exe`) and holds the status until you close the game.
- `client-new/nsm-game.exe` — the actual game client (unchanged binary).
- `client-new/connect.exe` — server browser. Launching through `NSM.exe` is
  what carries the Steam status.
- `client-new/steam_appid.txt` — contains `244310`; the launcher reads it.

No files are copied into hidden folders and nothing is modified in your Steam
install. The launcher loads `steam_api64.dll` from any installed Steam game
(Grand Theft Auto V first) purely to make the "I'm playing" call.

## Requirements (once per machine)

1. Steam installed and running.
2. Your account must own Source SDK Base 2007 (free):
   Steam → Library → dropdown "Games" → Tools → Source SDK Base 2007 → Install.
3. Fully restart Steam once after installing it (Steam → Exit, not the window X).

## First run notes

- Windows may show a firewall prompt for `nsm-game.exe` → Allow (it's the game).
- `NSM.exe` is unsigned. If SmartScreen shows "Windows protected your PC":
  More info → Run anyway. The complete source ships next to it.
- If Steam isn't running or the AppID isn't owned, the game still runs — you
  just don't get the status. Presence never blocks playing.

## Troubleshooting

Run `CHECK-STEAM.bat` (in this folder) while the game is open and send back
the `STEAM-CHECK.txt` it produces.
