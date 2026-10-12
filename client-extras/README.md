# Client extras — Steam presence (the FiveM trick)

How FiveM does it: its game process has Steamworks code built in and
initializes it at startup with AppID 244310 ("Source SDK Base 2007", a free
Source app whose license virtually every Steam account already holds — which
is why nothing ever gets downloaded or installed). Steam then shows
"Playing Source SDK Base 2007" for as long as the game runs.

## How NSM does the same

`NSM.exe` is untouched and remains the one and only file you run. The client
loads `discord_rpc.dll` from its own folder at startup, so in this download
that file is a small wrapper (full source: `client-new/nsm-steam-presence-source.c`):

- the moment the client loads it, it initializes Steamworks **inside the
  client's own process**, with the AppID from `client-new/steam_appid.txt`
  (244310) — the same mechanism FiveM uses
- Discord presence keeps working: everything forwards to the real library,
  unchanged, renamed to `discord_rpc_real.dll`
- `steam_api64.dll` is not shipped; it is borrowed at runtime from an
  installed Steam game (Grand Theft Auto V first), located via the registry
- if Steam isn't running or anything fails, it stays silent — the game and
  Discord presence are never affected

## Requirements

- Steam installed and running when you play.
- Your account must hold the Source SDK Base 2007 license (free). It does if
  it appears under Steam → Library → Tools. **No download or install of it
  is needed** — the license alone is enough.

## If the status doesn't show

Run `CHECK-STEAM.bat` (this folder) while the client is open and send back
the `STEAM-CHECK.txt` it produces.
