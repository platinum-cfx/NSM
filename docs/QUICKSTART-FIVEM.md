# Quickstart — run the ESX stack on your server (Windows)

This is the fastest path from a fresh clone to a working FiveM-style ESX server
running on the NSM/GTAMP server binaries.

## What runs where

```
gtamp-server.exe / altv-server.exe
  └─ js-module.dll (Node) loads .cfg resources:
       ├─ fivem-compat    ← FiveM compat layer (server side, one Lua 5.4 VM)
       │    └─ loads server/fivem_resources/[core]/{es_extended,esx_lib,skinchanger}
       │                      + [standalone]/oxmysql
       ├─ fivem-client     ← client half (fengari Lua VM) served to players
       └─ vmenu            ← native alt:V menu (unchanged)
```

`fivem-compat` talks to `fivem-client` over `__fivem:*` events; players' alt:V
clients run the FiveM client scripts (jobs, money, skin, NUI pages).

## Steps

1. **Match the js-module to the server exe** (once):
   ```powershell
   cd server
   powershell -ExecutionPolicy Bypass -File fix-jsmodule.ps1
   ```
   This downloads the official js-module built for the server's SDK and
   verifies it against alt:V's published checksums.

2. **MariaDB / MySQL**: install it, then create the DB and import the ESX schema:
   ```powershell
   mysql -u root -p -e "CREATE DATABASE fivem"
   mysql -u root -p fivem < "resource_store\esx-legacy\[SQL]\legacy.sql"
   ```

3. **Credentials**: copy `mysql.json.example` to `mysql.json` (next to
   `gtamp-server.exe`) and fill in host/user/password/database.

4. **Start the server**: run `gtamp-server.exe` (or `altv-server.exe`).
   You should see lines like:
   ```
   [cfx-compat] FiveM resource 'oxmysql' started
   [cfx-compat] FiveM resource 'esx_lib' started
   [cfx-compat] FiveM resource 'es_extended' started
   ...
   ```

5. **Connect**: with the GTAMP launcher (`connect.exe` → server browser → your
   server, or direct `altv://connect/ip:port`). The client downloads the
   fivem-client payload automatically; ESX player data loads on join
   (job = unemployed, money in the `users` table, skin via skinchanger).

## Verify it works

- `/students` of the DB: `SELECT identifier, firstname, lastname, job, money, accounts FROM users;`
  — your player appears after joining once.
- Server console: `esx:playerLoaded` style logs, no red errors from es_extended.
- Client console (F8-ish via launcher): no `script failed` lines from es_extended.

## Swapping frameworks

- **QBCore instead of ESX**: copy `resource_store/qb-core` into
  `server/fivem_resources/[core]/`, remove (or move out) `es_extended`,
  `esx_lib`, `skinchanger`, and restart. Never run both at once — they both
  own the player lifecycle.
- **More ESX resources** (menus, identity, multicharacter, …): copy from
  `resource_store/esx-legacy/[core]/` into `server/fivem_resources/[core]/`.
  The tested boot set is the four defaults; extra resources are best-effort.

## Notes / current limits (honest)

- Server-side ESX (join flow, DB persistence, jobs, money, callbacks) is
  covered by automated tests against real MariaDB (`node test/run-tests.js`
  in `server/resources/fivem-compat`).
- Client-side ESX runs the real client scripts in a Lua VM on the alt:V
  client; the automated harness covers most of the join flow. The parts that
  need a real GTA V client (rendering, streaming, actual ped/vehicle natives)
  can only be verified on a real machine — expect the first real-client run
  to surface native gaps; report them and they get stubbed.
- Migrations persist in `server/fivem-compat-kvp.json` (delete it to re-run).
