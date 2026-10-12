# NSM Testing Procedures

> Updated 2026-10-11 (after commits `6af03b7` v3 runtime, `0c387bd` security).
> Every "automated" result below was actually executed in this cycle; counts
> are real. Anything not executed is listed under NOT RUN with the reason.

## Automated suites (all plain Node ≥ 18, no game needed)

| Suite | Command (cwd) | Result | Covers |
|---|---|---|---|
| cfx-compat unit/integration | `node test/run-tests.js` (server/resources/fivem-compat) | **102/102** | manifest parsing, shared+server scripts, events (local/net/lifecycle), commands, `source` semantics, threads/Wait, JSON round-trip, convars, joaat, MySQL (mock), entity natives, statebags, promises/Await, HTTP (mock), 6423 native stubs, one-VM env isolation, per-env `load()`, live exports (functions/identity/mutations/source), manifest diagnostics, dependency ordering + cycle handling, resource lifecycle (stop/start/restart cleanup, `onResourceStart`/`onResourceStop`, failed-status semantics, `GetResourceState` FiveM vocabulary, `res` command interface, fail-fast + missing-script/`@import` failure) |
| fivem-client runtime (2 VMs + NUI shim) | `node test/client-runtime.test.mjs` (server/resources/fivem-compat) | **70/70** | client-side FiveM API hosted in an alt:V client JS resource: real manifest→transform→payload pipeline (Part A); threads/Wait, natives marshalling (vector3 + multireturn + warn-once missing), net events both directions, statebags, commands + key mapping, NUI messages/callbacks/focus incl. the in-page fetch shim (Part B, run on fengari — the VM that ships — and wasmoon for cross-validation; Part C shim unit tests). Game-facing behavior (rendering, streaming, real natives) is on the on-device checklist in CLIENT_COMPATIBILITY.md §7 |
| multiplayer integration (2 clients + real server + real DB) | `node test/multiplayer.test.mjs` (server/resources/fivem-compat; needs MariaDB on :3307 — `bash tools/setup-db.sh`) | **36/36** | boots the REAL server (`index.js` main) with real MariaDB, real qb-core + mp-demo resources, then connects TWO full fengari client runtimes through the real transport: join handshakes (server ids 1 and 7), qb-core Login for both players (real rows in MariaDB: license from alt identifiers, money JSON, AddMoney/SetJob), UpdateClient envelopes, targeted vs broadcast net events (no leak to the non-target), client→server ping recorded in DB with source identity, qb-core client flow (OnPlayerLoaded → `isLoggedIn` statebag), replicated client statebag writes visible to the other player AND the authoritative server store, server statebag writes to both players, client ExecuteCommand → server command, playerDropped → money/job saved to MariaDB (cash=3000, job=trucker), reconnect (handshake again, existing character loaded by citizenid, money survives a real DB round-trip), player 2 unaffected throughout, ALL qb-core + mp-demo client scripts loaded in both client runtimes, full client boot, no unexpected client errors |
| DB persistence integration | `node test/db-integration.test.mjs` (same preconditions) | **20/20** | (1) the oxmysql Lua API surface against REAL MariaDB: named `:` and positional `?` params, `prepare.await` row + single-column unwrap, `scalar`, `single`, `execute.await` affectedRows/insertId (oxmysql `parseResponse` semantics), transaction commit, failing transaction → real ROLLBACK verified in-DB + `cb(false)`, `MySQL.Async.*` callback form, SQL errors raise in Lua (no fake results); (2) qb-core player persistence across a FULL RUNTIME RESTART: runtime A logs in, earns money, gets a job, saves (no graceful shutdown); a brand-new runtime B with a fresh qb-core instance loads the same character from MariaDB and sees the persisted money AND job |
| qb-core CLIENT behavior | `node test/qbcore-client.test.mjs` (needs MariaDB) | **19/19** | qb-core's REAL client scripts behave, not just load: Login → `QBCore:Client:OnPlayerUpdated` → client-side `QBCore.PlayerData` applied + `'QBCore:Player:SetPlayerData'` local event re-fired; AddMoney/SetJob reflected in client PlayerData; qb-core's own `'QBCore:Client:OnJobUpdate'` fires; `QBCore.Functions.TriggerCallback` BOTH forms (promise + `Citizen.Await`, and callback) round-trip to a real server `CreateCallback`; `QBCore.Functions.Notify` → SendNUIMessage. Requires client prelude `promise`/`Citizen.Await` (same contract as the server prelude) |
| on-device selftest resource (in-sandbox run) | `node test/selftest.test.mjs` (needs MariaDB) | **11/11** | `fivem_resources/nsm-selftest` — the resource the owner runs on the real Windows client — is itself verified here against a real server + fengari client + a page-running webview stub that executes the REAL injected NUI shim and the REAL page script, so the NUI round-trip (page fetch → Lua `RegisterNUICallback` → page response) is exercised end-to-end. Report must arrive server-side with 0 failed, 0 skipped, all 12 checks present |
| qb-core fork-syntax compile gate | `node tools/lua-fork-transform.test.mjs` | **62/62** (with qb-core clone) | every qb-core `.lua` file compiles after the backtick/`?.`/`+=` transform |
| real framework load | `node tools/load-real.mjs qb-core` and `... "esx-legacy/[core]/esx_lib,esx-legacy/[core]/es_extended"` | **both LOADED OK** | complete server-side code of qb-core (12 shared + 7 server scripts) and esx_lib+es_extended (27 scripts) execute with zero errors |
| live exports acceptance | `node tools/live-exports-check.mjs` | **17/17** (with clones) | `exports['qb-core']:GetCoreObject()` / `getSharedObject()` return live tables: functions callable, identity preserved, cross-resource mutations, `source` propagation, dependency/@import ordering, single-VM proof |
| masterlist security regression | `node test-security.js` (masterlist) | **22/22** | strict announce default, key minting authz, both delete paths (anonymous/foreign-key/admin/owner-key), upvote dedup, XFF spoofing, config defaults vs docs |
| website security regression | `node test-security.js` (website, after `npm ci`) | **24/24** | both deletion backdoors removed, admin key, login/register regression, badge-escalation blocked, avatar authz, CORS (with and without allowlist), session-secret warning |

