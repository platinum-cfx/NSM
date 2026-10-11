// End-to-end test of the NSM cfx-compat runtime (v3: one VM, live exports)
// against a mock alt:V server.
import { CfxCompatRuntime, joaat } from '../cfx/runtime.js';
import { makeMockAlt } from './mock-alt.js';
import { makeAdapter } from '../cfx/adapter.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const mock = makeMockAlt();
const rt = new CfxCompatRuntime(mock);

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}`); }
}

// The server entry must parse as ESM — a bad escape once shipped a SyntaxError
// that stopped fivem-compat from loading on the real server. node --check
// honors the "type": "module" in package.json, so this is exactly what the
// alt:V module compiler will see.
{
  const r = spawnSync(process.execPath, ['--check', path.join(__dirname, '..', 'index.js')], { encoding: 'utf8' });
  check('server entry index.js parses (node --check)', r.status === 0);
  if (r.status !== 0) console.error('    ' + String(r.stderr || '').trim().split('\n').slice(0, 2).join('\n    '));
}

console.log('== init ==');
await rt.init();
check('runtime initialized', !!rt.factory);
check('single engine created', !!rt.lua);

console.log('== load FiveM resources ==');
const resDir = path.join(__dirname, '..', 'fivem_resources', 'example-hello');
const callerDir = path.join(__dirname, '..', 'fivem_resources', 'example-caller');
const emitDir = path.join(__dirname, '..', 'fivem_resources', 'example-emit');
check('fxmanifest.lua exists', fs.existsSync(path.join(resDir, 'fxmanifest.lua')));
await rt.loadResource('example-hello', resDir);
await rt.loadResource('example-caller', callerDir);
await rt.loadResource('example-emit', emitDir);

check('both resources loaded', rt.engines.has('example-hello') && rt.engines.has('example-caller'));
check('server script ran (loaded OK message)', mock.logs.some((l) => l.includes('example-hello server.lua loaded OK')));
check('example-caller loaded', mock.logs.some((l) => l.includes('example-caller loaded')));
check('client script missing file is skipped (not fatal)', mock.errors.some((l) => l.includes("client bundle: missing script 'client.lua'")));
check('one VM shared by both resources', rt.engines.get('example-hello').lua === rt.lua && rt.engines.get('example-caller').lua === rt.lua);
check('print carries resource prefix', mock.logs.some((l) => l.includes('[example-hello]') || l.includes('example-hello')));

console.log('== net event (client -> server Lua) ==');
mock.netListeners.get('nsm:hello')[0](mock.players[0], 'hi from the client');
check('Lua net handler used GetPlayerName(source)', mock.logs.some((l) => l.includes('nsm:hello from austi (src 1)')));
check('TriggerClientEvent broadcast (-1) sent', mock.clientEvents.some((e) => e.name === 'nsm:welcome' && e.target === -1));
check('runtime dispatches primitive client events', mock.clientEvents.some((e) => e.name === 'nsm:prim' && e.target === -1));
check('runtime marshals Lua tables to plain objects', mock.clientEvents.some((e) => e.name === 'nsm:obj' && e.args[0] && typeof e.args[0] === 'object' && e.args[0].a === 1));
check('runtime passes Lua functions through', mock.clientEvents.some((e) => e.name === 'nsm:cb' && typeof e.args[0] === 'function'));
check('fxmanifest name directive accepted (no warning)', !mock.logs.some((l) => l.includes('unsupported directive') && l.includes('example-emit')));

console.log('== adapter emit whitelist (exact server code path) ==');
const amockBase = makeMockAlt();
// makeAdapter talks to an ALT-shaped object (Player.all, on, Vehicle, ...),
// while makeMockAlt is adapter-shaped; graft the alt-ish fields the adapter
// touches onto the mock. This is the same surface the real alt-server module
// provides to index.js.
const amock = {
  ...amockBase,
  Player: { all: amockBase.players },
  on: () => {},
  Vehicle: function () {},
  Vector3: function () {},
};
const ad = makeAdapter(amock, { log: () => {}, logError: () => {} });
const pid = (amock.players[0] || { id: 1 }).id;
ad.emitAllClients('nsm:prim', 42, 'text', true);
ad.emitAllClients('nsm:obj', { a: 1 });
ad.emitAllClients('nsm:cb', () => {});
ad.emitClient(pid, 'nsm:prim2', 7);
ad.emitClient(pid, 'nsm:obj2', { b: 2 });
check('adapter: raw passthrough for primitives', amock.clientEvents.some((e) => e.name === 'nsm:prim' && e.target === -1));
check('adapter: envelope for primitives', amock.clientEvents.some((e) => e.name === '__fivem:net' && e.args[0] === 'nsm:prim' && JSON.parse(e.args[1])[0] === 42));
check('adapter: no raw passthrough for objects', !amock.clientEvents.some((e) => e.name === 'nsm:obj'));
check('adapter: objects delivered via envelope', amock.clientEvents.some((e) => e.name === '__fivem:net' && e.args[0] === 'nsm:obj' && e.args[1].includes('\"a\"')));
check('adapter: no raw passthrough for functions', !amock.clientEvents.some((e) => e.name === 'nsm:cb'));
check('adapter: functions delivered via envelope', amock.clientEvents.some((e) => e.name === '__fivem:net' && e.args[0] === 'nsm:cb'));
check('adapter: targeted raw passthrough for primitives', amock.clientEvents.some((e) => e.name === 'nsm:prim2'));
check('adapter: targeted objects envelope-only', !amock.clientEvents.some((e) => e.name === 'nsm:obj2') && amock.clientEvents.some((e) => e.name === '__fivem:net' && e.args[0] === 'nsm:obj2'));

console.log('== commands ==');
check('command registered', rt.commands.has('helloworld'));
const ran = rt.runCommand(mock.players[1], '/helloworld foo bar');
check('runCommand returns true', ran === true);
check('command executed in Lua', mock.logs.some((l) => l.includes('ran /helloworld foo bar with 2 arg(s): foo bar')));

console.log('== threads / json / convar / hash ==');
await sleep(700);
check('thread tick 1..3 ran', mock.logs.filter((l) => l.includes('tick ')).length === 3);
check('thread finished', mock.logs.some((l) => l.includes('thread finished')));
check('convar roundtrip via Lua', mock.logs.some((l) => l.includes('convar reads back: hello')));
check('GetHashKey (joaat) works', mock.logs.some((l) => l.includes(`hash of \"austi\" = ${joaat('austi')}`)));

