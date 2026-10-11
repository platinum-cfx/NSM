# NSM Testing Procedures

> Updated 2026-10-11 (after commits `6af03b7` v3 runtime, `0c387bd` security).
> Every "automated" result below was actually executed in this cycle; counts
> are real. Anything not executed is listed under NOT RUN with the reason.

## Automated suites (all plain Node ≥ 18, no game needed)

| Suite | Command (cwd) | Result | Covers |
|---|---|---|---|
| cfx-compat unit/integration | `node test/run-tests.js` (server/resources/fivem-compat) | **102/102** | manifest parsing, shared+server scripts, events (local/net/lifecycle), commands, `source` semantics, threads/Wait, JSON round-trip, convars, joaat, MySQL (mock), entity natives, statebags, promises/Await, HTTP (mock), 6423 native stubs, one-VM env isolation, per-env `load()`, live exports (functions/identity/mutations/source), manifest diagnostics, dependency ordering + cycle handling, resource lifecycle (stop/start/restart cleanup, `onResourceStart`/`onResourceStop`, failed-status semantics, `GetResourceState` FiveM vocabulary, `res` command interface, fail-fast + missing-script/`@import` failure) |
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
- **Client-side FiveM Lua / NUI**: not run and **not possible by design** —
  the GTAMP client is the alt:V client (no CFX Lua VM, no NUI sandbox).
  Standing decision recorded in `RUNTIME_DECISION.md`; do not re-litigate
  without new evidence.
- **Real MariaDB/MySQL**: the MySQL API is tested against an in-memory mock
  only. Pooling, `mysql2` behavior against a real server, and framework SQL
  flows are untested. Needs a DB host (planned: dockerized integration env).
- **Windows builds**: wrapper (`server.cpp`), launcher (`connect.cpp`), and
  pkg packaging (`masterlist.exe`, `NSMwebsite.exe`) are not compiled in this
  sandbox. The `.cfg` `#`-comment fix (2026-10-11) is source-only and must be
  compile-verified on Windows.
- **Multi-client behavior** (two simultaneous players, entity sync, voice):
  requires game clients; not run.
- **Load/performance**: no benchmarks yet (Phase 16 of the master plan).

## Conventions

- Suites are self-contained Node scripts (no framework), print `PASS:/FAIL:`
  lines, and exit non-zero on any failure — CI-friendly and grep-able.
- Security suites boot the real servers as child processes on random free
  ports with temp `DATA_DIR`s and drive them over real HTTP.
- New fixes require a regression check in the matching suite before the
  milestone is called done (rule applied in `0c387bd`: 46 new checks).