CI (`.github/workflows/ci.yml`) runs all six suites on every push to `main`
and on pull requests, including clones of qb-core/esx-legacy for the
framework gates (currently upstream HEAD; pinning comes with the framework
milestones).

### Gated suites note
`lua-fork-transform.test.mjs` and `live-exports-check.mjs` **skip with an
explanation** when `real_resources/` has no framework clones — they print the
exact `git clone` commands to enable them. A skip exits 0 so bare checkouts
stay green; CI clones the frameworks explicitly.

## NOT RUN (and why) — honest gaps

- **Real game client end-to-end** (launcher → alt:V client → server): requires
  GTA V + Windows + the GTAMP client. Not executable in this sandbox. Manual
  checklist for the server owner: launch `NSM.exe`, pick the server from the
  browser, confirm spawn at Legion Square (gtamp-online), F8/chat command
  round-trip, vMenu vehicle spawn.
- **Client-side FiveM Lua / NUI — in-sandbox covered, on-device pending**:
  the alternative client runtime (see `CLIENT_COMPATIBILITY.md`) passes
  70/70 client-runtime checks AND the full 36/36 multiplayer integration
  (real qb-core + mp-demo client scripts executing in two client VMs through
  the real transport). NOT yet verified: the same runtime on the actual
  alt:V/GTAMP client on Windows (natives module, webview, real network).
- **Real MariaDB/MySQL — now covered**: the two integration suites above run
  against a real MariaDB (mysql2 on :3307) with real framework SQL flows
  (qb-core player save/load, transactions with verified ROLLBACK). Remaining
  gap: long-run pool behavior (connection limits, timeouts) — not tested.
