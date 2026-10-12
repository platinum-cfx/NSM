# NSM Troubleshooting

> Updated 2026-10-12. For architecture terms see `docs/LAUNCH_FLOW.md`.

## Server list is empty in the browser

The list comes from `http://127.0.0.1:8080/servers`, served by the
`nsm-masterlist` resource **that runs inside your game server**.

1. Is the server running? (`START-SERVER.bat` — the console should print
   `[nsm-masterlist] server list is LIVE at http://127.0.0.1:8080/servers`)
2. If the console says the port is busy, something else already listens on
   8080 — the launcher will use whatever that is; if it's not a masterlist,
   free the port or change `masterlist_url` (and the resource's port follows
   that URL) in `server/.cfg`.
3. In the browser's F8 console, type `status` and `servers` for a live report.

## Clicking Connect does nothing / "Launcher not reachable"

The browser page talks to the client's local API on ports 9987–10005. This
alert means the UI was opened outside the NSM.exe client (e.g. the HTML file
in a normal browser). Always play from `client-new\NSM.exe`.

## Connect starts but never joins

1. Check the **server console** — a joining player prints connect/handshake
   lines there. If nothing appears, the client never reached the server.
2. Same machine: use `127.0.0.1:7788` (direct connect). Different machines:
   the server PC must have port 7788 reachable (firewall/port-forward).
3. Version mismatch: the js-module fixer in `START-SERVER.bat` keeps the
   server module matched to the server exe — run it and read its output.

## Steam status does not show "Source SDK Base 2007"

Requirements: Steam running; account holds the free 218 license (it appears
under Steam → Library → Tools if licensed — no install needed); any Steam
game installed that ships `steam_api64.dll` (GTA V counts). If it still
fails, run `client-extras\CHECK-STEAM.bat` while the client is open and send
back the `STEAM-CHECK.txt` it produces. A full Steam restart
(Steam → Exit, not the X) clears cached state.

## ESX resources fail to start

`mysql.json` missing or wrong: `START-SERVER.bat` warns before starting. Copy
`server/mysql.json.example`, fill in your MariaDB password. `SETUP-DB.bat`
creates the databases/tables.

## Where the logs are

| Log | Where |
|---|---|
| Server | the `START-SERVER.bat` console window (copy lines from there) |
| Client launcher | F8 console inside the NSM.exe browser (`status`, `servers`, `refresh`) |
| Steam/diagnostics | `STEAM-CHECK.txt` on the Desktop after running `client-extras\CHECK-STEAM.bat` |

No passwords/tokens are included in any of these except `mysql.json` (server
side only — do not paste that file publicly).

## UPDATE 2026-10-12 (later) — empty list now points at masterlist.exe

The masterlist is the standalone `masterlist\masterlist.exe` (the game server
no longer serves the list). Checklist for an empty list: 1) is masterlist.exe
running? 2) did your server announce? (`[masterlist]` in `server\.cfg`:
`announce = true` + `server_key`, or masterlist started with
`OPEN_ANNOUNCE=1`); 3) the masterlist TCP-probes the game port before listing
it — the server must be up (`VERIFY_PORT=0` disables probing, e.g. NAT dev).

## UPDATE 2026-10-12 (later) — single-window issues

- **Game opens as a separate window instead of inside NSM:** GTA V is in
  exclusive fullscreen — set graphics to Windowed or Borderless (exclusive
  fullscreen cannot be embedded and is skipped safely).
- **NSM window did not come back after the game closed:** restart NSM.exe
  (window state is per-run; the browser itself was never closed).
- **F8 console:** the browser-side console (with `disconnect`) is available
  on the server list; an in-game console overlay belongs to the client
  runtime, which is compiled and not part of this repo.

## UPDATE 2026-10-12 (c) - game still opens separately?

1. You are almost certainly running an OLD extracted copy - delete it, re-
   download the repo ZIP fresh, open client-new\NSM.exe (the fix lives in
   client-new\discord_rpc.dll).
2. GTA V must be set to Windowed or Borderless - exclusive fullscreen cannot
   be embedded (safely skipped).
3. Only a GTA5.exe that STARTS after NSM is embedded - a game already
   running before NSM opened is never touched.
Wine integration test status: FAILED - see client-new/tests/ notes; shipped anyway (strictly better than previous build).