// JSON roundtrip through the shared VM (runs inside example-hello's env)
await rt.runLua('example-hello', `
    local src = __jsonEncode({ a = 1, list = { 10, 20, 30 }, s = 'he said \"hi\"', nested = { ok = true } })
    local t = __jsonDecode(src)
    __j1 = t.a
    __j2 = t.list[2]
    __j3 = t.s
    __j4 = tostring(t.nested.ok)
`);
check('json roundtrip: number', rt.envGet('example-hello', '__j1') === 1);
check('json roundtrip: array', rt.envGet('example-hello', '__j2') === 20);
check('json roundtrip: escaped string', rt.envGet('example-hello', '__j3') === 'he said \"hi\"');
check('json roundtrip: nested bool', rt.envGet('example-hello', '__j4') === 'true');

console.log('== player natives ==');
await rt.runLua('example-hello', `__n = #GetPlayers() __p2 = GetPlayerName(7) __idn = #GetPlayerIdentifiers(1)`);
check('GetPlayers() = 2', rt.envGet('example-hello', '__n') === 2);
check('GetPlayerName(7) = carmone', rt.envGet('example-hello', '__p2') === 'carmone');
check('GetPlayerIdentifiers(1) = 3 entries', rt.envGet('example-hello', '__idn') === 3);

console.log('== exports (cross-resource, LIVE) ==');
await sleep(200);
check('cross-resource export call worked', mock.logs.some((l) => l.includes('19 + 23 = 42')));

