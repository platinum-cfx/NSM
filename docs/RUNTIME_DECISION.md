# Runtime Decision — Option A: keep alt:V as the game runtime

> Decision date: 2026-10-11. Status: **decided**, evidence recorded below.
> This document exists so the decision is never re-litigated without new evidence.

## Decision

NSM keeps the **alt:V server binary** (16.4.39 / c150769, launched by the C++ wrapper)
as the game runtime, and implements FiveM compatibility as a **resource-level layer**
(`server/resources/fivem-compat`) on top of it. Rejected alternatives are in §3.

## Why (tested evidence, not opinion)

1. **The compat layer already loads the two major FiveM frameworks on the real alt:V
   runtime, with zero errors** (verified at `a82d23e`):
   - qb-core: 12 shared + 7 server scripts, zero errors.
   - esx_lib + es_extended: 27 scripts, zero errors (after two runtime fixes that are
     now part of the layer: the wasmoon `load()` env-forwarding fix, and the
     `__transformLua` bridge so framework-provided `require`/loaders also receive the
     FiveM-fork-syntax transform).
   - Reproduce: `node tools/load-real.mjs "<comma-separated [core] dirs in dep order>"`
     in the dev workspace.
2. **The whole NSM stack is built around the alt:V runtime**: the wrapper embeds
   `altv-server.exe` (RCDATA 101) and launches it via RunPE; the client is the real
   alt:V client launched with `-connecturl altv://connect/…` (`sources/cpp/connect.cpp:974`);
   resources other than the compat layer (gtamp-online, vmenu) are alt:V-native JS.
   Swapping the runtime means rewriting wrapper + launcher + native resources.
3. **The FiveM (FXServer) route was evaluated and rejected by the project owner** —
   including any packaging/hosting of real FXServer artifacts. That decision stands.

## Standing constraints that shaped this decision

- **Client-side FiveM Lua will never run on the GTAMP client.** The client is the
  alt:V client; there is no CFX Lua VM, no `citizen:lua` client runtime, and no NUI
  sandbox there. Server-side compat is the entire surface. (Answered consistently
  three times; do not revisit.)
- vMenu's client side is **C# / alt:V-native**, not FiveM's vMenu — the repo's
  `server/resources/vmenu/index.js` is the complete server half.
- Sandbox network policy blocks the alt:V CDN, so server/module binaries must be
  fetched on the user's machine (`fix-jsmodule.ps1`); this does not affect the
  architectural choice.

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| **Option B — host real FXServer** | Project owner explicitly rejected the FXServer/kit/zip direction (“not this mess”). Also discards all working alt:V-native resources. |
| **Option C — write a custom game server** | Months of work to reach parity with entity sync/streaming that alt:V already provides; no compatibility benefit. |
| **Option D — client-side Lua on GTAMP client** | Impossible: alt:V client has no Lua VM. See constraints above. |

## Consequences — the actual work plan (runtime track)

The decision commits us to finishing the compat layer to real interop parity, in this
order (items 1–3 are DONE and shipped as `6af03b7`; evidence inline):

### 1. Single-VM runtime + live exports — SHIPPED (v3, `6af03b7`)

Frozen design (keep; it is what gets implemented):
- **One** wasmoon engine for the whole server, created once.
- FiveM prelude installed into `_G` once (Citizen, event bus, natives, statebag proxies).
- Each resource gets its own **environment table** with `setmetatable({}, {__index = _G})`
  — sandboxing without duplicating the VM.
- Resource scripts run via `load(code, name, 't', env)` with the per-resource env —
  and the env is passed **explicitly**, never nil (wasmoon quirk: a nil env arg yields
  a nil `_ENV`; we already hit and fixed this for ESX's loader in v2.1).
- Per-env directive/event/exports functions close over the resource name:
  `__exportsRegistry[res][name] = fn`.
- `exports['other-resource']:method(...)` becomes a **direct live call** into the other
  resource's registered function — so `exports['qb-core']:GetCoreObject()` returns the
  live, current table, not a snapshot or a stub.
- JS-side entry points call into Lua via `__dispatch*` functions on the same engine.
- Known wasmoon/JS bridging constraints carried over from v2.1: JS `null` cannot be
  pushed as Lua `nil` (bridges convert to `false`); promises are tables tagged
  `__nsmPromise`; scheduler uses `__cfx_await__` + `__asyncResume`.

### 2. Dependency-ordered loading — SHIPPED (v3, `6af03b7`)

`loadAll()` builds the order from manifest `dependencies` + `@resource/` imports
(verified: esx_lib before es_extended, consumer-after-framework, wrong listing
order auto-corrected; cycles reported then broken by listed order). Details kept
for the design record: `@`-import targets (e.g.
`@oxmysql/lib/MySQL.lua`) load before dependents; framework cores before their plugins.
Today's alphabetical order loads `es_extended` before `esx_lib`, which only worked in
testing because we manually ordered the directory list. The loader must: build the
dependency graph from fxmanifest `dependencies` + `@`-imports, detect cycles, and emit
clear errors.

### 3. Manifest diagnostics — SHIPPED (v3, `6af03b7`)

Unsupported fxmanifest directives now produce explicit, actionable diagnostics
(current behavior: silent no-op — fails the acceptance criteria for the compat layer).
No fake success returns: a directive the layer does not implement must say so at load
time, not pretend it worked.

### 4. Now in progress

Security fixes from `REPOSITORY_AUDIT.md` §5 (masterlist + website, with regression
tests), then resource lifecycle (stop/restart + cleanup), oxmysql→DB bridge, and
NUI-adjacent features (server-driven).

## What would force a re-decision

Only new evidence of the form: alt:V server binary becomes unavailable/redistributable
in a way that breaks the wrapper, or the compat layer proves unable to reach
acceptable fidelity on a **core server-side API that frameworks depend on** (not
client-side — that is excluded by the standing constraint above). Neither has occurred.
