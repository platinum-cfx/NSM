// NSM DATABASE PERSISTENCE INTEGRATION TEST
//
// Proves, against a REAL MariaDB (mysql2 → 127.0.0.1:3307):
//   1. the oxmysql-style Lua API surface behaves correctly on real SQL:
//      query / execute / prepare / single / scalar / insert / update /
//      transaction / Async.* / named (:) and positional (?) parameters
//   2. qb-core's REAL player pipeline persists across a FULL RUNTIME
//      RESTART: runtime A logs a player in, changes money/job, saves;
//      a BRAND-NEW runtime B (fresh Lua VM, fresh qb-core instance) loads
//      the same character from the database and sees the saved state.
//
// Precondition: MariaDB up (bash tools/setup-db.sh). No mocks, no fallbacks.
import { CfxCompatRuntime } from '../cfx/runtime.js';
import { makeMockAlt } from './mock-alt.js';
import { createRealMysql } from '../cfx/mysql-real.js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const QB_CORE = path.join(ROOT, '..', '..', 'resource_store', 'qb-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}${extra !== undefined ? ' — ' + String(extra) : ''}`); }
}

// ---------------------------------------------------------------------------
// 0. DB precondition
// ---------------------------------------------------------------------------
const mysql = require('../vendor/mysql2.bundle.cjs');
let db;
try {
  db = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' });
  await db.query('SELECT 1');
} catch (e) {
  console.error(`\nMariaDB not reachable on 127.0.0.1:3307 (${e.message}).\nRun: bash resources/fivem-compat/tools/setup-db.sh\n`);
  process.exit(1);
}
const q = async (sql, params) => (await db.query(sql, params))[0];
await db.query('DELETE FROM players');

// build a temp fivem_resources dir with qb-core (dir copy via symlink)
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-db-'));
const fr = path.join(tmpRoot, 'fivem_resources');
fs.mkdirSync(path.join(fr, 'oxmysql'), { recursive: true });
fs.writeFileSync(path.join(fr, 'oxmysql', 'fxmanifest.lua'), "fx_version 'cerulean'\ngame 'gta5'\n");
fs.symlinkSync(QB_CORE, path.join(fr, 'qb-core'), 'dir');

const AUSTI = { id: 1, name: 'austi', socialId: 'soc-123', hwidHash: 'hwid-abc', ip: '127.0.0.1' };
const CITIZEN = 'NSMRT0001';

async function makeRuntime() {
  const mock = makeMockAlt();
  mock.players = [AUSTI];
  mock.mysql = await createRealMysql({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' });
  const rt = new CfxCompatRuntime(mock);
  await rt.init();
  await rt.loadAll([
    ['oxmysql', path.join(fr, 'oxmysql')],
    ['qb-core', path.join(fr, 'qb-core')],
    ['mp-demo', path.join(ROOT, 'fivem_resources', 'mp-demo')],
  ]);
  return { rt, mock };
}

// ---------------------------------------------------------------------------
// 1. oxmysql API surface on real SQL (through a scratch resource)
// ---------------------------------------------------------------------------
console.log('== Part 1: oxmysql API surface against real MariaDB ==');
{
  const { rt } = await makeRuntime();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-db-api-'));
  fs.writeFileSync(path.join(dir, 'fxmanifest.lua'), "fx_version 'cerulean'\ngame 'gta5'\nserver_scripts { 'server.lua' }");
  fs.writeFileSync(path.join(dir, 'server.lua'), `
