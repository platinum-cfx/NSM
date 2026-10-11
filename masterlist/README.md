# GTAMP Masterlist

Central server directory for the GTAMP launcher. Game servers announce here every 30 s;
the launcher's server browser reads `/servers`.

Zero dependencies. Requires Node.js 18+.

## Run it

```bash
cd masterlist
ADMIN_KEY=change-me PORT=8080 node server.js
```

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | Listen port |
| `HOST` | `0.0.0.0` | Bind address |
| `ADMIN_KEY` | *(unset)* | Required to mint server keys via `POST /keys`. If unset, key creation is disabled. |
| `OPEN_ANNOUNCE` | `0` | Set `1` to accept announces without a key (dev/testing only) |
| `TIMEOUT_MS` | `90000` | Drop a server after this many ms without a heartbeat |
| `VERIFY_PORT` | `1` | TCP-probe the game port on first announce (set `0` to disable, e.g. behind NAT in dev) |
| `DATA_DIR` | `./data` | Where `keys.json` is stored |

## Production (systemd + Caddy for HTTPS)

`/etc/systemd/system/gtamp-masterlist.service`:
```ini
[Unit]
Description=GTAMP Masterlist
After=network.target

[Service]
User=gtamp
WorkingDirectory=/opt/gtamp/masterlist
Environment=PORT=8080
Environment=ADMIN_KEY=REPLACE_WITH_LONG_RANDOM_STRING
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

`/etc/caddy/Caddyfile` (automatic HTTPS):
```
list.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Then `systemctl enable --now gtamp-masterlist && systemctl reload caddy`.

## API

### `GET /servers`
Public list. Optional filters: `?gamemode=`, `?language=`, `?search=`, `?verified=1`.
```json
[{
  "id": "03ffb0ea90e94f50", "name": "GTAMP Official", "host": "203.0.113.5", "port": 7788,
  "players": 42, "maxPlayers": 128, "gamemode": "Roleplay", "language": "en",
  "website": "", "description": "…", "tags": ["rp"], "locked": false,
  "version": "gtamp-1.0", "verified": true, "lastSeen": 1788803590475
}]
```

### `POST /announce` — header `X-Server-Key: <key>`
Sent automatically by `gtamp-server.exe` when `announce = true` in `.cfg`.
```json
{ "name": "…", "port": 7788, "players": 3, "maxPlayers": 128, "gamemode": "Freeroam",
  "language": "en", "website": "", "description": "", "tags": [], "locked": false,
  "version": "gtamp-1.0", "host": "optional.public.host" }
```
`host` defaults to the announcing IP. A key may register multiple servers; a `host:port`
stays bound to the key that first registered it.

### `POST /keys` — header `X-Admin-Key: <ADMIN_KEY>`
```bash
curl -X POST https://list.example.com/keys -H "X-Admin-Key: $ADMIN_KEY" \
     -H "Content-Type: application/json" -d '{"owner":"someone@example.com"}'
# -> {"key":"gtamp_…","owner":"someone@example.com"}
```
Give the key to the server owner; they put it in `server/.cfg` as `server_key`.

### `GET /health`
`{"ok":true,"servers":5,"players":144,"uptime":1234}`

## Abuse controls
- Server key required to announce (unless `OPEN_ANNOUNCE=1`)
- 60 requests/min per IP
- Game port is TCP-probed before first listing (`verified` flag)
- All string fields are length-clamped and control characters stripped
- Servers vanish 90 s after their last heartbeat
