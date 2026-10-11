# GTAMP — alt:V keep-alive launcher + server browser

Standalone launcher and server wrapper that keep an alt:V-based GTA V multiplayer running
after the alt:V shutdown, now with a **masterlist and in-launcher server browser** so
players open the launcher, see a list of servers, and click to join.

> **What this is / isn't.** This repo contains the launcher, server wrapper, proxy, UI and
> masterlist — all source. It does **not** contain alt:V's core (`altv-client.dll`,
> `altv-server.exe`, `libce2.dll`); those are closed, prebuilt binaries that are patched at
> runtime. They cannot be rebuilt, and a breaking GTA V update cannot be fixed here.
> See [`EXCLUDED_FILES.md`](EXCLUDED_FILES.md) for large binaries omitted from git.

## Layout

| Path | What |
|---|---|
| `masterlist/` | **Masterlist API** (Node, zero deps). Servers announce here, launcher reads the list. [README](masterlist/README.md) |
| `client-new/` | **Player-facing launcher.** `connect.exe` + `launcher/index.html` (server browser UI) + `packs/` |
| `server/` | **Server host.** `gtamp-server.exe` + `.cfg` (now with a `[masterlist]` section) |
| `sources/cpp/` | Launcher source: `connect.cpp`, `browser/browser_server.h` (server browser), `proxy/`, packers |
| `sources/server/` | Server wrapper source: `server.cpp` (announce heartbeat lives here) |
| `sources/altv-ui/` | In-game Svelte UI (loading screen, pause menu) |
| `altv-js-module-v1/` | alt:V JS module source (public, MIT) — reference only |

## How it fits together

```
 gtamp-server.exe ──POST /announce every 30s──▶  masterlist (list.example.com)
                                                        ▲
 connect.exe (no args)                                  │ GET /servers
   └─ serves launcher UI on 127.0.0.1:9987 ─────────────┘
   └─ player clicks Connect ──▶ launches altv.exe -connecturl altv://connect/ip:port
```

## Player: install & play

1. Get the full `client-new` folder (from a release zip — `packs/mp1.pack` is too large for git).
2. Edit `client-new/.config`:
   - `gta_path` → your GTA V folder
   - `masterlist_url` → the masterlist you want to browse (e.g. `https://list.example.com`)
3. Run **`connect.exe`** with no arguments → the server browser opens in your web browser.
   Pick a server → GTA V launches and connects.
   - Direct connect still works: `connect.exe -connect ip:port`
   - Favorites ★, search `/`, filters, ping, and double-click / Enter to connect.

Antivirus/SmartScreen will warn: the launcher is unsigned and patches alt:V binaries in `%LOCALAPPDATA%`.

## Server owner: get listed

1. Ask the masterlist admin for a **server key** (they run `POST /keys`).
2. In `server/.cfg`:
   ```toml
   name = 'My Server'
   port = 7788

   [masterlist]
   announce = true
   masterlist_url = 'https://list.example.com'
   server_key = 'gtamp_…'
   public_host = ''          # leave empty to use your public IP automatically
   gamemode = 'Roleplay'
   language = 'en'
   description = 'Serious RP, whitelist on Discord'
   tags = 'rp, whitelist'
   ```
3. Forward **7788 TCP+UDP**. Start `gtamp-server.exe`. Within 30 s you appear in the list.
   The console prints `Masterlist: announce failed (…)` if something's wrong (bad key, port not reachable).

Note: `server/resources/` ships empty and `.cfg` references a `gtamp-online` resource that
does not exist publicly. Set `resources = [ ]` or drop in your own alt:V JS gamemode.

## Masterlist admin: host the list

See [`masterlist/README.md`](masterlist/README.md). Short version on a Linux VPS:
```bash
ADMIN_KEY=$(openssl rand -hex 24) PORT=8080 node masterlist/server.js
# put Caddy/nginx in front for HTTPS, then mint keys with POST /keys
```

## Build (Windows, VS 2022)

- **Launcher / client:** `sources\build.bat` → outputs to `client-new\` (copies `launcher\index.html` too).
  Requires the excluded `sources/resources/*.res` and `sources/payload/libs/libce2.dll` from the original archive.
- **Server:** `sources\server\build.bat` → `server\gtamp-server.exe` (now links `winhttp.lib`).
- **In-game UI:** `cd sources/altv-ui && npm i && npm run build`.

## Roadmap

- [x] Masterlist API with server keys, rate-limit, reachability check
- [x] Server heartbeat (`[masterlist]` in `.cfg`)
- [x] Server browser in launcher (search, filters, ping, favorites, direct connect)
- [ ] Launcher auto-update (manifest + delta download)
- [ ] Player accounts / identity tokens
- [ ] Code signing
- [ ] FiveM script compatibility shim (JS only; Lua/ESX/QBCore are out of scope — different runtime)
