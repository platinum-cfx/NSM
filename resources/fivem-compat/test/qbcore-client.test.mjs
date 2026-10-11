// NSM QBCORE CLIENT BEHAVIOR TEST
//
// Step 5 evidence: qb-core's REAL client scripts (unmodified clone) don't just
// LOAD — their actual behavior is verified through a full client runtime
// (fengari) connected to the REAL server (index.js) with a REAL MariaDB:
//
//   * Login -> server UpdateClient -> client 'QBCore:Client:OnPlayerUpdated'
//     -> QBCore.PlayerData applied on the client + local re-fire of
//     'QBCore:Player:SetPlayerData' (the event every qb resource listens to)
//   * AddMoney -> client PlayerData.money.cash updates (server -> client sync)
//   * SetJob -> client PlayerData.job updates AND qb-core's own
//     'QBCore:Client:OnJobUpdate' local event fires
//   * QBCore.Functions.TriggerCallback BOTH forms (promise + Citizen.Await,
//     and callback) round-trip to a real server CreateCallback
//   * QBCore.Functions.Notify -> SendNUIMessage (NUI shim)
//
// The probe resource (fivem_resources/qb-probe) contains no mocks of qb-core;
// it only observes and calls the real framework.
//
// Precondition: MariaDB up on 127.0.0.1:3307 (bash tools/setup-db.sh).
import * as fs from 'fs'; import * as os from 'os'; import * as path from 'path';
import { createFengariVM } from '../client/vm-fengari.mjs';
import { createFiveMClientRuntime } from '../client/core.mjs';

const ROOT = path.join(path.dirname(import.meta.url).replace('file://', ''), '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}${extra !== undefined ? ' — ' + String(extra) : ''}`); }
}
async function poll(fn, ms = 150, timeoutMs = 5000) {
  const start = Date.now();
  for (;;) {
    if (await fn()) return true;
    if (Date.now() - start > timeoutMs) return false;
    await sleep(ms);
  }
}

// 0. DB precondition
const mysql = (await import('node:module')).createRequire(import.meta.url)('../vendor/mysql2.bundle.cjs');
let db;
try {
  db = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' });
  await db.query('SELECT 1');
} catch (e) {
  console.error(`\nMariaDB not reachable on 127.0.0.1:3307 (${e.message}).\nRun: bash resources/fivem-compat/tools/setup-db.sh\n`);
  process.exit(1);
}
const q = async (sql, params) => (await db.query(sql, params))[0];
await db.query('DELETE FROM players WHERE citizenid LIKE ?', ['QBP%']);