// live tables: mutations from the caller are visible in the owner resource
await rt.runLua('example-hello', `
    __shared = { count = 1, bump = function(self) self.count = self.count + 100 end }
    exports('getShared', function() return __shared end)
    exports('echoSource', function() return source end)
`);
await rt.runLua('example-caller', `
    local t = exports['example-hello']:getShared()
    __live1 = (t.count == 1)
    __livefn = (type(t.bump) == 'function')   -- functions survive (no JSON copy)
    t.bump(t)                                   -- mutate through the live reference
    t.count = 99
    __liveself = (t == exports['example-hello']:getShared())  -- identity preserved
`);
check('export returns live table (values)', rt.envGet('example-caller', '__live1') === true);
check('export keeps functions (GetCoreObject case)', rt.envGet('example-caller', '__livefn') === true);
check('export preserves table identity', rt.envGet('example-caller', '__liveself') === true);
await rt.runLua('example-hello', `__seen = __shared.count`);
check('mutations through export are live (bump + field write)', rt.envGet('example-hello', '__seen') === 99);

// `source` propagates into export calls (FiveM semantics)
await rt.runLua('example-caller', `
    AddEventHandler('cfxtest:explocal', function()
      __srcViaExport = exports['example-hello']:echoSource()
    end)
`);
rt.dispatchLocal('cfxtest:explocal', []);
check('export callee sees caller source (local, 0)', rt.envGet('example-caller', '__srcViaExport') === 0);
await rt.runLua('example-caller', `
    AddEventHandler('cfxtest:expnet', function()
      __srcViaExportNet = exports['example-hello']:echoSource()
    end)
    RegisterNetEvent('cfxtest:expnet2', function()
      __srcViaExportNet2 = exports['example-hello']:echoSource()
    end)
`);
mock.netListeners.get('cfxtest:expnet2')[0](mock.players[1], 'go');
check('export callee sees caller source (net, 7)', rt.envGet('example-caller', '__srcViaExportNet2') === 7);

// calling a missing export must fail loudly (no fake success)
let exportErr = null;
try { await rt.runLua('example-caller', `exports['example-hello']:doesNotExist()`); }
catch (e) { exportErr = e; }
check('missing export errors clearly', !!exportErr && /no export/.test(String(exportErr && exportErr.message)));
let resErr = null;
try { await rt.runLua('example-caller', `exports['not-loaded-at-all']:thing()`); }
catch (e) { resErr = e; }
check('export to unloaded resource errors clearly', !!resErr && /not loaded/.test(String(resErr && resErr.message)));

console.log('== env isolation + shared prelude (one VM) ==');
await rt.runLua('example-hello', `__onlyHello = 5`);
await rt.runLua('example-caller', `
    __cantSee = (__onlyHello == nil)          -- caller does not see hello's globals
    __seePrelude = (type(promise.new) == 'function') and (type(MySQL.query.await) == 'function')
    __curRes = GetCurrentResourceName()
`);
check('resource globals are isolated', rt.envGet('example-caller', '__cantSee') === true);
check('prelude is shared across resources', rt.envGet('example-caller', '__seePrelude') === true);
check('GetCurrentResourceName per resource', rt.envGet('example-caller', '__curRes') === 'example-caller');
await rt.runLua('example-hello', `__curRes2 = GetCurrentResourceName()`);
check('GetCurrentResourceName per resource (2)', rt.envGet('example-hello', '__curRes2') === 'example-hello');

// load() inherits the CALLING resource's env (esx_lib / es_extended pattern)
await rt.runLua('example-hello', `
    __envtest = 111
    local f = load('return __envtest')
    __loadEnvOk = (f() == 111)
`);
check('load() inherits calling resource env', rt.envGet('example-hello', '__loadEnvOk') === true);
await rt.runLua('example-caller', `
    local f = load('return __envtest')
    __loadEnvOther = (f() == nil)
`);
check('load() in caller does not see hello env', rt.envGet('example-caller', '__loadEnvOther') === true);

console.log('== MySQL ==');
await sleep(400);
check('MySQL.ready fired', mock.logs.some((l) => l.includes('MySQL.ready fired')));
check('query.await rows', mock.logs.some((l) => l.includes('db query: 2 row(s), first = austi')));
check('scalar.await', mock.logs.some((l) => l.includes('db scalar: 2')));
check('callback style query', mock.logs.some((l) => l.includes('db callback style: 2 row(s)')));
check('insert.await returns id', mock.logs.some((l) => l.includes('db insert id: 3')));
check('scalar after insert', mock.logs.some((l) => l.includes('db scalar after insert: 3')));

