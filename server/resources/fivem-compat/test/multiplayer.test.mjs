// NSM MULTIPLAYER + PERSISTENCE INTEGRATION TEST
//
// This is the strongest multiplayer evidence available without a real alt:V
// server binary + GTA V clients in this sandbox:
//
//   REAL, exercised end-to-end in one process:
//     - index.js — the REAL server entry (unchanged production code path)
//     - cfx/client-net.js transport wiring (player-id mapping, envelopes)
//     - CfxCompatRuntime — real qb-core server scripts (unmodified clone)
//     - REAL MariaDB through the vendored mysql2 adapter (oxmysql semantics)
//     - TWO real fengari client runtimes running the real client prelude +
//       qb-core's REAL client scripts + mp-demo, through the real
//       fivem-client boot + handshake (__fivem:ready -> __fivem:init)
//
//   MOCKED (labeled, no way around it here):
//     - the alt:V module + transport (in-process virtual network)
//     - game natives + entities (mock playerPedId/getEntityCoords/...)
//     - webviews
//   On-device verification (real alt:V + GTA V): docs/CLIENT_COMPATIBILITY.md §7.
//
// Precondition: MariaDB up on 127.0.0.1:3307 (bash tools/setup-db.sh).
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createFengariVM } from '../client/vm-fengari.mjs';
import { createFiveMClientRuntime } from '../client/core.mjs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}${extra !== undefined ? ' — ' + String(extra) : ''}`); }
}
async function poll(fn, ms = 150, timeoutMs = 4000) {
  const start = Date.now();
  for (;;) {
    if (await fn()) return true;
    if (Date.now() - start > timeoutMs) return false;
    await sleep(ms);
  }
}

// ---------------------------------------------------------------------------
// 0. DB precondition (fail loudly, never fake)
// ---------------------------------------------------------------------------
const mysql = require('../vendor/mysql2.bundle.cjs');
let db;
try {
  db = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' });
  await db.query('SELECT 1');
} catch (e) {
  console.error(`\nMariaDB not reachable on 127.0.0.1:3307 (${e.message}).
Run:  bash resources/fivem-compat/tools/setup-db.sh
This test only runs against a REAL database — it does not fall back to mocks.\n`);
  process.exit(1);
}
const q = async (sql, params) => (await db.query(sql, params))[0];
await db.query('DELETE FROM players');
await db.query('DELETE FROM mp_demo_notes');

// ---------------------------------------------------------------------------
// 1. Temp server root: mysql.json + fivem_resources (oxmysql stub, qb-core,
//    mp-demo as symlinks/dirs — same layout a real deployment uses)
// ---------------------------------------------------------------------------
const serverRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-mp-'));
const fr = path.join(serverRoot, 'fivem_resources');
fs.mkdirSync(path.join(fr, 'oxmysql'), { recursive: true });
fs.writeFileSync(path.join(fr, 'oxmysql', 'fxmanifest.lua'),
  "fx_version 'cerulean'\ngame 'gta5'\ndescription 'stub: MySQL API provided natively by NSM cfx-compat'\n");
