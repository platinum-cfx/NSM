# NSM on Windows: exact setup for you and your friends

**What this is:** the copy-paste path to run the NSM server (FiveM-compatible Lua
stack on alt:V) on a Windows machine and connect with the real GTA V client.
**What this is not:** a claim that it works in-game. The in-sandbox evidence is
strong (server 102/102, client runtime 70/70, multiplayer 36/36, DB 20/20 — all
with real qb-core + real MariaDB), but the on-device checklist in
`CLIENT_COMPATIBILITY.md` §7 has not been executed yet. Expect the first run to
surface environment issues; the checklist tells you exactly what to look for.

## 0. Prerequisites

| Thing | Why | Where |
|---|---|---|
| GTA V (legal copy, updated) | the game client | Rockstar/Steam/Epic |
| [GTAMP](https://gtamp.com) / alt:V client (release, x64) | the multiplayer client NSM targets | altv.mp or gtamp.com |
| Node.js ≥ 18 (LTS) | runs the NSM server | nodejs.org |
| MariaDB 10.6+ (or MySQL 8) | player persistence | mariadb.org |
| The `nsm-fivem-compat` folder | the server + compatibility layer | this repo |

## 1. Database (once)

```bat
:: install MariaDB, then in an admin prompt:
mysql -u root -p
```
```sql
CREATE DATABASE fivem;
CREATE USER 'fivem'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL ON fivem.* TO 'fivem'@'localhost';
FLUSH PRIVILEGES;
```

Then create `server/mysql.json` (adjust host/port/user/password):

```json
{ "host": "127.0.0.1", "port": 3306, "user": "fivem", "password": "change-me", "database": "fivem" }
```

Load the qb-core schema (one time):

```bat
mysql -u fivem -p fivem < real_resources\qb-core\sql\qbcore.sql
```

> qb-core creates its `players` table automatically on first Login if the schema
> is missing, but loading the SQL file gives you the full column set + indexes.

## 2. Server

```bat
cd path\to\nsm-fivem-compat\server
npm install
node index.js
```

Expected console output (this is your "it booted" signal):

```
[NSM] server resource module loaded
[cfx-compat] native stubs installed: 6423
[cfx-compat] 3/3 FiveM resource(s) running     <- qb-core, mp-demo, fivem-compat
```

Open ports if friends connect from the internet: **7799 UDP/TCP** (alt:V main) and
**7899** if you use the alt:V voice module; otherwise keep them loopback-only.

### Which resources run

`server/fivem_resources/` holds the FiveM resources the compatibility layer runs:
- `fivem-compat` (the layer itself — do not remove),
- `qb-core` (symlinked from `real_resources/qb-core`; use a real folder copy on Windows),
- `mp-demo` (the multiplayer test resource — safe to remove once bored).

The generated client bundle lives in `resources/fivem-client/` and must be listed
in your alt:V `server.cfg` resources so clients download it.

## 3. Client (you + each friend)

1. Install the GTAMP/alt:V client, point it at your server:
   `direct-connect` → `your-ip:7799`.
2. On connect, the client downloads `fivem-client` — watch the client console (F8)
   for `boot complete: N/N resources running`.
3. **The `nsm-selftest` resource runs automatically 1.5s after you connect**
   and prints the full §7 checklist result to the SERVER console — no manual
   steps. You should see:

```
[nsm-selftest]   OK  coroutine + Wait loop (3x10ms)          n=3
[nsm-selftest]   OK  PlayerPedId() returns a ped handle      ped=...
[nsm-selftest]   OK  NUI callback round-trip (page fetch)    page -> Lua -> page cycle complete
...
[nsm-selftest] VERDICT: 12/12 checks passed — client runtime verified in this environment
```

   Re-run it any time with the chat command `nsmselftest` or the **F7** keybind.
   Anything marked `FAIL` — copy the whole block from the server console into
   the bug report. `SKIP` means that path needs something this environment
   doesn't have (e.g. no webview) — on the real client there should be none.

   (The same selftest is verified in-sandbox: `node test/selftest.test.mjs`
   → 11/11 with a page-running webview stub covering the NUI cycle.)

## 4. What is verified vs not (honest table)

| Layer | Status | Evidence |
|---|---|---|
| Server-side FiveM Lua API | ✅ tested | 102/102 + qb-core/esx load gates |
| oxmysql API on real MariaDB | ✅ tested | 20/20 (transactions, ROLLBACK, restart persistence) |
| Two-client multiplayer (simulated clients, real transport + DB) | ✅ tested | 36/36 |
| qb-core client scripts in the Lua-in-JS runtime | ✅ tested (in-sandbox) | part of 36/36 |
| Same stack on the real alt:V client (rendering, natives, NUI, network) | ⬜ **not tested** | needs this Windows run — §7 checklist |
| Performance under real load | ⬜ not tested | benchmark §7 item 7 |

## 5. If something breaks

- **Client downloads but black screen:** check F8 console for `fivem-client` boot
  errors; confirm `fivem-client` is in `server.cfg` resources.
- **`warn-once missing native X` spam:** the natives module mapping needs an
  override — note the native names, they map 1:1 to §7 item 2.
- **No DB rows appearing:** check `mysql.json` (wrong port is the #1 cause), then
  `SELECT * FROM fivem.players;`.
- **Events one-way:** the `__fivem:net` bridge depends on the js-module adapter —
  see `docs/CLIENT_COMPATIBILITY.md` §8 for the exact wiring that is already green
  in-sandbox.
- **Selftest says FAIL on a specific check:** that check name maps 1:1 to a
  subsystem — send the whole `[nsm-selftest]` console block, not just the line.

Report back the F8 console output + the §7 checklist results and the fixes go into
the next iteration.

---

## UPDATE 2026-10-12 (`01ed635`) — the FiveM-style launcher flow is real

New since the text above was written:

- **Server list is live.** The `nsm-masterlist` resource runs with your game
  server and feeds the NSM.exe browser: your server is always listed with a
  live player count (name/description/language/tags come from `server/.cfg`).
- **Steam presence works** (verified on a real Windows machine): open
  `client-new\NSM.exe` with Steam running → status shows
  **Playing Source SDK Base 2007**, exactly like FiveM. Requirements: the free
  218 license on the account (check Library → Tools; no install needed).
  Mechanism: `discord_rpc.dll` wrapper (source: `nsm-steam-presence-source.c`)
  initializes Steamworks inside the client process and forwards Discord
  RPC untouched.

**Current click-path (single machine):**

1. `server\SETUP-DB.bat` once (MariaDB), fill `server\mysql.json`
2. `server\START-SERVER.bat` → wait for `[nsm-masterlist] server list is LIVE`
3. Open `client-new\NSM.exe` → Steam status flips on → browser home appears
4. Your server is in the list → click it → CONNECTING overlay → in game
5. Leave the game → back on the browser list

Rename your server via `name = '...'` at the top of `server/.cfg` (also shown
in the list). Friends on other PCs: point them at your IP, port 7788 open.