console.log('== entity natives ==');
await sleep(200);
check('vehicle created + exists', mock.logs.some((l) => l.includes('vehicle handle:') && l.includes('exists=true')));
check('plate set/get', mock.logs.some((l) => l.includes('plate: NSMTEST')));
check('coords roundtrip', mock.logs.some((l) => l.includes('coords: 200.0, -930.0, 31.0')));
check('heading set/get', mock.logs.some((l) => l.includes('heading: 180.0')));
check('delete works', mock.logs.some((l) => l.includes('after delete exists=false')));
check('entity registry empty after delete', rt.entities.size === 0);

console.log('== statebags ==');
await sleep(200);
check('statebag write + read back', mock.logs.some((l) => l.includes('state read back: 500')));
check('AddStateBagChangeHandler fired', mock.logs.some((l) => l.includes('statebag change: player:1.money = 750')));

console.log('== local events across the bus ==');
await rt.runLua('example-hello', `AddEventHandler('cfxtest:local', function(a, b) print('local event got ' .. tostring(a) .. ',' .. tostring(b)) end)`);
rt.dispatchLocal('cfxtest:local', ['x', 42]);
check('local event dispatched to Lua', mock.logs.some((l) => l.includes('local event got x,42')));

console.log('== promises / Citizen.Await ==');
await rt.runLua('example-hello', `
  CreateThread(function()
    local p = promise.new()
    SetTimeout(50, function() p.resolve(7, 'seven') end)
    local a, b = Citizen.Await(p)
    print('await got: ' .. tostring(a) .. ',' .. tostring(b))
  end)
`);
await sleep(300);
check('Citizen.Await resolves', mock.logs.some((l) => l.includes('await got: 7,seven')));

console.log('== PerformHttpRequest ==');
await rt.runLua('example-hello', `
  PerformHttpRequest('https://api.example.test/status', function(status, body, headers)
    print('http: ' .. status .. ' body=' .. body .. ' ct=' .. tostring(headers['content-type']))
  end, 'GET')
`);
await sleep(200);
check('PerformHttpRequest callback fired', mock.logs.some((l) => l.includes('http: 200 body={\"ok\":true} ct=application/json')));

console.log('== native stubs (full Cfx set) ==');
check('stubs installed', mock.logs.some((l) => l.includes('native stubs installed:')));
await rt.runLua('example-hello', `
  __stubret = SetPlayerWantedLevel(1, false)
  __handmade = GetPlayerName(7)
  __stubret2 = SetPlayerWantedLevel(2, false)
`);
check('stub native returns nil', rt.envGet('example-hello', '__stubret') === null || rt.envGet('example-hello', '__stubret') === undefined);
check('stub warns exactly once', mock.logs.filter((l) => l.includes('native SetPlayerWantedLevel is not implemented')).length === 1);
check('hand-implemented native wins over stub', rt.envGet('example-hello', '__handmade') === 'carmone');

console.log('== lifecycle events ==');
await rt.runLua('example-hello', `
  RegisterServerEvent('nsm:netevt')
  AddEventHandler('playerDropped', function(reason)
    print('player dropped: src=' .. tostring(source) .. ' reason=' .. reason)
  end)
`);
rt.fireLifecycle('playerDropped', mock.players[0], ['Exiting']);
check('playerDropped fired with source set', mock.logs.some((l) => l.includes('player dropped: src=1 reason=Exiting')));
check('RegisterServerEvent alias works', rt.wiredNet.has('nsm:netevt'));

console.log('== fxmanifest diagnostics (unsupported directives) ==');
const tmpRoot = path.join(__dirname, '..', 'fivem_resources', '__tmp_diag');
fs.rmSync(tmpRoot, { recursive: true, force: true });
fs.mkdirSync(path.join(tmpRoot, 'diag-test'), { recursive: true });
fs.writeFileSync(path.join(tmpRoot, 'diag-test', 'fxmanifest.lua'),
  `fx_version 'cerulean'\ngame 'gta5'\nsome_future_directive 'x'\nserver_scripts { 'server.lua' }\n`);
