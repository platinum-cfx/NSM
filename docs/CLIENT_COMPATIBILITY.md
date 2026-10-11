# Client-side compatibility: investigation, options, decision

**Status:** alternative runtime IMPLEMENTED and integration-tested in-sandbox (70/70 client-runtime
checks on the shipping VM); on-device verification pending. This document is the Prompt-4
deliverable required by the owner directive (2026-10): *investigate the client-side blocker in
depth, determine exactly what the alt client can and cannot support, present the architectural
options with limitations, implement the most suitable viable approach, and do not claim
compatibility beyond demonstrated evidence.*

---

## 1. Executive summary

**Can existing FiveM client-side Lua resources run on NSM?**

**Yes — with a replaceable runtime and documented gaps — for resources whose client code you own.**
The alt:V client (which is what GTAMP players run) embeds no CFX Lua VM, so FiveM client Lua
cannot run *natively*. But the alt:V client does natively download and execute **client-side
JavaScript resources** with (a) the full GTA V **natives** module, (b) **WebView** (CEF), (c)
client↔server and client↔client **events**, (d) keydown/**Keybind** APIs. That is enough substrate
to host a **FiveM-compatible Lua runtime inside a client-side JS resource**: a Lua VM
(fengari, pure JS — runs in any JS sandbox), a Lua-side prelude implementing the FiveM client
API (threads/`Wait`, events, commands, key mapping, NUI, statebags, convars, exports), a JS
bridge layer, and a build step that transforms each resource's client scripts with the same
FiveM-fork → standard-Lua transformer the server side already uses.

What this is NOT:

- It is **not** "the FiveM client running against NSM" — players join with the alt:V client.
- It **cannot** run **escrowed/encrypted** FiveM client scripts (purchased qb-* resources):
  those only decrypt inside the FiveM client binary. No architecture fixes this.
- It has **not** been verified on a real GTA V client yet (this sandbox has no Windows/GTA):
  everything that touches actual rendering, streaming, and native behavior is on the on-device
  checklist in §7.

---

## 2. Ground truth: what each side provides

### 2.1 What the alt:V client provides (verified)

| Capability | Evidence |
|---|---|
| Client-side JS resources (`client-main` + `client-files` in `resource.toml`), downloaded from the server automatically | alt:V docs "Your first resource"; already exercised on this stack by `server/resources/gtamp-online` (`client.js` uses `alt-client` + `natives`) |
| GTA V natives in client JS: `import * as native from 'natives'` — full native set, lowerCamelCase names (e.g. `native.getGroundZFor3dCoord`, `native.getEntityCoords`) | alt:V docs; community code (alt:V anticheat guide uses exactly these names) |
| Events: `alt.onServer`/`alt.emitServer`, `alt.emitClient`, `alt.on`/`alt.emit` (client↔client), incl. raw variants | alt:V docs "Events" |
| WebView (CEF): `new alt.WebView(url, isOverlay)`, `emit`/`on`, `focus()`/`unfocus()`, per-resource file URLs (`http://resource/...`); webview pages get an `alt` object | alt:V docs "Events → Client to WebView and back" |
| Keybinds: `alt.Utils.Keybind(keyCode, cb, 'keydown')`, plus `keydown`/`keyup` client events | alt:V docs (alt-client API, Utils.Keybind, IClientEvent) |
| Meta sync observable client-side: `streamSyncedMetaChange`, `syncedMetaChange`, `globalMetaChange` events | alt:V client API (IClientEvent) |
| Modded content delivery: `dlc` resource type (vehicles/MLOs/clothes via `stream.toml`, base-file replacement since v15), `asset-pack` for web/file assets | alt:V docs "Resources" |
| Bytecode module (JS bytecode instead of source, protects your own client code) | alt:V roadmap (shipped, "Past") |
| Server stack here: `gtamp-server.exe` (prebuilt alt:V server) + JS module v1 (`modules/js-module`), `debug = true` currently on | repo `server/` |

### 2.2 What FiveM client scripts need (from qb-core core + esx_lib clones, FiveM docs)

- **Language:** CFX Lua 5.4 fork syntax (backtick identifiers, compound assignment `+=`, safe
  navigation `?.` — the last is NOT transformable in general; see §6).
- **Runtime services:** `CreateThread`/`Citizen.Wait`, `Citizen.Await`, `SetTimeout`, net/local
  events (`RegisterNetEvent`/`AddEventHandler`/`TriggerEvent`/`TriggerServerEvent`), client
  `RegisterCommand` + `RegisterKeyMapping`, NUI (`SendNUIMessage`/`SetNuiFocus`/
  `RegisterNUICallback`/`GetParentResourceName`), statebags (`Entity(x).state`,
  `AddStateBagChangeHandler`, `LocalPlayer.state`), convars, resource KVP, cross-resource
  `exports`, `LoadResourceFile`, `IsDuplicityVersion()`.
- **Natives:** ~5,000+ GTA natives client-side (`GetEntityCoords`, `DrawRect`, `TaskGoStraightToCoord`,
  scaleform, streaming, ped/vehicle functions…). qb-core core's own client files use ~60 distinct
  natives; a full qb server's ecosystem uses hundreds.
- **Platform glue outside natives:** NUI pages (`ui_page` + `files`, `fetch('https://res/cb')`,
  `window 'message'` events), Mumble voice API, networked client-created entities, loading-screen
  messages, KVP storage.

---

## 3. Category-by-category compatibility matrix

Legend: ✅ implemented + integration-tested in-sandbox · 🟡 planned/partial (feasible, not yet
built) · 🚫 not supported (no viable path on alt:V client) · ❓ needs on-device verification
(design is done, sandbox cannot exercise it).

| FiveM client API / function class | alt:V mechanism | Status |
|---|---|---|
| `CreateThread`, `Wait`, `Citizen.Wait`, `SetTimeout` | coroutine scheduler in the Lua prelude over alt timers/tick | ✅ (6-tick loop test), ❓ frame-timing fidelity |
| `RegisterNetEvent`/`AddEventHandler`/`TriggerEvent` (local) | Lua-side registry | ✅ |
| `TriggerServerEvent` / server→client events | single multiplexed `__fivem:net` alt event (name + JSON args), bridged by the server-side fivem-compat runtime | ✅ logic; ❓ real transport |
| `TriggerLatentServerEvent` | same channel (no bandwidth hint yet) | ✅ (equiv.) |
| GTA natives (PascalCase, e.g. `GetEntityCoords`, `GetGroundZFor_3dCoord`) | name normalization (underscore-strip, case-insensitive match) → `natives.*` invocation; array results → multiple returns; 3-number results → `vector3` | ✅ marshalling logic (mock natives); ❓ real native behavior/side effects |
| Natives absent from alt:V's module | warn-once + `nil` return (resource keeps running) | ✅ |
| `vector3`/`vector2`/`vector4` (+ arithmetic, `#`, `.x/.y/.z`) | table-based vectors in the prelude | ✅ |
| `RegisterCommand` (client) | local registry + keybind/chat invocation | ✅ |
| `RegisterKeyMapping` (default key strings like `F5`, `E`, `GRAVE`) | FiveM key-string → KeyCode map; `alt.Utils.Keybind` when present, else `keydown` listener | ✅ (keydown path); ❓ `Utils.Keybind` path |
| `SendNUIMessage` / `SetNuiFocus` | per-resource overlay `alt.WebView` + `focus()`/`unfocus()` + `showCursor` | ✅ logic (mock webview); ❓ real CEF |
| `RegisterNUICallback` + FiveM NUI page idioms (`window 'message'`, `fetch('https://res/cb')`, `GetParentResourceName`) | build-time-injected page shim: `alt.emit('fivem:nuiCb', name, body, token)` + response event + `MessageEvent` dispatch | ✅ shim unit tests |
| `SetNuiFocusKeepInput` | flag stored; needs per-frame control suppression via natives | 🟡 (stubbed, documented) |
| Statebags (client read + `AddStateBagChangeHandler`) | server pushes `__fivem:state` events → Lua cache + handlers; `Entity()`/`Player()`/`LocalPlayer` proxies | ✅ (read-side; writes stay local — documented deviation) |
| `GetConvar`/`GetConvarReplicated` | config table shipped with the payload | ✅ |
| Resource KVP (`SetResourceKvp` etc.) | in-memory session store | 🟡 (persistence needs webview localStorage or server store) |
| `exports` (client, cross-resource) | live in-VM registry, same semantics as the server runtime | ✅ |
| `onResourceStart`/`onResourceStop` (client) | fired per resource load | ✅ (start; stop N/A — static bundle) |
| `Citizen.Await` / futures | not yet ported to the client prelude | 🟡 (scheduler already yields on `__cfx_await__`) |
| `LoadResourceFile` (client) | returns nil; needs payload embedding of `files{}` | 🟡 |
| Mumble voice API (`NetworkSetVoiceChannel`, pma-voice) | alt:V has built-in spatial voice; different API, no Mumble compat | 🟡 replacement layer needed — **major** remaining work |
| Networked client-created entities (`CreateVehicle(..., true, true)` etc.) | alt:V requires server-side entity creation; needs a server-broker event layer | 🟡 design needed — significant |
| DUI (web page as in-world texture) | no alt:V equivalent found | 🚫 |
| Loading-screen API (`SendLoadingScreenMessage`) | alt:V owns the loading flow | 🚫 (rarely gameplay-critical) |
| FiveM escrowed/encrypted client scripts | decryption is bound to the FiveM client binary | 🚫 **hard blocker for purchased resources** |
| Custom game data (vehicles/clothes/MLOs in `stream/`) | alt:V `dlc` resource type supports these | 🟡 conversion tooling (FiveM stream layout → dlc packs) not built |

**GTA V native functions specifically:** alt:V's `natives` module is generated from the same
native database FiveM uses (their public docs and code use identical names modulo camelCase and
underscore stripping — e.g. FiveM `GetGroundZFor_3dCoord` = alt `getGroundZFor3dCoord`). We
therefore expect **near-complete native coverage**; the runtime handles any gaps with warn-once +
`nil` instead of crashing, and per-native overrides can be added as discovered on-device. What
differs is not name coverage but **authority semantics**: on FiveM some natives are server-set
under OneSync (entity state, some player flags) while alt:V routes ownership differently — those
cases must be handled by the server-side compat layer, per-native, as they surface.

---

## 4. Architectural options considered

### Option A — status quo: server-side only (rejected)
Prior "blocked by design" stance. Rejected by owner directive: silently abandoning client-side
compatibility is not acceptable; the primary goal is running the whole custom QBCore server.

### Option B — FiveM-compatible Lua VM hosted in an alt:V client JS resource ✅ CHOSEN
A generated `fivem-client` resource (type `js`, `client-main`) that ships to every player via the
normal resource download. It embeds:
- **fengari** (pure-JS Lua 5.3) as the baseline VM — no WebAssembly, no filesystem, no `process`;
  runs in any JS sandbox, which is the only guarantee the alt:V client's V8 actually gives us.
- the **client prelude** (Lua) implementing the FiveM client API surface,
- the **JS bridge core** (events, natives proxy, NUI/webview management, keybinds, timers),
- this server's **transformed client scripts** (payload), generated by the same server runtime
  that hosts the server side (one manifest parser, one transformer, one source of truth),
- each resource's **ui_page html** with the NUI compat shim injected at build time.

*Strengths:* zero client modification (standard resource download — the sanctioned mechanism);
no signing/distribution problem; one pipeline for server+client; testable in Node; the VM is
pluggable. *Limitations:* Lua-in-JS performance (fengari is an interpreter — see §8); Lua 5.3
vs FiveM's 5.4 (documented deltas); correctness of everything game-facing must be verified
on-device.

### Option C — native C++ client module embedding real Lua 5.4/LuaJIT (not viable now)
Best raw performance, but shipping a native module into players' alt:V clients is gated by the
alt:V team (module signing/allowlist) and per-platform builds; a private server cannot rely on
it. Keep as a future escalation path if fengari performance proves insufficient and WASM
(wasmoon) is unavailable on-device.

### Option D — WASM Lua VM (wasmoon) in the client resource (fallback/upgrade path)
Same architecture as B with wasmoon (Lua 5.4, ~native speed). The adapter is implemented and
fully passes the harness, but wasmoon's emscripten glue needs WebAssembly + a compatible
environment (it can require `fs`/`process` detection paths); whether the alt:V client's V8
sandbox permits it is **unknown from this sandbox**. Boot-time feature detection can prefer
wasmoon and fall back to fengari once verified on-device.

### Option E — transpile FiveM Lua → client JS (rejected)
No maintainable Lua→JS transpiler exists for the fork syntax + Lua semantics (coroutines,
metatable-heavy code like qb-core's). Fragile by construction.

### Option F — point the actual FiveM client at NSM (impossible)
Different protocols/licensing; the FiveM client only talks to CFX servers. This was the original
"blocked by design" reading — correct for F, not for B/D.

---

## 5. What was implemented (this unit)

```
resources/fivem-compat/client/
  client-prelude.lua     Lua-side FiveM client API (threads, events, natives proxy,
                         vectors, statebags, NUI, commands/keybinds, convars, KVP,
                         exports, per-resource envs, onResourceStart)
  core.mjs               VM-agnostic runtime: bridges, native name resolution +
                         marshalling (vector expand, multireturn), webview/NUI
                         management, keybind wiring, net/state channels,
                         installNuiCompatPage (NUI page shim, injected at build)
  vm-fengari.mjs         fengari adapter (C-API host; state-parameterized — see the
                         coroutine-state note in the file header)
  vm-wasmoon.mjs         wasmoon adapter (same contract; Lua 5.4; avoids the
                         Function.prototype.call trap and wasmoon's null-return crash)
  boot.entry.js          alt:V client entry (bundled by esbuild; alt-client/natives external)
  gen/                   generated payload + prelude modules (build output)
tools/build-client-bundle.mjs   server pipeline -> payload -> esbuild bundle ->
                                resource.toml + shim-injected ui pages
resources/fivem-client/         THE DEPLOYABLE alt:V resource (generated; commit for
                                transparency; 517 KB bundle)
fivem_resources/client-demo{,-lib}/  qb-style acceptance resources (fork syntax,
                                NUI page, keybind, net events, statebags, exports)
test/client-runtime.test.mjs    the harness (below)
```

Server-side changes: `cfx/runtime.js` now collects + transforms client/shared scripts per
resource (`res.clientScripts`), captures `ui_page`/`files` in manifests, and exposes
`buildClientPayload()`. Missing client script files are skipped (non-fatal) — the server side of
the resource still runs.

### Evidence (all in-sandbox, real pipeline — mock game/transport)

- `node test/client-runtime.test.mjs` → **70/70**
  - Part A (10): real manifest parse → fork-transform → payload (ui_page, files, chunk paths).
  - Part B (27 × 2 VMs): boot, thread loop to completion, `onResourceStart`, native → vector3
    marshalling, multireturn spread, convars, vector math, warn-once missing native, net events
    both directions, statebag change handlers, keybind → command → `SendNUIMessage` → webview,
    `SetNuiFocus`/cursor, NUI callback round-trip back into the page, cross-resource exports,
    error isolation — **on fengari (what ships) and wasmoon (cross-validation)**.
  - Part C (6): NUI page shim — message events, callback fetch + token-routed response,
    foreign-URL passthrough, `GetParentResourceName`.
- `node test/run-tests.js` → **102/102** (server suite, unchanged behavior)
- transform gate 62/62, live-exports 17/17, qb-core loads — unchanged.
- `node tools/build-client-bundle.mjs` → deploys `resources/fivem-client/` (bundle parses as
  ESM; `alt-client` + `natives` correctly left external).

---

## 6. Known limitations & deviations (honest list)

1. **No real-client verification yet.** Everything through §5 is logic-level. See §7 checklist.
2. **Lua 5.3 (fengari) vs FiveM Lua 5.4:** no to-be-closed vars (`<close>`), no 5.4 integer/float
   subtype nuance, `<const>` in 5.4 — none appear in qb-core/esx code we audited; the wasmoon
   adapter is true 5.4 for cross-checking.
3. **Safe navigation `?.` is not transformable** in general (standing finding; regex rewriting is
   ambiguous). Resources using it need hand-edits or a real parser pass. qb-core core does not
   use it client-side; some esx_lib modules do (documented).
4. **Perf:** fengari is a pure-JS interpreter (~10–50× slower than native Lua). Event-driven
   gameplay code is fine; per-frame `Wait(0)` draw loops with heavy native traffic may need the
   JS escape hatch (move hot loop to a small JS module callable from Lua) or the wasmoon path.
   Not yet benchmarked — on-device item.
5. **Statebag client writes do not replicate** (read-side only). FiveM allows some client-side
   replication; our server-side statebag layer would need a write-back event + permission model.
6. **`SetNuiFocusKeepInput`** is a stored flag; per-frame input suppression not wired.
7. **Voice:** pma-voice/Mumble API is not implemented; alt:V spatial voice exists but needs a
   replacement resource. **Major remaining work** for a playable qb server.
8. **Networked client-created entities** need a server broker; client-local entities work via
   natives.
9. **DUI, loading-screen API: unsupported** (no alt:V equivalent).
10. **Escrowed client scripts: impossible** — affects purchased resources only; plan replacements.
11. **KVP is session-only**; needs a persistence backing.
12. **One VM per side, static bundle:** client resources don't hot-restart; a resource update
    means a new bundle + server restart (same as any alt:V resource update).
13. **NUI pages load in alt:V webviews, not FiveM's NUI sandbox**: the injected shim covers the
    standard idioms (`message` events, `https://res/` fetch, `GetParentResourceName`); pages
    using exotic NUI features (e.g. `RegisterRawNuiCallback`, focus shapes) may need shim work.

---

## 7. On-device verification checklist (next: run on the Windows GTAMP host)

1. Copy `resources/fivem-client/` into the server resources, add `fivem-client` to server.cfg,
   connect with the real alt:V client, confirm the resource downloads and boots (console log
   line `boot complete: N/N resources running`).
2. Confirm the natives module resolves (watch for warn-once lines; add per-native overrides as
   needed).
3. Confirm WASM availability in the client sandbox (`typeof WebAssembly`) → decide fengari vs
   wasmoon default.
4. Verify WebView overlay rendering + focus/cursor with the demo resource's HUD (F5).
5. Verify `Utils.Keybind` vs keydown listener behavior for key mapping.
6. Verify event transport end-to-end with the server-side fivem-compat (`__fivem:net` wiring
   through `alt.emitClient`/`emitServer` on the real server).
7. Benchmark a `Wait(0)` draw loop (fengari) to quantify §6.4.
8. Test with qb-core's real client scripts (not just the demo) and enumerate the delta.

## 8. Server-side wiring still to build (integration step, next unit)

- Route server-Lua `TriggerClientEvent` → `alt.emitClient(player, '__fivem:net', name, json)`
  (the mock adapter path is tested; the real js-module v1 adapter path needs the same bridge).
- Push statebag changes to `__fivem:state`.
- Client `__fivem:cmd` → server command/chat bridge (already conversational in index.js).
- Player id mapping (alt player id ↔ FiveM server id) for `Player(serverId).state`.