fs.symlinkSync(path.join(ROOT, '..', '..', 'resource_store', 'qb-core'), path.join(fr, 'qb-core'), 'dir');
fs.symlinkSync(path.join(ROOT, 'fivem_resources', 'mp-demo'), path.join(fr, 'mp-demo'), 'dir');
fs.writeFileSync(path.join(serverRoot, 'mysql.json'),
  JSON.stringify({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' }, null, 2));

// ---------------------------------------------------------------------------
// 2. alt-server shim: the REAL index.js does `import * as alt from
//    'alt-server'` — provide the mock module through normal node resolution.
// ---------------------------------------------------------------------------
const nm = path.join(ROOT, 'node_modules', 'alt-server');
fs.mkdirSync(nm, { recursive: true });
fs.writeFileSync(path.join(nm, 'package.json'), JSON.stringify({ name: 'alt-server', type: 'module', main: 'index.js' }));
fs.writeFileSync(path.join(nm, 'index.js'), `// TEST SHIM — created by test/multiplayer.test.mjs (gitignored)
import { makeAltServerMock } from '../../test/mock-alt-server.js';
export const instance = makeAltServerMock();
export const log = instance.alt.log;
export const logError = instance.alt.logError;
export const Player = instance.alt.Player;
export const Vector3 = instance.alt.Vector3;
export const Vehicle = instance.alt.Vehicle;
export const on = instance.alt.on;
export const onClient = instance.alt.onClient;
export const emitClient = instance.alt.emitClient;
export const emitAllClients = instance.alt.emitAllClients;
`);

// ---------------------------------------------------------------------------
// 3. Boot the REAL server (index.js main(): mysql adapter, runtime, wiring,
//    resource discovery, loadAll, lifecycle)
// ---------------------------------------------------------------------------
process.chdir(serverRoot);
const { ready } = await import('../index.js');
const runtime = await ready;
check('server booted (real index.js main())', !!runtime);
check('qb-core RUNNING (real scripts, real DB)', runtime.getResourceState('qb-core') === 'running');
check('mp-demo RUNNING', runtime.getResourceState('mp-demo') === 'running');
check('oxmysql stub RUNNING (satisfies qb-core dependency)', runtime.getResourceState('oxmysql') === 'running');

const { instance } = await import('alt-server');
const payload = runtime.buildClientPayload();
const preludeSrc = fs.readFileSync(path.join(ROOT, 'client/client-prelude.lua'), 'utf8');
check('client payload has qb-core + mp-demo scripts',
  payload.resources.some((r) => r.name === 'qb-core' && r.scripts.length >= 10) &&
  payload.resources.some((r) => r.name === 'mp-demo' && r.scripts.length === 1));

// client natives mock — game surface only; anything else warn-once (like the
// real resource would see as missing on-device until mapped)
function makeNatives() {
  return {
    playerPedId: () => 42,
    getEntityCoords: () => [1034.2, -3141.6, 13.4],
    getEntityHeading: () => 90.0,
    setEntityCoords: () => true,
    setEntityHeading: () => true,
    networkIsSessionStarted: () => true,
    shutdownLoadingScreenNui: () => true,
    setCanAttackFriendly: () => true,
    networkSetFriendlyFireOption: () => true,
    setPedCoordsKeepVehicle: () => true,
  };
}

async function connectClient(spec) {
  const ep = instance.connectPlayer(spec);
  const alt = instance.makeClientAlt(ep);
  const vm = createFengariVM();
  const rt = createFiveMClientRuntime({
    vm, alt, natives: makeNatives(), payload, preludeSrc,
    config: { convars: {} },
    log: (m) => instance.logs.push(`[client ${spec.id}] ${m}`),
    logError: (m) => instance.errors.push(`[client ${spec.id}] ${m}`),
  });
  await rt.boot();
  const state = async () => JSON.parse((await vm.callGlobal('__callExport', 'mp-demo', 'getStateJson', '[]')) || '{}');
  return { ep, vm, rt, state, alt };
}

// ---------------------------------------------------------------------------
// 4. Player 1 (austi) connects: handshake + qb-core lifecycle
// ---------------------------------------------------------------------------
console.log('== player 1 (austi) connects ==');
const c1 = await connectClient({ id: 1, name: 'austi', socialId: 'soc-123', hwidHash: 'hwid-abc', ip: '127.0.0.1' });
check('join handshake: __fivem:init -> GetPlayerServerId() = 1',
  await poll(async () => (await c1.state()).ownServerId === 1));

const login1 = await runtime.callExportJsonAsync('mp-demo', 'login', [1, null, { citizenid: 'NSM00001', cid: 1 }]);
check('qb-core QBCore.Player.Login (new character) returns true', login1.ok && login1.value[0] === true, JSON.stringify(login1));

await sleep(300);
const rows1 = await q('SELECT citizenid, license, name, money, job FROM players WHERE citizenid = ?', ['NSM00001']);
const row1 = rows1[0];
check('Login -> CreatePlayer -> Save wrote a REAL row to MariaDB', !!row1, 'no players row');
check('license persisted from alt identifiers', row1 && row1.license === 'license:soc-123', row1 && row1.license);
check('money serialized as JSON', row1 && typeof row1.money === 'string' && JSON.parse(row1.money).cash !== undefined, row1 && row1.money);

const moneyBefore = (await runtime.callExportJsonAsync('mp-demo', 'getMoney', [1])).value[0];
await runtime.callExportJsonAsync('mp-demo', 'addMoney', [1, 2500]);
const moneyAfter = (await runtime.callExportJsonAsync('mp-demo', 'getMoney', [1])).value[0];
check('Player.Functions.AddMoney(2500)', moneyAfter === moneyBefore + 2500, `${moneyBefore} -> ${moneyAfter}`);

const jobRes = await runtime.callExportJsonAsync('mp-demo', 'setJob', [1, 'trucker', 0]);
check('Player.Functions.SetJob(trucker)', jobRes.ok && jobRes.value[0] === true, JSON.stringify(jobRes));

// targeted TriggerClientEvent from qb-core's own flow (UpdateClient)
check('qb-core UpdateClient reached player 1 (QBCore:Client:OnPlayerUpdated envelope)',
  await poll(async () => c1.ep.delivered.some((d) => d.name === '__fivem:net' && d.args[0] === 'QBCore:Client:OnPlayerUpdated')));

// ---------------------------------------------------------------------------
// 5. Player 2 (carmone) connects simultaneously
// ---------------------------------------------------------------------------
console.log('== player 2 (carmone) connects ==');
const c2 = await connectClient({ id: 7, name: 'carmone', socialId: 'soc-777', hwidHash: 'hwid-def', ip: '10.0.0.2' });
check('player 2 handshake: GetPlayerServerId() = 7',
  await poll(async () => (await c2.state()).ownServerId === 7));
const login2 = await runtime.callExportJsonAsync('mp-demo', 'login', [7, null, { citizenid: 'NSM00002', cid: 2 }]);
check('qb-core Login for player 2', login2.ok && login2.value[0] === true, JSON.stringify(login2));

// ---------------------------------------------------------------------------
// 6. Client -> server -> DB + targeted reply (source identity)
// ---------------------------------------------------------------------------
console.log('== bidirectional events + DB writes ==');
check('player 1 client script pinged the server (source identity in DB)',
  await poll(async () => {
    const rows = await q('SELECT src, name, note FROM mp_demo_notes WHERE src = 1');
    return rows.some((r) => r.name === 'austi' && r.note === 'hello-from-1');
  }));
check('player 1 got the TARGETED pong (only the sender)',
  await poll(async () => (await c1.state()).pongs.includes('pong:austi:hello-from-1')));
const st2a = await c2.state();
check('player 2 received only its OWN pong (no targeted leak from player 1)',
  st2a.pongs.every((p) => p.startsWith('pong:carmone:')), JSON.stringify(st2a.pongs));

// broadcast (-1) from player 2 reaches BOTH clients
await c2.vm.callGlobal('__callExport', 'mp-demo', 'broadcast', '["hello everyone"]');
check('broadcast from player 2 reached player 1',
  await poll(async () => (await c1.state()).bcasts.includes('hello everyone')));
check('broadcast from player 2 reached player 2',
  await poll(async () => (await c2.state()).bcasts.includes('hello everyone')));

// player 2's own ping recorded too
check('player 2 client ping recorded in DB',
  await poll(async () => {
    const rows = await q('SELECT src, name, note FROM mp_demo_notes WHERE src = 7');
    return rows.some((r) => r.note === 'hello-from-7');
  }));

// ---------------------------------------------------------------------------
// 7. qb-core's REAL client event flow (server reply -> qb-core client handler
//    -> LocalPlayer.state:set('isLoggedIn'))
// ---------------------------------------------------------------------------
check("qb-core client flow: OnPlayerLoaded -> isLoggedIn statebag",
  await poll(async () => (await c1.state()).isLoggedIn === true));

// ---------------------------------------------------------------------------
// 8. Statebags: client replicated write + server write, both directions
// ---------------------------------------------------------------------------
check('client 1 replicated statebag write reached player 2 (bag "1")',
  await poll(async () => (await c2.state()).stateSeen.some((s) => s.bag === '1' && s.value === 'set-by-client-1')));
check('server store holds the client-written bag (authoritative)',
  await poll(() => {
    const m = instance.syncedMeta.get(1);
    return m && m.get('mpdemo') === '"set-by-client-1"'; // stored as JSON like every statebag value
  }));
await runtime.runLua('mp-demo', 'Player(1).state.mpdemo = 42');
check('server statebag write reached player 1',
  await poll(async () => (await c1.state()).stateSeen.some((s) => s.bag === '1' && s.value === 42)));
check('server statebag write reached player 2',
  await poll(async () => (await c2.state()).stateSeen.some((s) => s.bag === '1' && s.value === 42)));
// ---------------------------------------------------------------------------
// 9. Command from a client (ExecuteCommand -> chat bridge)
// ---------------------------------------------------------------------------
c1.ep.sendToServer('__fivem:cmd', '/mpnote hi-from-chat');
check('client ExecuteCommand ran the server command (targeted reply)',
  await poll(async () => (await c1.state()).cmdoks.includes('recorded hi-from-chat')));

// ---------------------------------------------------------------------------
// 10. Disconnect -> qb-core playerDropped -> REAL save to MariaDB
// ---------------------------------------------------------------------------
console.log('== disconnect + persistence ==');
const finalMoney = (await runtime.callExportJsonAsync('mp-demo', 'getMoney', [1])).value[0];
instance.disconnectPlayer(1, 'Left the server');
check('qb-core playerDropped saved money+job to MariaDB',
  await poll(async () => {
    const r = (await q('SELECT money, job FROM players WHERE citizenid = ?', ['NSM00001']))[0];
    return r && JSON.parse(r.money).cash === finalMoney && JSON.parse(r.job).name === 'trucker';
  }, 200, 5000));
const saved = (await q('SELECT money, job FROM players WHERE citizenid = ?', ['NSM00001']))[0];
console.log(`  (saved row: cash=${JSON.parse(saved.money).cash}, job=${JSON.parse(saved.job).name})`);

// ---------------------------------------------------------------------------
// 11. Reconnect player 1 (fresh client runtime + fresh VM): qb-core re-login
//     loads the persisted character from MariaDB
// ---------------------------------------------------------------------------
console.log('== reconnect: persistence round-trip ==');
const c1b = await connectClient({ id: 1, name: 'austi', socialId: 'soc-123', hwidHash: 'hwid-abc', ip: '127.0.0.1' });
check('reconnected client re-ran the handshake (id 1)',
  await poll(async () => (await c1b.state()).ownServerId === 1));
const relogin = await runtime.callExportJsonAsync('mp-demo', 'login', [1, 'NSM00001', null]);
check('qb-core Login(citizenid) loads the EXISTING character', relogin.ok && relogin.value[0] === true, JSON.stringify(relogin));
const moneyReloaded = (await runtime.callExportJsonAsync('mp-demo', 'getMoney', [1])).value[0];
check('money persisted across disconnect/reconnect (real DB round-trip)', moneyReloaded === finalMoney, `${moneyReloaded} != ${finalMoney}`);
check('reconnected client executed its resources again (fresh DB ping)',
  await poll(async () => {
    const rows = await q('SELECT note FROM mp_demo_notes WHERE src = 1 AND note = ?', ['hello-from-1']);
    return rows.length >= 2;
  }));

// player 2 unaffected by player 1's disconnect/reconnect
check('player 2 still connected throughout (bcasts intact)', (await c2.state()).bcasts.includes('hello everyone'));

// ---------------------------------------------------------------------------
// 12. Client script health: every resource script must have loaded
// ---------------------------------------------------------------------------
const scriptFailures = instance.errors.filter((e) => e.includes('script failed'));
check('ALL client scripts loaded (qb-core client + shared, mp-demo) in both client runtimes',
  scriptFailures.length === 0, scriptFailures.join(' | '));
const bootOks = instance.logs.filter((l) => l.includes('boot complete:'));
check('both client runtimes report full boot', bootOks.length >= 3, `saw ${bootOks.length} boot-complete logs`); // c1, c2, c1b

// what warn-once native gaps did we hit? (informational, mocked-natives only)
const nativeGaps = [...new Set(instance.errors.filter((e) => e.includes('native') && e.includes('missing')).map((e) => e.split("'")[1]))];
console.log(`  (informational: warn-once missing mocked natives: ${nativeGaps.length ? nativeGaps.join(', ') : 'none'})`);

// unexpected errors (exclude the known-benign native warnings)
const unexpected = instance.errors.filter((e) => !e.includes('native') && !e.includes('missing'));
check('no unexpected client errors', unexpected.length === 0, unexpected.slice(0, 5).join(' | '));

console.log(`\n==== MULTIPLAYER RESULTS: ${passed} passed, ${failed} failed ====`);
await db.end();
process.exit(failed ? 1 : 0);
