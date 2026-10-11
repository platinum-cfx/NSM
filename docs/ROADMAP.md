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
- Reproducibility: website `package-lock.json` committed (was gitignored!),
  `.gitignore` fixed (masterlist runtime data excluded), CI workflow added
  (all suites + real-framework gates), `docs/BUILDING.md` verified commands.
- Reliability: `.cfg` inline-`#` truncation bug fixed in wrapper source
  (**not compile-tested** — Windows/MSVC only; flagged for rebuild).
- **Open**: S5 (token-verify proxy hardening — needs Windows C++ rebuild),
  S7/S8 (presence/report spoofing — protocol change in launcher/wrapper),
  S14 (`debug = true` in shipped server.toml — flip before public package).

### Prompt 3 — Resource pipeline 🔶 MOSTLY DELIVERED (by v3 runtime)
- Delivered + tested: discovery (`[category]` folders), controlled manifest
  parsing (sandboxed env with unknown-directive diagnostics), dependency
  graph + cycle detection + deterministic order, per-resource env isolation,
  error isolation with resource-attributed traces, live exports, commands,
  logging that distinguishes loaded/failed scripts.
- **Missing** (next implementation unit): stop/restart lifecycle with cleanup
  of handlers/timers/exports/state, `onResourceStart/Stop` events, explicit
  resource status tracking (`running` vs `failed` — currently a resource with
  a failed script still reports loaded), `res list|stop|start|restart`
  command interface, and `docs/COMPATIBILITY_MATRIX.md`,
  `docs/LUA_RUNTIME.md`, `docs/RESOURCE_DEVELOPMENT.md`.

### Prompt 4 — Client-side execution 🛑 BLOCKED BY DESIGN (documented)
- The GTAMP client is the alt:V client: no CFX Lua VM, no NUI sandbox.
  FiveM client-Lua resources cannot execute there — standing decision,
  recorded three times, evidence in `RUNTIME_DECISION.md`.
- What IS possible and not yet built: alt:V-native client JS resources (the
  pattern vmenu's client side already uses) and CEF UI served by the client.
  That is the honest substitute for "client-side compatibility" and belongs
  to the Phase-9/NUI work, not to FiveM-Lua compat.

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

1. **Resource lifecycle (Prompt 3 completion)**: stop/restart with full
   cleanup (handlers, commands, state handlers, exports, pending timers),
   `onResourceStart`/`onResourceStop`, status tracking (`failed` must not
   report as running), `res` command interface, lifecycle tests. Design is
   already compatible with the v3 one-VM architecture.
2. **`COMPATIBILITY_MATRIX.md` + `LUA_RUNTIME.md` + `RESOURCE_DEVELOPMENT.md`**
   (much of the content exists in audit/runtime docs; consolidate).
3. **DB integration environment**: dockerized MariaDB + schema from
   esx-legacy `[SQL]`, run framework SQL flows for real; then write
   `QBCORE_COMPATIBILITY.md` / `ESX_COMPATIBILITY.md` with pinned commits.
4. **Wrapper rebuild checklist for the Windows machine**: bind 7799/7899 to
   loopback (S5), compile-verify the `.cfg` fix, flip `debug = false` (S14).
5. **Presence/report protocol (S7/S8)**: sign presence with the server key;
   tie website reports to announced servers.