- **Windows builds**: wrapper (`server.cpp`), launcher (`connect.cpp`), and
  pkg packaging (`masterlist.exe`, `NSMwebsite.exe`) are not compiled in this
  sandbox. The `.cfg` `#`-comment fix (2026-10-11) is source-only and must be
  compile-verified on Windows.
- **Multi-client behavior — simulated level covered** (two full client
  runtimes through the real server transport, 36/36). NOT run: real GTA
  clients (rendering, entity sync, voice) — requires the Windows host.
- **Load/performance**: no benchmarks yet (Phase 16 of the master plan).

## Conventions

- Suites are self-contained Node scripts (no framework), print `PASS:/FAIL:`
  lines, and exit non-zero on any failure — CI-friendly and grep-able.
- The mock alt:V transport (test/mock-alt-server.js) delivers NET events
  asynchronously (queueMicrotask) — matching real alt:V/FiveM network hops —
  while LOCAL events stay synchronous (also FiveM semantics). qb-core's
  `TriggerCallback` depends on this ordering; don't "simplify" it back.
- Security suites boot the real servers as child processes on random free
  ports with temp `DATA_DIR`s and drive them over real HTTP.
- New fixes require a regression check in the matching suite before the
  milestone is called done (rule applied in `0c387bd`: 46 new checks).

---

## UPDATE 2026-10-12 (`01ed635`) — current status and what is still owed

**Suite counts as of the ESX work** (all in-sandbox, Node ≥ 18): server
**116/116**, client runtime **70/70** (+1 runtime meta-test), multiplayer
**36/36**, db **20/20**, qbcore client **19/19**, selftest **11/11**,
transform **62/62**, live-exports **17/17**, esx-client **15/26** (the 11
failures are mock-environment causes documented in the run output: fengari
integer error in es_extended compat.lua, mock-only missing natives, server
`esx-probe:double` callbacks not found, no users-row join flow, ESX.PlayerLoaded
never true). **None of these suites run a real GTA V client** — they are
mock-transport/VM tests and are labeled as such.

**New real (non-mock) verifications:**

- `nsm-masterlist` live HTTP test (in-sandbox, real Node http server + curl):
  `/servers` correct JSON + CORS + live player count from the real
  `server/.cfg` values; `/api/launcher/ping`, `/api/player/leave`,
  `POST /announce` merge all verified.
- **Steam presence verified on a real Windows machine with real Steam**
  (2026-10-12, user-confirmed): NSM.exe → status "Playing Source SDK Base
  2007" via AppID 218.

**Still owed — the Windows acceptance run** (cannot be executed in this
environment; needs a Windows PC with GTA V):

1. `START-SERVER.bat` → note the `[nsm-masterlist]` line
2. Open `client-new\NSM.exe` → confirm the server appears in the list
3. Click it → confirm the CONNECTING overlay → the game launches → you spawn
4. Copy the **server console connect lines** (incl. any
   `fivem-client ready: player N`) into the report
5. Note any `[fivem-client]` lines/errors from the client side

Until items 2–5 pass on real hardware, the launcher→game flow is
"implemented and source-audited", **not proven**.

## UPDATE 2026-10-12 (later)

The `nsm-masterlist` server resource referenced above was removed — it
duplicated the in-repo `masterlist/` component (`masterlist.exe` +
`server.js`, key-based announce model) that predates it. The live HTTP test
results (endpoints, CORS, JSON shape) were produced against that now-removed
resource; the launcher's contract it verified (`/servers`,
`/api/launcher/ping`, `/api/player/leave`) matches the endpoints the real
masterlist/ implements for the same launcher.

## UPDATE 2026-10-12 (later) — single-window build status

The in-window presentation (Win32 re-parent in the discord_rpc.dll wrapper)
and the F8 `disconnect` command are implemented and compiled clean, but were
built WITHOUT access to a Windows machine: they are NOT verified. The
acceptance checklist in docs/SINGLE_WINDOW_EXPERIENCE.md is the required
real-machine test. The wrapper's Steam-presence half remains
Windows-verified (AppID 218).
