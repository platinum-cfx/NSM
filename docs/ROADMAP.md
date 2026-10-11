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

### Prompt 4 — Client-side execution 🔶 ALTERNATIVE RUNTIME IMPLEMENTED (in-sandbox)
- Owner directive (2026-10): primary goal = run the existing custom FiveM
  QBCore server — including **client-side Lua resources** — on NSM; do not
  silently abandon client-side compatibility.
- **Investigation done** → `docs/CLIENT_COMPATIBILITY.md`: full API matrix
  (what the alt:V client provides vs what FiveM client scripts need),
  six architectural options with limitations, decision = **Option B**:
  a FiveM-compatible Lua VM hosted in a generated alt:V client JS resource
  (`resources/fivem-client/`), built by `tools/build-client-bundle.mjs` from
  the same server pipeline (manifest parse + fork transform) that runs the
  server side.
- Implemented: client prelude (Lua), VM-agnostic JS core, fengari adapter
  (pure-JS Lua 5.3 — the baseline that runs in any JS sandbox) + wasmoon
  adapter (Lua 5.4/WASM — cross-validation + upgrade path), NUI page shim
  injected at build time, keybind map, statebag/state channels, native name
  normalization + vector/multireturn marshalling.
- Evidence: **client-runtime suite 70/70** (both VMs; real server pipeline
  with mock game/transport); server suite 102/102, transform 62/62,
  live-exports 17/17, qb-core load — all green after the changes.
- Honest status: **verified in-sandbox end-to-end at the logic level,
  including two-client multiplayer through the real transport (36/36)**.
  On-device checklist
  (§7 of the doc): natives module resolution, WASM availability, webview
  rendering/focus, keybind path, real event transport, perf benchmark,
  (natives module resolution, WASM availability, webview rendering/focus,
  keybind path, real event transport, perf benchmark). qb-core's real
  client scripts ARE verified in-sandbox (all load + the OnPlayerLoaded /
  isLoggedIn flow in the multiplayer suite). Remaining build-outs: server→client event
  wiring on the real js-module adapter, voice replacement (pma-voice),
  networked-entity broker, dlc conversion tooling, KVP persistence.
- Still impossible (any approach): escrowed client scripts; DUI; FiveM
  loading-screen API.

### Prompt 5 — Events / players / entities / API registry 🔶 PARTIAL
- Events (local/net/lifecycle, source semantics): implemented + tested.
- Entities: vehicle slice implemented + tested (create/delete/coords/heading/
  plate); peds/objects/network-id mapping largely stubs or missing.
- API registry doc (`COMPATIBILITY_MATRIX.md` with per-API inventory): not
  written yet — the runtime has the data (stubs warn once by name), the doc
  needs generating.

### Prompt 6 — QBCore 🔶 SERVER+CLIENT BEHAVIOR TESTED (REAL DB); DOCS PENDING
- qb-core (12 shared + 7 server scripts) loads with zero errors; live
  `GetCoreObject()` works across resources (17/17 acceptance checks).
- NEW (2026-10-11): full player lifecycle on REAL MariaDB — Login creates
  the row (license from alt identifiers), AddMoney/SetJob persist, Save on
  disconnect writes money+job, reconnect loads the existing character,
  money survives a FULL RUNTIME RESTART (db-integration 20/20). Client
  side: all qb-core client scripts execute in the fengari client runtime;
  the OnPlayerLoaded → isLoggedIn statebag flow works over the real
  transport (multiplayer 36/36).
- NEW (2026-10-11, round 2): qb-core CLIENT behavior verified 19/19 —
  PlayerData sync applied client-side (Login/AddMoney/SetJob), qb-core's own
  OnJobUpdate/SetPlayerData local events, TriggerCallback both forms against
  real server CreateCallbacks, Notify. On-device selftest resource built and
  verified in-sandbox (11/11 incl. full NUI cycle).
- Not yet done: pinned commit, inventory/gang/tuner behavior, multichar,
  `docs/QBCORE_COMPATIBILITY.md`.

### Prompt 7 — ESX 🔶 CORE LOADS; BEHAVIOR UNTESTED
- esx_lib + es_extended (27 scripts) load clean; live `getSharedObject()`
  verified; dependency ordering (esx_lib before es_extended) fixed and tested.
- Not yet done: pinned commit, `xPlayer` behavior with real DB,
  `docs/ESX_COMPATIBILITY.md`. (Note: es_extended hard-errors if it detects
  qb-core in the same server — upstream guard; test frameworks separately.)

### Prompt 8 — DB / NUI / common deps / voice 🔶 EARLY
- MySQL API implemented (callback + await + oxmysql-style callables).
  NEW: verified against REAL MariaDB (db-integration 20/20) — named and
  positional params, prepare/scalar/single/execute semantics
  (affectedRows/insertId), transactions incl. verified ROLLBACK and
  cb(false) on failure, SQL errors raise in Lua, await works inside MySQL
  callbacks. Long-run pool behavior (limits/timeouts) still untested.
- NUI: not started (client-runtime dependent, see Prompt 4 note).
- Common deps (ox_lib etc.): not started; priority list to be derived from
  framework dependency graphs.
- Voice: client config exists (`.config [voice]`); nothing tested.

### Prompt 9 — Final audit / release readiness ⬜ NOT STARTED

## Next concrete tasks (priority order)

1. **Client runtime on-device verification + server wiring** (Prompt 4
   continuation — needs the owner's Windows machine): run the §7 checklist on the Windows GTAMP host; wire
   `TriggerClientEvent` → `alt.emitClient('__fivem:net', ...)` +
   statebag pushes on the real js-module adapter; benchmark fengari vs
   wasmoon in a `Wait(0)` loop. (In-sandbox: qb-core's real client scripts already run —
   multiplayer suite 36/36.) Produce the exact Windows commands/config for
   NSM + friends (owner's step 6).
2. **`COMPATIBILITY_MATRIX.md` + `LUA_RUNTIME.md` + `RESOURCE_DEVELOPMENT.md`**
   (now including the client-side matrix from unit 1).
3. **Compatibility docs**: `QBCORE_COMPATIBILITY.md` /
   `ESX_COMPATIBILITY.md` with pinned commits (the DB + multiplayer
   evidence they cite now exists — see TESTING.md). esx-legacy `[SQL]`
   schema import for ESX DB flows.
4. **Wrapper rebuild checklist for the Windows machine**: bind 7799/7899 to
   loopback (S5), compile-verify the `.cfg` fix, flip `debug = false` (S14).
5. **Presence/report protocol (S7/S8)**: sign presence with the server key;
   tie website reports to announced servers.
