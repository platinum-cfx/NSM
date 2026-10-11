// End-to-end test of the NSM cfx-compat runtime (v3: one VM, live exports)
// against a mock alt:V server.
import { CfxCompatRuntime, joaat } from '../cfx/runtime.js';
import { makeMockAlt } from './mock-alt.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const mock = makeMockAlt();
const rt = new CfxCompatRuntime(mock);

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}`); }
}

console.log('== init ==');
await rt.init();
check('runtime initialized', !!rt.factory);
check('single engine created', !!rt.lua);

console.log('== load FiveM resources ==');
const resDir = path.join(__dirname, '..', 'fivem_resources', 'example-hello');
const callerDir = path.join(__dirname, '..', 'fivem_resources', 'example-caller');
check('fxmanifest.lua exists', fs.existsSync(path.join(resDir, 'fxmanifest.lua')));
await rt.loadResource('example-hello', resDir);
await rt.loadResource('example-caller', callerDir);

check('both resources loaded', rt.engines.has('example-hello') && rt.engines.has('example-caller'));
check('server script ran (loaded OK message)', mock.logs.some((l) => l.includes('example-hello server.lua loaded OK')));
check('example-caller loaded', mock.logs.some((l) => l.includes('example-caller loaded')));
check('client_scripts warning emitted', mock.logs.some((l) => l.includes('IGNORED')));
check('one VM shared by both resources', rt.engines.get('example-hello').lua === rt.lua && rt.engines.get('example-caller').lua === rt.lua);
check('print carries resource prefix', mock.logs.some((l) => l.includes('[example-hello]') || l.includes('example-hello')));

console.log('== net event (client -> server Lua) ==');
mock.netListeners.get('nsm:hello')[0](mock.players[0], 'hi from the client');
check('Lua net handler used GetPlayerName(source)', mock.logs.some((l) => l.includes('nsm:hello from austi (src 1)')));
check('TriggerClientEvent broadcast (-1) sent', mock.clientEvents.some((e) => e.name === 'nsm:welcome' && e.target === -1));

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

console.log(`\n==== RESULTS: ${passed} passed, ${failed} failed ====`);
process.exit(failed > 0 ? 1 : 0);
