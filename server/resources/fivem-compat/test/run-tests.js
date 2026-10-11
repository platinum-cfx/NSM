// End-to-end test of the NSM cfx-compat runtime (v2) against a mock alt:V server.
import { CfxCompatRuntime, joaat } from '../resources/fivem-compat/cfx/runtime.js';
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
check('GetHashKey (joaat) works', mock.logs.some((l) => l.includes(`hash of "austi" = ${joaat('austi')}`)));

// JSON roundtrip through the Lua VM
const lua = rt.engines.get('example-hello').lua;
await lua.doString(`
    local src = __jsonEncode({ a = 1, list = { 10, 20, 30 }, s = 'he said "hi"', nested = { ok = true } })
    local t = __jsonDecode(src)
    __j1 = t.a
    __j2 = t.list[2]
    __j3 = t.s
    __j4 = tostring(t.nested.ok)
`);
check('json roundtrip: number', lua.global.get('__j1') === 1);
check('json roundtrip: array', lua.global.get('__j2') === 20);
check('json roundtrip: escaped string', lua.global.get('__j3') === 'he said "hi"');
check('json roundtrip: nested bool', lua.global.get('__j4') === 'true');

console.log('== player natives ==');
await lua.doString(`__n = #GetPlayers() __p2 = GetPlayerName(7) __idn = #GetPlayerIdentifiers(1)`);
check('GetPlayers() = 2', lua.global.get('__n') === 2);
check('GetPlayerName(7) = carmone', lua.global.get('__p2') === 'carmone');
check('GetPlayerIdentifiers(1) = 3 entries', lua.global.get('__idn') === 3);

console.log('== exports (cross-resource) ==');
await sleep(200);
check('cross-resource export call worked', mock.logs.some((l) => l.includes('19 + 23 = 42')));

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
await lua.doString(`AddEventHandler('cfxtest:local', function(a, b) print('local event got ' .. tostring(a) .. ',' .. tostring(b)) end)`);
rt.dispatchLocal('cfxtest:local', ['x', 42]);
check('local event dispatched to Lua', mock.logs.some((l) => l.includes('local event got x,42')));

console.log('== promises / Citizen.Await ==');
await lua.doString(`
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
await lua.doString(`
  PerformHttpRequest('https://api.example.test/status', function(status, body, headers)
    print('http: ' .. status .. ' body=' .. body .. ' ct=' .. tostring(headers['content-type']))
  end, 'GET')
`);
await sleep(200);
check('PerformHttpRequest callback fired', mock.logs.some((l) => l.includes('http: 200 body={"ok":true} ct=application/json')));

console.log('== native stubs (full Cfx set) ==');
check('stubs installed', mock.logs.some((l) => l.includes('native stubs installed:')));
await lua.doString(`
  __stubret = SetPlayerWantedLevel(1, false)
  __handmade = GetPlayerName(7)
  __stubret2 = SetPlayerWantedLevel(2, false)
`);
check('stub native returns nil', lua.global.get('__stubret') === null || lua.global.get('__stubret') === undefined);
check('stub warns exactly once', mock.logs.filter((l) => l.includes('native SetPlayerWantedLevel is not implemented')).length === 1);
check('hand-implemented native wins over stub', lua.global.get('__handmade') === 'carmone');

console.log('== lifecycle events ==');
await lua.doString(`
  RegisterServerEvent('nsm:netevt')
  AddEventHandler('playerDropped', function(reason)
    print('player dropped: src=' .. tostring(source) .. ' reason=' .. tostring(reason))
  end)
`);
rt.fireLifecycle('playerDropped', mock.players[0], ['Exiting']);
check('playerDropped fired with source set', mock.logs.some((l) => l.includes('player dropped: src=1 reason=Exiting')));
check('RegisterServerEvent alias works', rt.wiredNet.has('nsm:netevt'));


console.log(`\n==== RESULTS: ${passed} passed, ${failed} failed ====`);
process.exit(failed > 0 ? 1 : 0);