fs.writeFileSync(path.join(tmpRoot, 'diag-test', 'server.lua'), `print('diag-test ran')`);
await rt.loadResource('diag-test', path.join(tmpRoot, 'diag-test'));
check('unsupported directive is reported', mock.logs.some((l) => l.includes('unsupported directive') && l.includes('some_future_directive')));
check('resource still loads (warn, not crash)', mock.logs.some((l) => l.includes('diag-test ran')));
fs.rmSync(tmpRoot, { recursive: true, force: true });

console.log('== dependency-ordered loading (loadAll) ==');
const depRoot = path.join(__dirname, '..', 'fivem_resources', '__tmp_dep');
fs.rmSync(depRoot, { recursive: true, force: true });
fs.mkdirSync(path.join(depRoot, 'dep-late'), { recursive: true });
fs.mkdirSync(path.join(depRoot, 'dep-early'), { recursive: true });
// dep-late declares a dependency on dep-early AND @imports from it;
// listed in the WRONG order on purpose.
fs.writeFileSync(path.join(depRoot, 'dep-early', 'fxmanifest.lua'), `fx_version 'cerulean'\ngame 'gta5'\nserver_scripts { 'server.lua' }\n`);
fs.writeFileSync(path.join(depRoot, 'dep-early', 'lib.lua'), `__earlyLib = { here = true }\nexports('getLib', function() return __earlyLib end)`);
fs.writeFileSync(path.join(depRoot, 'dep-early', 'server.lua'), `__earlyLib = { here = true } exports('getLib', function() return __earlyLib end) print('dep-early ready')`);
fs.writeFileSync(path.join(depRoot, 'dep-late', 'fxmanifest.lua'), `fx_version 'cerulean'\ngame 'gta5'\ndependency 'dep-early'\nserver_scripts { '@dep-early/lib.lua', 'server.lua' }\n`);
fs.writeFileSync(path.join(depRoot, 'dep-late', 'server.lua'), `print('dep-late ready, lib=' .. tostring(exports['dep-early']:getLib().here))`);
await rt.loadAll([['dep-late', path.join(depRoot, 'dep-late')], ['dep-early', path.join(depRoot, 'dep-early')]]);
const earlyIdx = mock.logs.findIndex((l) => l.includes('dep-early ready'));
const lateIdx = mock.logs.findIndex((l) => l.includes('dep-late ready'));
check('dependency loaded before dependent', earlyIdx >= 0 && lateIdx >= 0 && earlyIdx < lateIdx);
check('dependent saw dependency export', mock.logs.some((l) => l.includes('dep-late ready, lib=true')));
// cycle detection: a <-> b must not hang, must log the cycle
const cycRoot = path.join(__dirname, '..', 'fivem_resources', '__tmp_cyc');
fs.rmSync(cycRoot, { recursive: true, force: true });
fs.mkdirSync(path.join(cycRoot, 'cyc-a'), { recursive: true });
fs.mkdirSync(path.join(cycRoot, 'cyc-b'), { recursive: true });
fs.writeFileSync(path.join(cycRoot, 'cyc-a', 'fxmanifest.lua'), `fx_version 'cerulean'\ngame 'gta5'\ndependency 'cyc-b'\nserver_scripts { 'server.lua' }\n`);
fs.writeFileSync(path.join(cycRoot, 'cyc-a', 'server.lua'), `print('cyc-a ran')`);
fs.writeFileSync(path.join(cycRoot, 'cyc-b', 'fxmanifest.lua'), `fx_version 'cerulean'\ngame 'gta5'\ndependency 'cyc-a'\nserver_scripts { 'server.lua' }\n`);
fs.writeFileSync(path.join(cycRoot, 'cyc-b', 'server.lua'), `print('cyc-b ran')`);
await rt.loadAll([['cyc-a', path.join(cycRoot, 'cyc-a')], ['cyc-b', path.join(cycRoot, 'cyc-b')]]);
check('cycle detected and reported', mock.errors.some((l) => l.includes('dependency cycle')));
check('cycle fallback still runs both resources', mock.logs.some((l) => l.includes('cyc-a ran')) && mock.logs.some((l) => l.includes('cyc-b ran')));
fs.rmSync(depRoot, { recursive: true, force: true });
fs.rmSync(cycRoot, { recursive: true, force: true });

