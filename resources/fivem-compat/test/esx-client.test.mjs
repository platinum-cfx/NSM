// NSM ESX CLIENT BEHAVIOR TEST
//
// The ESX counterpart of qbcore-client.test.mjs — the other major framework.
// es_extended's REAL client scripts (unmodified clone) run in a fengari client
// runtime connected to the REAL server (index.js) with a REAL MariaDB:
//
//   * full join flow: client thread (NetworkIsPlayerActive) ->
//     esx:onPlayerJoined -> server identifier lookup -> NEW ROW in `users`
//     -> esx:playerLoaded -> client applies ESX.PlayerData, ESX.PlayerLoaded
//   * server -> client sync: xPlayer.setJob / addMoney update the client's
//     ESX.PlayerData and fire esx:setJob / esx:setMoney
//   * ESX.TriggerServerCallback (callback) and ESX.AwaitServerCallback
//     (promise) round-trip to a real ESX.RegisterServerCallback (xLib wire)
//   * disconnect: onPlayerDropped -> Core.SavePlayer persists money to `users`
//
// NOTE: es_extended hard-errors if qb-core is present (upstream guard) — this
// suite boots its own server root with ONLY the ESX stack.
//
// Precondition: MariaDB on :3307 with the esx-legacy schema imported
// (mysql fivem < real_resources/esx-legacy/[SQL]/legacy.sql — done once).
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
async function poll(fn, ms = 150, timeoutMs = 20000) {
  const start = Date.now();
  for (;;) {
    if (await fn()) return true;
    if (Date.now() - start > timeoutMs) return false;
    await sleep(ms);
  }
}

// 0. DB precondition + clean slate for this player's identifier
const mysql = (await import('node:module')).createRequire(import.meta.url)('../vendor/mysql2.bundle.cjs');
let db;
try {
  db = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' });
  await db.query('SELECT 1');
} catch (e) {
  console.error(`\nMariaDB not reachable on 127.0.0.1:3307 (${e.message}).\nRun: bash resources/fivem-compat/tools/setup-db.sh\n`);
  process.exit(1);
}
const IDENT = 'license:soc-esx';
await db.query('DELETE FROM users WHERE identifier = ?', [IDENT]);

