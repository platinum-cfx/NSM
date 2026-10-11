# NSM FiveM Compatibility Layer (cfx-compat) — v2

Runs **unmodified FiveM Lua server resources** on your NSM/GTAMP (alt:V) server by
embedding a real Lua 5.4 VM (vendored [wasmoon](https://github.com/ceifa/wasmoon), MIT)
inside an alt:V JS resource and implementing the Cfx server API on top of alt:V.

Implemented from public Cfx API documentation — **no FiveM source code is used**
(the FiveM repo is © Take-Two under the Rockstar Creator Platform License; a
from-docs implementation is the clean-room way to do compat, like Wine
implementing Win32). The generated `cfx/natives-stubs.lua` name list comes from
the public Cfx.re natives definitions (`github.com/citizenfx/natives`) — names
and API surface, not code.

**Test suite: 46/46 passing** (`node test/run-tests.js`)

## Real-framework status (v2.1)

**qb-core** and **esx-legacy/es_extended** (plus esx_lib) load their **complete
server-side code with zero errors** through this layer — verified against the
real upstream repos (QBCore Framework / esx-framework), not example scripts.
That works because v2.1 added what real resources actually use:

- **FiveM Lua-fork syntax** (`cfx/lua-transform.js`): backtick identifiers
  (`[`weapon_unarmed`]`), compound assignment (`count += 1`), and safe
  navigation (`getmetatable(val)?.__call`) are rewritten to standard Lua 5.4
  before compiling — string/comment aware, and hooked into Lua's `load()` too,
  so esx_lib's own module loader gets it for free.
- **fxmanifest v2**: `shared_scripts`, wildcard globs (`locale/*.lua`),
  `@resource/path` imports (oxmysql's lib is skipped — native MySQL is
  provided), and unknown directives no-op instead of crashing.
- **Engine globals real frameworks expect**: `json`, `msgpack`, `joaat`,
  `GlobalState`, `ExecuteCommand`, `IsPlayerAceAllowed` (permissive stub),
  `SetMapName`/`SetGameType`, `SaveResourceFile`.

Known next step: cross-resource **live exports** — `exports['qb-core']:GetCoreObject()`
currently JSON-marshals the core object, so function fields are lost. Resources
whose server logic only needs events/MySQL/commands run fine; ones that call
through the core object need the one-VM/live-exports build (in progress).

## What runs (v2)

**Core**
- ✅ `fxmanifest.lua` parsing (`server_scripts`; `client_scripts` ignored with a warning)
- ✅ `RegisterNetEvent` / `RegisterServerEvent` / `AddEventHandler` / `on`, with the
  FiveM `source` global set per event/command
- ✅ `TriggerEvent` (local bus), `TriggerClientEvent` (incl. `-1` broadcast)
- ✅ `CreateThread` + `Citizen.Wait` scheduler, `SetTimeout`
- ✅ `RegisterCommand` (bridge: client emits `cfx:command` with the raw text)
- ✅ Convars, `GetHashKey` (real joaat), `LoadResourceFile`, `vector3`/`vector4`
- ✅ Lifecycle events with source: `playerConnecting` (auto-accepting deferrals),
  `playerJoining`, `playerDropped`
- ✅ JSON marshal layer (spec-valid escaping, used for events/statebags/MySQL)

**Cross-resource exports** — both FiveM syntaxes:
- ✅ `exports('name', fn)` to define
- ✅ `exports['resource']:name(args)` (colon) and `exports.resource.name(args)` (dot)

**MySQL** (oxmysql / mysql-async style; needs `mysql.json` + `npm i mysql2`)
- ✅ `MySQL.query/execute/scalar/single/insert/update` — call, `.await`, `.sync`
- ✅ `MySQL.Async.fetchAll/fetchScalar/...` callback style, `MySQL.ready`

**Statebags** (player state → alt:V synced meta)
- ✅ `Player(src).state.key = v`, reads, `AddStateBagChangeHandler`

**Entities** (OneSync-style compat handles backed by real alt:V entities)
- ✅ `CreateVehicle`, `DeleteEntity`, `DoesEntityExist`, `Get/SetEntityCoords`,
  `Get/SetEntityHeading`, `GetEntityModel`, `Get/SetVehicleNumberPlateText`,
  network-id identity functions

**Async / HTTP**
- ✅ `promise.new()` + `Citizen.Await` (oxmysql/QBCore pattern)
- ✅ `PerformHttpRequest` (callback gets status, body, headers table)

**Every native name resolves — no more nil-crashes**
- ✅ All **6,439 natives** from the official Cfx.re definitions are present as
  globals. Hand-implemented ones (above) really work; the rest are stubs that
  warn once (`[cfx-compat] warning: native X is not implemented on NSM yet`)
  and return nil — so any FiveM script **loads and runs its server logic**
  instead of dying on a missing global. See `cfx/natives-stubs.lua` (generated,
  45 categories: ENTITY, PED, VEHICLE, PLAYER, NETWORK, …).

## Install

1. Copy `resources/fivem-compat/` into your server's resources folder
   (wasmoon is vendored — no npm install needed for the Lua VM itself).
2. Create `<server-root>/fivem_resources/` and drop FiveM resources in
   (`fxmanifest.lua` at the folder root). FiveM-style `[category]` subfolders work too.
3. Optional, for MySQL: `npm i mysql2` in the resource dir and create
   `<server-root>/mysql.json`:
   ```json
   { "host": "127.0.0.1", "port": 3306, "user": "root", "password": "", "database": "fivem" }
   ```
4. Chat commands: have your chat resource emit server event `cfx:command`
   with the raw message text (e.g. `/giveitem apple 2`).

## What does NOT run (architecture limits)

- ❌ `client_scripts` / NUI / client natives — those run on the player's FiveM
  client, which the GTAMP client is not. Server logic, events and statebags are
  where compat lives; `TriggerClientEvent` still fires real alt:V client events
  with the same names so you can pair with your own client-side JS.
- ⚠️ Unimplemented server natives return nil + a one-time warning (not a crash).
  Frameworks' server cores (QBCore/ESX/vMenu server side) lean mostly on what's
  implemented above; anything missing logs clearly — send the warning line and
  it can be implemented in the runtime.
- ⚠️ `playerConnecting` deferrals auto-accept (handlers run; kicking works,
  holding in a queue does not).
- ⚠️ Entity (vehicle) statebag change handlers aren't wired through alt:V
  synced-meta events yet (player ones are).

## Layout

```
resources/fivem-compat/
  index.js            alt:V adapter (events, MySQL, entities, statebags, lifecycle)
  cfx/runtime.js      the compat runtime (Lua prelude + JS bridges)
  cfx/natives-stubs.lua   generated: all 6,439 native names (Cfx.re definitions)
  vendor/wasmoon/     vendored Lua 5.4-in-WASM (MIT)
test/                 mock alt:V + 46-check suite (plain Node, no server needed)
fivem_resources/      example FiveM resources used by the tests
tools/natives-tree.json   snapshot of the natives repo tree used to generate stubs
```