console.log('== resource lifecycle: stop / restart / status ==');
const lcRoot = path.join(__dirname, '..', 'fivem_resources', '__tmp_lc');
fs.rmSync(lcRoot, { recursive: true, force: true });
const mkres = (name, manifest, script) => {
  const d = path.join(lcRoot, name);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'fxmanifest.lua'), manifest);
  fs.writeFileSync(path.join(d, 'server.lua'), script);
  return d;
};
const lcAlpha = mkres('lc-alpha', "fx_version 'cerulean'\ngame 'gta5'\nserver_scripts { 'server.lua' }\n", `
RegisterCommand('lccmd', function(src, args, raw) print('lccmd ran: ' .. table.concat(args, ' ')) end, false)
AddEventHandler('lc:ping', function(msg) print('lc-alpha ping: ' .. tostring(msg)) end)
exports('lcval', function() return 42 end)
AddEventHandler('onResourceStop', function(res) print('lc-alpha saw onResourceStop: ' .. tostring(res)) end)
AddEventHandler('onResourceStart', function(res) if res == 'lc-alpha' then __sawOwnStart = true end end)
local ticks = 0
CreateThread(function()
  while true do
    Citizen.Wait(60)
    ticks = ticks + 1
    print('lc tick ' .. ticks)
  end
end)
`);
await rt.loadResource('lc-alpha', lcAlpha);
check('resource reports running after clean load', rt.getResourceState('lc-alpha') === 'running');
await sleep(250);
const ticksBefore = mock.logs.filter((l) => l.includes('lc tick ')).length;
check('attributed thread is ticking', ticksBefore >= 2, `ticks=${ticksBefore}`);
await rt.runLua('example-caller', `__lcStart = exports['lc-alpha']:lcval()`);
check('export works before stop', rt.envGet('example-caller', '__lcStart') === 42);
await rt.runLua('example-hello', `__alphaState = GetResourceState('lc-alpha')`);
check("GetResourceState says 'started' while running", rt.envGet('example-hello', '__alphaState') === 'started');

check('onResourceStart fired for clean load (own handler)', rt.envGet('lc-alpha', '__sawOwnStart') === true);

// stop it
rt.stopResource('lc-alpha');
check("stopResource -> status 'stopped'", rt.getResourceState('lc-alpha') === 'stopped');
check('onResourceStop fired (own handler saw it)', mock.logs.some((l) => l.includes('lc-alpha saw onResourceStop: lc-alpha')));
check('command removed on stop', !rt.commands.has('lccmd') && rt.runCommand(mock.players[1], '/lccmd x') === false);
rt.dispatchLocal('lc:ping', ['after-stop']);
await sleep(50);
check('event handlers removed on stop', !mock.logs.some((l) => l.includes('lc-alpha ping: after-stop')));
let expGone = null;
try { await rt.runLua('example-caller', `exports['lc-alpha']:lcval()`); } catch (e) { expGone = e; }
check('exports removed on stop (clear error)', !!expGone && /not loaded/.test(String(expGone && expGone.message)));
await rt.runLua('example-hello', `__alphaState2 = GetResourceState('lc-alpha')`);
check("GetResourceState says 'stopped' after stop", rt.envGet('example-hello', '__alphaState2') === 'stopped');
await sleep(250);
const ticksAfter = mock.logs.filter((l) => l.includes('lc tick ')).length;
check('pending timers cancelled on stop', ticksAfter === ticksBefore, `before=${ticksBefore} after=${ticksAfter}`);

// restart it
await rt.restartResource('lc-alpha');
check('restart -> running again', rt.getResourceState('lc-alpha') === 'running');
await sleep(200);
const ticksResumed = mock.logs.filter((l) => l.includes('lc tick ')).length;
check('thread runs again after restart', ticksResumed > ticksAfter, `after=${ticksAfter} resumed=${ticksResumed}`);
await rt.runLua('example-caller', `__lcStart2 = exports['lc-alpha']:lcval()`);
check('export re-registered after restart', rt.envGet('example-caller', '__lcStart2') === 42);