// 1. Server root: the ESX stack ONLY (no qb-core — upstream guard)
const CORE = path.join(ROOT, '..', '..', 'real_resources', 'esx-legacy', '[core]');
const serverRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-esx-'));
const fr = path.join(serverRoot, 'fivem_resources');
fs.mkdirSync(fr, { recursive: true });
fs.symlinkSync(path.join(ROOT, '..', '..', 'real_resources', 'oxmysql'), path.join(fr, 'oxmysql'), 'dir');
fs.symlinkSync(path.join(CORE, 'esx_lib'), path.join(fr, 'esx_lib'), 'dir');
fs.symlinkSync(path.join(CORE, 'skinchanger'), path.join(fr, 'skinchanger'), 'dir');
fs.symlinkSync(path.join(CORE, 'es_extended'), path.join(fr, 'es_extended'), 'dir');
fs.symlinkSync(path.join(ROOT, 'fivem_resources', 'esx-probe'), path.join(fr, 'esx-probe'), 'dir');
fs.writeFileSync(path.join(serverRoot, 'mysql.json'), JSON.stringify({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' }));

// 2. alt-server shim
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
for (const r of ['oxmysql', 'esx_lib', 'skinchanger', 'es_extended', 'esx-probe']) {
  check(`${r} RUNNING`, runtime.getResourceState(r) === 'running', runtime.getResourceState(r));
}

const { instance } = await import('alt-server');
const payload = runtime.buildClientPayload();
const esxRes = payload.resources.find((r) => r.name === 'es_extended');
check('client payload has es_extended client scripts', esxRes && esxRes.scripts.length >= 8, String(esxRes && esxRes.scripts.length));
const preludeSrc = fs.readFileSync(path.join(ROOT, 'client/client-prelude.lua'), 'utf8');

// game-natives mock: enough for the join/spawn flow to complete; everything
// else warn-onces like a real client with unmapped natives
function makeNatives() {
  const t = () => true;
  return {
    playerPedId: () => 42,
    getGameTimer: () => Date.now(),
    networkIsPlayerActive: t,          // join thread gate
    hasModelLoaded: t,                 // skinchanger request loop
    isModelInCdimage: t,
    isModelValid: t,
    doesEntityExist: t,                // playerLoaded ped gate
    haveAllStreamingRequestsCompleted: t,
    hasCollisionLoadedAroundEntity: t, // spawn collision loop
    isScreenFadedOut: () => false,
    networkIsSessionStarted: t,
    shutdownLoadingScreen: () => {},
    shutdownLoadingScreenNui: () => {},
    doScreenFadeOut: () => {}, doScreenFadeIn: () => {},
    requestModel: () => {}, setModelAsNoLongerNeeded: () => {},
    setPlayerModel: () => {}, setPedDefaultComponentVariation: () => {},
    clearPedProp: () => {}, setPedComponentVariation: () => {},
    freezeEntityPosition: () => {},
    setEntityCoordsNoOffset: () => {}, setEntityHeading: () => {},
    requestCollisionAtCoord: () => {},
    networkResurrectLocalPlayer: () => {},
    clearPedTasksImmediately: () => {},
    setEntityHealth: () => {}, setPedArmour: () => {},
    setPedConfigFlag: () => {},
    setCanAttackFriendly: () => {}, networkSetFriendlyFireOption: () => {},
    getEntityCoords: () => [1034.2, -3141.6, 13.4],
  };
}

// 4. Connect the client
const ep = instance.connectPlayer({ id: 1, name: 'austi', socialId: 'soc-esx', hwidHash: 'hwid-esx', ip: '127.0.0.1' });
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

const cprobe = async () => JSON.parse((await vm.callGlobal('__callExport', 'esx-probe', 'GetProbeJson', '[]')) || '{}');
const sprobe = async () => JSON.parse((await runtime.callExportJsonAsync('esx-probe', 'GetProbeJson', [])).value[0] || '{}');

// 5. The full join flow (client thread -> server DB -> playerLoaded)
let sp;
check('server: esx:playerLoaded fired (xPlayer created)',
  await poll(async () => { sp = await sprobe(); return sp.loaded === true; }), JSON.stringify(sp));
check('server: identifier resolved from alt identifiers', sp && sp.identifier === IDENT, JSON.stringify(sp));

const row = (await db.query('SELECT identifier, accounts, job, job_grade, skin FROM users WHERE identifier = ?', [IDENT]))[0][0];
check('server: NEW ROW in users (real MariaDB)', !!row, 'no users row');
check('server: accounts stored as JSON', row && (() => { try { return JSON.parse(row.accounts).money !== undefined; } catch { return false; } })(), row && row.accounts);
check('server: default job persisted (unemployed)', row && row.job === 'unemployed', row && row.job);

let cp;
check('client: ESX.PlayerLoaded = true (join flow completed)',
  await poll(async () => { cp = await cprobe(); return cp.playerLoaded === true; }, 200, 25000), JSON.stringify(cp));
check('client: ESX.PlayerData.job applied', cp && cp.jobName === 'unemployed', JSON.stringify(cp && cp.jobName));
check('client: ESX.PlayerData.money applied', cp && typeof cp.money === 'number', JSON.stringify(cp && cp.money));
check('client: ESX.PlayerData.coords applied', cp && cp.coords && typeof cp.coords.x === 'number', JSON.stringify(cp && cp.coords));

// 6. server -> client sync: setJob
await runtime.callExportJsonAsync('esx-probe', 'SetJob', ['taxi', 0]);
check("client: xPlayer.setJob('taxi') reflected in ESX.PlayerData.job",
  await poll(async () => { cp = await cprobe(); return cp.pdJob === 'taxi'; }), JSON.stringify(cp && cp.pdJob));
check("client: 'esx:setJob' event fired with the new job",
  cp && Array.isArray(cp.setJobEvents) && cp.setJobEvents.includes('taxi'), JSON.stringify(cp && cp.setJobEvents));

// 7. server -> client sync: addMoney
const moneyBefore = cp.pdMoney;
await runtime.callExportJsonAsync('esx-probe', 'AddMoney', [750]);
check('client: xPlayer.addMoney(750) reflected in ESX.PlayerData.money',
  await poll(async () => { cp = await cprobe(); return cp.pdMoney === moneyBefore + 750; }), `${moneyBefore} -> ${cp && cp.pdMoney}`);
check("client: 'esx:setMoney' event fired", cp && cp.setMoneyEvents >= 1, JSON.stringify(cp && cp.setMoneyEvents));

// 8. server callbacks over the xLib wire
check('ESX.TriggerServerCallback (callback form) returned 42',
  await poll(async () => { cp = await cprobe(); return cp.cbResult === 42; }), JSON.stringify(cp && cp.cbResult));
check('ESX.AwaitServerCallback (promise form) returned 84',
  cp && cp.cbAwait === 84, JSON.stringify(cp && cp.cbAwait));

// 9. disconnect -> SavePlayer -> money persisted to users
instance.disconnectPlayer(1, 'Left the server');
check('server: playerDropped observed',
  await poll(async () => { sp = await sprobe(); return sp.dropped === true; }));
await sleep(600);
const row2 = (await db.query('SELECT accounts FROM users WHERE identifier = ?', [IDENT]))[0][0];
const savedMoney = row2 && (() => { try { return JSON.parse(row2.accounts).money; } catch { return undefined; } })();
check('server: SavePlayer persisted money to users on disconnect', savedMoney === moneyBefore + 750, `saved=${savedMoney}`);

// 10. no unexpected client errors (warn-once missing natives are expected)
const unexpected = instance.errors.filter((e) =>
  !/not implemented on NSM yet|native not found|unmapped FiveM key/.test(e));
check('no unexpected client errors', unexpected.length === 0, unexpected.slice(0, 4).join(' | '));
if (unexpected.length) console.error('  unexpected:', JSON.stringify(unexpected.slice(0, 8), null, 1));

console.log(`\n==== ESX CLIENT RESULTS: ${passed} passed, ${failed} failed ====`);
await db.end();
process.exit(failed ? 1 : 0);
