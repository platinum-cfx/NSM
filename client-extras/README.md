# Client extras — Steam presence (the FiveM trick)

FiveM shows up in Steam as "Playing Source SDK Base 2007" because it ships a
`steam_appid.txt` containing AppID 244310 (a free Source engine app everyone
owns) next to its exe. Steam then treats the process as that game and shows
you as playing it.

## Do the same for NSM / gtamp

Fresh downloads already carry `steam_appid.txt` inside `client-new/` next to
the client exe (same as FiveM's download carries it). If your copy predates
this or the file is missing:

1. Copy `steam_appid.txt` from this folder into the folder with the exe you
   launch to play (the gtamp launcher/client exe — the one you double-click).
2. Make sure Steam is running, then launch the game as usual.
3. Your Steam status (and friends' view) now says **Source SDK Base 2007**,
   exactly like FiveM.

### If the status doesn't change
- Also copy the file next to the main game/client exe if the launcher runs
  from a different folder (the trick must sit beside the process Steam sees).
- Restart Steam once (it caches app state).
- Note: this only affects the *status text*. It does not launch anything
  through Steam and needs no Steam features.

### Prefer your own name instead?
Steam -> Add a Non-Steam Game -> pick the gtamp exe -> rename the library
entry to "NSM" -> always launch it from Steam. Friends then see
"Playing NSM".

## Discord
The NSM server already runs a DiscordRPC service (`discord_presence = true`
in server/.cfg; "Starting DiscordRPC server on [::]:7899" in the console).
With Discord open while you play, your profile can advertise the server.

## IMPORTANT — the launcher is not the exe Steam watches

The client exe you double-click is only the menu/launcher. When you join a
server, the real game process starts from a hidden runtime folder that the
client downloads/creates on first run. THAT is the process Steam has to see
the appid file next to. So place `steam_appid.txt` in BOTH places:

1. Next to the client exe you launch (as above), and
2. In the client's runtime folder:
   - Press Win+R, type `%LOCALAPPDATA%`, press Enter
   - Look for a folder whose name is a long hex string (e.g.
     `39a4cb14...`) that contains `altv.exe` — also check folders like
     `Programs\gtamp-launcher` if present
   - Copy `steam_appid.txt` into it (next to `altv.exe`)

Also note: Steam only shows the badge for apps your Steam account owns.
If it still doesn't show after both copies are in place:
- Steam -> Library -> dropdown "Games" -> Tools -> search
  "Source SDK Base 2007" -> Install it (tiny download), then fully
  restart Steam (Steam -> Exit, not the window X).