// 1. Server root with real resources
const serverRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-qbc-'));
const fr = path.join(serverRoot, 'fivem_resources');
fs.mkdirSync(path.join(fr, 'oxmysql'), { recursive: true });
fs.writeFileSync(path.join(fr, 'oxmysql', 'fxmanifest.lua'), "fx_version 'cerulean'\ngame 'gta5'\n");
fs.symlinkSync(path.join(ROOT, '..', '..', 'real_resources', 'qb-core'), path.join(fr, 'qb-core'), 'dir');
fs.symlinkSync(path.join(ROOT, 'fivem_resources', 'mp-demo'), path.join(fr, 'mp-demo'), 'dir');
fs.symlinkSync(path.join(ROOT, 'fivem_resources', 'qb-probe'), path.join(fr, 'qb-probe'), 'dir');
fs.writeFileSync(path.join(serverRoot, 'mysql.json'), JSON.stringify({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' }));

// 2. alt-server shim -> the test mock instance (in-process transport)
const nm = path.join(ROOT, 'node_modules', 'alt-server');
fs.mkdirSync(nm, { recursive: true });
fs.writeFileSync(path.join(nm, 'package.json'), '{"name":"alt-server","type":"module","main":"index.js"}');
fs.writeFileSync(path.join(nm, 'index.js'), `import { makeAltServerMock } from '../../test/mock-alt-server.js';
export const instance = makeAltServerMock();
export const log = instance.alt.log; export const logError = instance.alt.logError;
export const Player = instance.alt.Player; export const Vector3 = instance.alt.Vector3; export const Vehicle = instance.alt.Vehicle;
export const on = instance.alt.on; export const onClient = instance.alt.onClient; export const emitClient = instance.alt.emitClient; export const emitAllClients = instance.alt.emitAllClients;
`);

// 3. Boot the REAL server
process.chdir(serverRoot);
const { ready } = await import(path.join(ROOT, 'index.js'));
const runtime = await ready;
check('server booted (real index.js main())', !!runtime);
for (const r of ['qb-core', 'mp-demo', 'qb-probe']) {
  check(`${r} RUNNING`, runtime.getResourceState(r) === 'running');
}

const { instance } = await import('alt-server');
const payload = runtime.buildClientPayload();
check('client payload includes qb-probe', payload.resources.some((r) => r.name === 'qb-probe'));
const preludeSrc = fs.readFileSync(path.join(ROOT, 'client/client-prelude.lua'), 'utf8');

function makeNatives() {
  return {
    playerPedId: () => 42,
    getEntityCoords: () => [1034.2, -3141.6, 13.4],
    networkIsSessionStarted: () => true,
    shutdownLoadingScreenNui: () => true,
    setCanAttackFriendly: () => true,
    networkSetFriendlyFireOption: () => true,
  };
}

// 4. Connect the client runtime
const ep = instance.connectPlayer({ id: 1, name: 'austi', socialId: 'soc-qbp', hwidHash: 'hwid-qbp', ip: '127.0.0.1' });
const alt = instance.makeClientAlt(ep);
const vm = createFengariVM();
const rt = createFiveMClientRuntime({
  vm, alt, natives: makeNatives(), payload, preludeSrc,
  config: { convars: {} },
  log: (m) => instance.logs.push(`[client 1] ${m}`),
  logError: (m) => instance.errors.push(`[client 1] ${m}`),
});
await rt.boot();
check('join handshake delivered (__fivem:init)',
  await poll(() => ep.delivered.some((d) => d.name === '__fivem:init')));

const probe = async () => JSON.parse((await vm.callGlobal('__callExport', 'qb-probe', 'getProbeJson', '[]')) || '{}');

// 5. Login -> full data sync to the client
const CITIZEN = 'QBP00001';
const login = await runtime.callExportJsonAsync('mp-demo', 'login', [1, null, { citizenid: CITIZEN, cid: 1 }]);
check('Login (new character) returns true', login.ok && login.value[0] === true, JSON.stringify(login));

check('client received QBCore:Client:OnPlayerUpdated envelope',
  await poll(() => ep.delivered.some((d) => d.name === '__fivem:net' && d.args[0] === 'QBCore:Client:OnPlayerUpdated')));

let p;
check('qb-core client applied PlayerData (citizenid on client)',
  await poll(async () => { p = await probe(); return p.citizenid === CITIZEN; }));
check("'QBCore:Player:SetPlayerData' local event fired (what qb resources listen to)",
  p && p.setDataCount >= 1, JSON.stringify(p));

const cash0 = p && p.cash;
check('client PlayerData.money.cash present after Login', typeof cash0 === 'number', String(cash0));
const job0 = p && p.job;
check('client PlayerData.job present after Login', typeof job0 === 'string' && job0.length > 0, String(job0));

// 6. AddMoney -> client sees the new cash (server -> client sync, applied)
await runtime.callExportJsonAsync('mp-demo', 'addMoney', [1, 1234]);
check('AddMoney(1234) reflected in client PlayerData.money.cash',
  await poll(async () => { p = await probe(); return p.cash === cash0 + 1234; }), `${cash0} -> ${p && p.cash}`);

// 7. SetJob -> client PlayerData.job + qb-core's own OnJobUpdate local event
await runtime.callExportJsonAsync('mp-demo', 'setJob', [1, 'taxi', 2]);
check("SetJob('taxi') reflected in client PlayerData.job",
  await poll(async () => { p = await probe(); return p.job === 'taxi'; }), String(p && p.job));
check("qb-core client fired 'QBCore:Client:OnJobUpdate' with the new job",
  p && Array.isArray(p.jobEvents) && p.jobEvents.includes('taxi'), JSON.stringify(p && p.jobEvents));

// 8. TriggerCallback both forms (real server CreateCallback round-trip)
check('TriggerCallback promise form (Citizen.Await) returned 42',
  await poll(async () => { p = await probe(); return p.cbPromise === 42; }), JSON.stringify(p && p.cbPromise));
check('TriggerCallback callback form returned 100',
  await poll(async () => { p = await probe(); return p.cbCallback === 100; }), JSON.stringify(p && p.cbCallback));

// 9. Notify -> SendNUIMessage (no error inside qb-core's real function)
check('QBCore.Functions.Notify ran without error', p && p.notifyOk === true, p && p.notifyErr);

// 10. no unexpected client errors
const unexpected = instance.errors.filter((e) => !/not implemented on NSM yet/.test(e));
check('no unexpected client errors', unexpected.length === 0, unexpected.slice(0, 3).join(' | '));

console.log(`\n==== QBCORE CLIENT RESULTS: ${passed} passed, ${failed} failed ====`);
await db.end();
process.exit(failed ? 1 : 0);