console.log('== failed resources are never marked running ==');
// watch from another resource whether onResourceStart fires for the broken one
await rt.runLua('example-hello', `
AddEventHandler('onResourceStart', function(res) if res == 'lc-broken' then __brokenStartFired = true end end)
AddEventHandler('onResourceStop', function(res) if res == 'lc-broken' then __brokenStopFired = true end end)
`);
const lcBroken = mkres('lc-broken', "fx_version 'cerulean'\ngame 'gta5'\nserver_scripts { 'server.lua' }\n", `
AddEventHandler('lc:broken', function() print('lc-broken handler alive') end)
RegisterCommand('broken', function() print('broken cmd') end, false)
error('boom: intentional failure')
`);
await rt.loadResource('lc-broken', lcBroken);
check('runtime-error resource reports failed', rt.getResourceState('lc-broken') === 'failed');
rt.dispatchLocal('lc:broken', []);
await sleep(50);
check('failed resource handlers are cleaned up', !mock.logs.some((l) => l.includes('lc-broken handler alive')));
check('failed resource commands are cleaned up', !rt.commands.has('broken'));
check('onResourceStart NOT fired for failed resource', rt.envGet('example-hello', '__brokenStartFired') !== true);
check('error is clearly logged', mock.errors.some((l) => l.includes("resource 'lc-broken' FAILED to start")));

const lcSyntax = mkres('lc-syntax', "fx_version 'cerulean'\ngame 'gta5'\nserver_scripts { 'server.lua' }\n", `local x = = 5\n`);
await rt.loadResource('lc-syntax', lcSyntax);
check('compile-error resource reports failed', rt.getResourceState('lc-syntax') === 'failed');

const lcMissing = mkres('lc-missing', "fx_version 'cerulean'\ngame 'gta5'\nserver_scripts { 'nope.lua' }\n", `print('never runs')`);
await rt.loadResource('lc-missing', lcMissing);
check('missing-script resource reports failed', rt.getResourceState('lc-missing') === 'failed');
check('missing script is clearly reported', mock.errors.some((l) => l.includes('missing script: nope.lua')));

// failed -> fix -> start works (res start path)
fs.writeFileSync(path.join(lcBroken, 'server.lua'), `AddEventHandler('lc:broken', function() print('lc-broken fixed and alive') end)\n`);
await rt.startResource('lc-broken');
check('fixed resource can be started again', rt.getResourceState('lc-broken') === 'running');
rt.dispatchLocal('lc:broken', []);
await sleep(50);
check('restarted resource works', mock.logs.some((l) => l.includes('lc-broken fixed and alive')));

console.log('== res command interface ==');
check("non-res command isn't intercepted", rt.handleAdminCommand(mock.players[1], '/helloworld') === false);
check('res list works from console', rt.handleAdminCommand({ id: 0 }, 'res list') === true
  && mock.logs.some((l) => l.includes('resources (') && l.includes('lc-alpha[running]')));
check('res list rejected from a player (no isAdmin)', rt.handleAdminCommand(mock.players[1], 'res list') === true
  && mock.errors.some((l) => l.includes('res\' commands require console or admin')));
check('res status reports state', rt.handleAdminCommand({ id: 0 }, 'res status lc-alpha') === true
  && mock.logs.some((l) => l.includes("resource 'lc-alpha': running")));
check('res stop works', rt.handleAdminCommand({ id: 0 }, 'res stop lc-alpha') === true
  && rt.getResourceState('lc-alpha') === 'stopped');
check('res start works', rt.handleAdminCommand({ id: 0 }, 'res start lc-alpha') === true);
await sleep(100);
check('res start actually started it', rt.getResourceState('lc-alpha') === 'running');
check('unknown res subcommand prints usage', rt.handleAdminCommand({ id: 0 }, 'res bogus') === true
  && mock.logs.some((l) => l.includes('usage: res')));
fs.rmSync(lcRoot, { recursive: true, force: true });

console.log(`\n==== RESULTS: ${passed} passed, ${failed} failed ====`);
process.exit(failed > 0 ? 1 : 0);
