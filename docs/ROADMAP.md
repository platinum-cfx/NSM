# NSM Roadmap — status against the 9-prompt development plan

> Updated 2026-10-11, after commits `5596192` (audit docs), `6af03b7` (v3
> runtime), `ef97f96` (doc sync), `0c387bd` (security + build/docs pass).
> Statuses distinguish **tested** (suites exist and pass) from **shipped**
> (committed, verified by suites) from **open**.

## Prompt-by-prompt status

### Prompt 1 — Repository audit ✅ DONE
- `docs/ARCHITECTURE.md`, `docs/REPOSITORY_AUDIT.md` (with implementation
  matrix + S1–S14 security findings, all file:line evidenced),
  `docs/RUNTIME_DECISION.md` (Option A: keep alt:V; evidence-based).
- All three audit claims verified in source before any change.

### Prompt 2 — Foundation, security, reproducible builds ✅ DONE (Node side)
- Security: S1–S4, S6, S9–S12 + defaults-vs-docs fixed with 46 regression
  checks (22 masterlist + 24 website), all passing (`docs/SECURITY.md`).
- Reproducibility: website `package-lock.json` confirmed committed,
  `.gitignore` excludes masterlist runtime data, CI workflow added (all
  suites + real-framework gates), `docs/BUILDING.md` verified commands.
- Reliability: `.cfg` inline-`#` truncation bug fixed in wrapper source
  (**not compile-tested** — Windows/MSVC only; flagged for rebuild).
- **Open**: S5 (token-verify proxy hardening — needs Windows C++ rebuild),
  S7/S8 (presence/report spoofing — protocol change in launcher/wrapper),
  S14 (`debug = true` in shipped server.toml — flip before public package).

### Prompt 3 — Resource pipeline ✅ DELIVERED
- Discovery (`[category]` folders), controlled manifest parsing (sandboxed
  env with unknown-directive diagnostics), dependency graph + cycle
  detection + deterministic order, per-resource env isolation, error
  isolation with resource-attributed traces, live exports, commands,
  logging that distinguishes loaded/failed scripts.
- Lifecycle (this unit): `stopResource`/`startResource`/`restartResource`
  with full cleanup (event handlers, commands, state handlers, exports,
  pending timers, coroutine kill-switch), `onResourceStart`/`onResourceStop`
  semantics, status tracking (`running` / `failed` — failed resources fire no
  `onResourceStart` and are fully cleaned up), fail-fast on first script
  error with `res restart <name>` hint, missing-script / missing-`@import`
  now fail the resource, Lua-facing `GetResourceState` in FiveM vocabulary
  (`started`/`starting`/`stopped`/`missing`), `res list|status|stop|start|
  restart` command (console or `isAdmin(src)` only). 102/102 incl. 33
  lifecycle checks; qb-core load + 62/62 transform + 17/17 live-exports
  gates re-run green after the change.
- Deferred to the compatibility-matrix unit: `COMPATIBILITY_MATRIX.md`,
  `LUA_RUNTIME.md`, `RESOURCE_DEVELOPMENT.md` (now scoped to include the
  client-side matrix — see Prompt 4).

### Prompt 4 — Client-side execution 🔶 ACTIVE (re-scoped by owner directive)
- Owner directive (2026-10): the primary goal is running the existing custom
  FiveM QBCore server — including its **client-side Lua resources** — on
  NSM. Do not silently abandon client-side compatibility. Investigate the
  blocker in depth, enumerate exactly which FiveM client APIs / GTA natives
  the alt:V client can support, present architectural options with real
  limitations, and implement the most suitable viable approach.
- Facts that still hold: the GTAMP client is the alt:V client — it embeds no
  CFX Lua VM and no FiveM NUI sandbox. The earlier "blocked by design"
  conclusion only ruled out the *FiveM client binary*; an **alternative
  runtime** (FiveM-compatible Lua VM + API shim hosted in an alt:V
  client-side JS resource) is technically plausible and is now the
  investigation subject. Escrowed (encrypted) FiveM client scripts remain
  impossible for any approach — they only decrypt inside the FiveM client.
- Evidence rules: no compatibility claims beyond what integration tests
  demonstrate; client-side, DB-persistence and multiplayer behavior must be
  shown with real tests wherever this environment permits, and the rest
  explicitly labeled as unverified.

### Prompt 5 — Events / players / entities / API registry 🔶 PARTIAL
- Events (local/net/lifecycle, source semantics): implemented + tested.
- Entities: vehicle slice implemented + tested (create/delete/coords/heading/
  plate); peds/objects/network-id mapping largely stubs or missing.
- API registry doc (`COMPATIBILITY_MATRIX.md` with per-API inventory): not
  written yet — the runtime has the data (stubs warn once by name), the doc
  needs generating.

### Prompt 6 — QBCore 🔶 CORE LOADS; BEHAVIOR UNTESTED
- qb-core (12 shared + 7 server scripts) loads with zero errors; live
  `GetCoreObject()` works across resources (17/17 acceptance checks).
- Not yet done: pinned commit, player lifecycle with real DB, jobs/money/
  inventory behavior tests, `docs/QBCORE_COMPATIBILITY.md`.

### Prompt 7 — ESX 🔶 CORE LOADS; BEHAVIOR UNTESTED
- esx_lib + es_extended (27 scripts) load clean; live `getSharedObject()`
  verified; dependency ordering (esx_lib before es_extended) fixed and tested.
- Not yet done: pinned commit, `xPlayer` behavior with real DB,
  `docs/ESX_COMPATIBILITY.md`. (Note: es_extended hard-errors if it detects
  qb-core in the same server — upstream guard; test frameworks separately.)

### Prompt 8 — DB / NUI / common deps / voice 🔶 EARLY
- MySQL API implemented (callback + await + oxmysql-style callables) and
  tested against a mock; real-DB pool behavior untested; no transactions.
- NUI: not started (client-runtime dependent, see Prompt 4 note).
- Common deps (ox_lib etc.): not started; priority list to be derived from
  framework dependency graphs.
- Voice: client config exists (`.config [voice]`); nothing tested.

### Prompt 9 — Final audit / release readiness ⬜ NOT STARTED

## Next concrete tasks (priority order)

1. **Client-side compatibility investigation + alternative runtime**
   (Prompt 4, owner directive): inventory the FiveM client API surface
   against alt:V client capabilities (natives bridge, events, NUI/CEF,
   keybinds, statebags, voice), write `docs/CLIENT_COMPATIBILITY.md` with
   the option analysis, implement the chosen runtime (Lua VM in a
   client-side JS resource) with a Node-side mock harness, and demonstrate
   with honest labels what can/cannot be verified without a real client.
2. **`COMPATIBILITY_MATRIX.md` + `LUA_RUNTIME.md` + `RESOURCE_DEVELOPMENT.md`**
   (now including the client-side matrix from unit 1).
3. **DB integration environment**: real MariaDB (dockerized or native) +
   schema from esx-legacy `[SQL]`, run framework SQL flows for real (player
   load/save round-trip = persistence evidence); then write
   `QBCORE_COMPATIBILITY.md` / `ESX_COMPATIBILITY.md` with pinned commits.
   Multiplayer behavior: simulated multi-player event/state tests through
   the real runtime (real GTA clients cannot run in this sandbox).
4. **Wrapper rebuild checklist for the Windows machine**: bind 7799/7899 to
   loopback (S5), compile-verify the `.cfg` fix, flip `debug = false` (S14).
5. **Presence/report protocol (S7/S8)**: sign presence with the server key;
   tie website reports to announced servers.