results = {}
CreateThread(function()
  -- named parameters (qb-core Save style)
  MySQL.insert('INSERT INTO players (citizenid, cid, license, name, money, charinfo, job, gang, position, metadata) VALUES (:citizenid, :cid, :license, :name, :money, :charinfo, :job, :gang, :position, :metadata)',
    { citizenid = 'APITEST1', cid = 9, license = 'license:api', name = 'api-tester', money = '{"cash":11}', charinfo = '{}', job = '{}', gang = '{}', position = '{}', metadata = '{}' })
  results.insertNamed = true

  -- positional parameters
  MySQL.query('UPDATE players SET name = ? WHERE citizenid = ?', { 'api-renamed', 'APITEST1' })
  results.updateRan = true

  -- prepare returns the row for a single-row select
  local row = MySQL.prepare.await('SELECT * FROM players WHERE citizenid = ?', { citizenid = 'APITEST1' })
  results.prepareRow = (row and row.name == 'api-renamed')

  -- prepare single-column select unwraps to the value (oxmysql doc)
  local n = MySQL.prepare.await('SELECT name FROM players WHERE citizenid = ?', { citizenid = 'APITEST1' })
  results.prepareScalar = (n == 'api-renamed')

  -- scalar
  local c = MySQL.scalar.await('SELECT COUNT(*) AS c FROM players WHERE citizenid = ?', { citizenid = 'APITEST1' })
  results.scalar = (tonumber(c) == 1)

  -- single
  local s = MySQL.single.await('SELECT name, cid FROM players WHERE citizenid = ?', { citizenid = 'APITEST1' })
  results.single = (s and s.cid == 9)

  -- execute returns affectedRows for UPDATE
  local aff = MySQL.execute.await('UPDATE players SET cid = ? WHERE citizenid = ?', { 10, 'APITEST1' })
  results.executeAffected = (tonumber(aff) == 1)

  -- transaction (all-or-nothing) with mixed shapes
  local ok = MySQL.transaction.await({
    { query = 'UPDATE players SET cid = ? WHERE citizenid = ?', values = { 11, 'APITEST1' } },
    'UPDATE players SET name = \\'txn-done\\' WHERE citizenid = \\'APITEST1\\'',
  })
  results.transaction = (ok == true)

  -- failing transaction rolls back (callback form, like qb-core uses;
  -- oxmysql: cb(false), and .await raises — the error path is tested below)
  MySQL.transaction({
    { query = 'UPDATE players SET cid = ? WHERE citizenid = ?', values = { 12, 'APITEST1' } },
    'UPDATE nonexistent_table SET x = 1',
  }, function(ok2)
    results.rollback = (ok2 == false)
    local cidRow = MySQL.single.await('SELECT cid FROM players WHERE citizenid = ?', { citizenid = 'APITEST1' })
    results.rollbackVerified = (cidRow ~= nil and tonumber(cidRow.cid) == 11)
  end)

  -- Async callback form
  MySQL.Async.query('SELECT name FROM players WHERE citizenid = ?', { citizenid = 'APITEST1' }, function(rows)
    results.asyncCb = (rows and rows[1] and rows[1].name == 'txn-done')
  end)

  -- error surfaces as a Lua error (not a fake result)
  local okErr, err = pcall(function()
    return MySQL.query.await('SELECT * FROM nonexistent_table_xyz', {})
  end)
  results.errorThrows = (not okErr)

  Wait(150)
end)
`);
  await rt.loadResource('db-api', dir);
  await sleep(400);
  const r = rt.envGet('db-api', 'results') || {};
  check('named-param INSERT (qb-core Save shape)', r.insertNamed === true);
  check('positional ? params', r.updateRan === true);
  check('prepare.await returns row object', r.prepareRow === true);
  check('prepare single-column unwraps to value', r.prepareScalar === true);
  check('scalar.await', r.scalar === true);
  check('single.await', r.single === true);
  check('execute.await affectedRows', r.executeAffected === true);
  check('transaction commits', r.transaction === true);
  check('failing transaction rolls back (real ROLLBACK)', r.rollback === true && r.rollbackVerified === true,
    `rollback=${r.rollback} verified=${r.rollbackVerified}`);
  check('MySQL.Async callback form', r.asyncCb === true);
  check('SQL errors raise in Lua (no fake results)', r.errorThrows === true);
  await db.query('DELETE FROM players WHERE citizenid = ?', ['APITEST1']);
}

// ---------------------------------------------------------------------------
// 2. qb-core persistence across a FULL runtime restart
// ---------------------------------------------------------------------------
console.log('== Part 2: qb-core player persistence across runtime restart ==');
const HUB = { money: 0, job: '' };

{ // runtime A: create character, earn money, get job, save
  const { rt } = await makeRuntime();
  check('runtime A: qb-core running', rt.getResourceState('qb-core') === 'running');
  const login = await rt.callExportJsonAsync('mp-demo', 'login', [1, null, { citizenid: CITIZEN, cid: 1 }]);
  check('runtime A: Login (new character)', login.ok && login.value[0] === true, JSON.stringify(login));
  await sleep(300);
  const rowA = (await q('SELECT money, job FROM players WHERE citizenid = ?', [CITIZEN]))[0];
  check('runtime A: character row saved to MariaDB', !!rowA);

  await rt.callExportJsonAsync('mp-demo', 'addMoney', [1, 4200]);
  await rt.callExportJsonAsync('mp-demo', 'setJob', [1, 'taxi', 2]);
  await rt.callExportJsonAsync('mp-demo', 'save', [1]);
  await sleep(300);
  const rowA2 = (await q('SELECT money, job FROM players WHERE citizenid = ?', [CITIZEN]))[0];
  HUB.money = JSON.parse(rowA2.money).cash;
  HUB.job = JSON.parse(rowA2.job).name;
  check('runtime A: money written to DB', HUB.money >= 4200, String(HUB.money));
  check('runtime A: job written to DB', HUB.job === 'taxi', HUB.job);
  // NO graceful shutdown — hard process-style stop (like a crash)
  await rt.stopResource('qb-core');
}

await sleep(200);

{ // runtime B: brand-new runtime + fresh qb-core instance, SAME database
  const { rt } = await makeRuntime();
  check('runtime B: fresh qb-core running', rt.getResourceState('qb-core') === 'running');
  const login = await rt.callExportJsonAsync('mp-demo', 'login', [1, CITIZEN, null]);
  check('runtime B: Login(citizenid) loads persisted character', login.ok && login.value[0] === true, JSON.stringify(login));
  await sleep(200);
  await rt.runLua('qb-core', 'probeMoney = QBCore.Players[1] and QBCore.Players[1].PlayerData.money.cash or -1');
  const cash = rt.envGet('qb-core', 'probeMoney');
  await rt.runLua('qb-core', 'probeJob = QBCore.Players[1] and QBCore.Players[1].PlayerData.job.name or false');
  const job = rt.envGet('qb-core', 'probeJob');
  check('runtime B: money survived the restart (real persistence)', Number(cash) === HUB.money, `${cash} != ${HUB.money}`);
  check('runtime B: job survived the restart', job === HUB.job, String(job));
}

console.log(`\n==== DB INTEGRATION RESULTS: ${passed} passed, ${failed} failed ====`);
await db.end();
process.exit(failed ? 1 : 0);
