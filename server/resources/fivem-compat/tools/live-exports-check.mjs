// Acceptance test for the v3 one-VM runtime: LIVE cross-resource exports
// against the real qb-core and es_extended frameworks.
// Two separate runtimes (a real server runs ONE framework; es_extended also
// hard-errors on purpose if it detects qb-core running alongside).
// A consumer resource grabs each framework's core object the way real FiveM
// scripts do (exports['qb-core']:GetCoreObject()) and verifies it received a
// LIVE table: functions callable, shared data readable, identity preserved.
import { CfxCompatRuntime } from '../cfx/runtime.js';
import { makeMockAlt } from '../test/mock-alt.js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let passed = 0, failed = 0;
const check = (name, cond) => {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}`); }
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-live-exports-'));

function writeConsumer(dirName, manifestDeps, body) {
  const dir = path.join(tmp, dirName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'fxmanifest.lua'), [
    "fx_version 'cerulean'",
    "game 'gta5'",
    ...manifestDeps,
    "server_scripts { 'server.lua' }",
    '',
  ].join('\n'));
  fs.writeFileSync(path.join(dir, 'server.lua'), body);
  return dir;
}

// ================= runtime 1: qb-core =================
console.log('== qb-core runtime (live exports) ==');
{
  const mock = makeMockAlt();
  const rt = new CfxCompatRuntime(mock);
  await rt.init();

  const consumerDir = writeConsumer('qb-consumer', ["dependency 'qb-core'"], `
local function keycount(t)
  local n = 0
  for k in pairs(t) do n = n + 1 end
  return n
end

local QBCore = exports['qb-core']:GetCoreObject()

__qb_functions_table = (type(QBCore.Functions) == 'table')
__qb_getplayer_fn = (type(QBCore.Functions.GetPlayer) == 'function')      -- a JSON copy would lose this
__qb_shared_items = (type(QBCore.Shared) == 'table' and type(QBCore.Shared.Items) == 'table')
__qb_items_count = (keycount(QBCore.Shared.Items) > 0)
__qb_identity = (exports['qb-core']:GetCoreObject() == QBCore)             -- live reference, not a snapshot

print('qb-consumer ran: live=' .. tostring(__qb_identity) .. ' items=' .. tostring(__qb_items_count))
`);

  // WRONG order on purpose (consumer first); loadAll must reorder.
  await rt.loadAll([
    ['qb-consumer', consumerDir],
    ['qb-core', path.join(__dirname, '..', '..', '..', '..', 'server', 'resource_store', 'qb-core')],
  ]);

  check('consumer saw qb-core Functions table', rt.envGet('qb-consumer', '__qb_functions_table') === true);
  check('consumer got live FUNCTIONS (GetPlayer)', rt.envGet('qb-consumer', '__qb_getplayer_fn') === true);
  check('consumer got qb Shared.Items data', rt.envGet('qb-consumer', '__qb_shared_items') === true);
  check('consumer counted qb Shared.Items entries', rt.envGet('qb-consumer', '__qb_items_count') === true);
  check('GetCoreObject returns SAME table every call', rt.envGet('qb-consumer', '__qb_identity') === true);
  check('consumer script ran (log)', mock.logs.some((l) => l.includes('qb-consumer ran: live=true')));

  const qbDone = mock.logs.findIndex((l) => l.includes("FiveM resource 'qb-core' loaded"));
  const consumerRan = mock.logs.findIndex((l) => l.includes('qb-consumer ran'));
  check('dependency order: qb-core loaded before consumer ran', qbDone >= 0 && consumerRan > qbDone);

  check('qb-core and consumer share ONE Lua VM', rt.engines.get('qb-core').lua === rt.lua
    && rt.engines.get('qb-consumer').lua === rt.lua);

  // mutation liveness: mutate QBCore.Shared from the consumer; a second,
  // independent resource must see it through its own GetCoreObject() call
  const probeDir = writeConsumer('qb-probe', ["dependency 'qb-core'"], `
local QBCore = exports['qb-core']:GetCoreObject()
__probeSeen = (QBCore.Shared.__liveProbe == 4321)
`);
  await rt.loadResource('qb-probe', probeDir);
  await rt.runLua('qb-consumer', `
local QBCore = exports['qb-core']:GetCoreObject()
QBCore.Shared.__liveProbe = 4321
`);
  await rt.runLua('qb-probe', `
local QBCore = exports['qb-core']:GetCoreObject()
__probeSeen = (QBCore.Shared.__liveProbe == 4321)
`);
  check('mutations via live export visible to other resources', rt.envGet('qb-probe', '__probeSeen') === true);
}

// ================= runtime 2: es_extended =================
console.log('== es_extended runtime (live exports) ==');
{
  const mock = makeMockAlt();
  const rt = new CfxCompatRuntime(mock);
  await rt.init();

  const consumerDir = writeConsumer('esx-consumer', ["dependency 'es_extended'"], `
local ESX = exports['es_extended']:getSharedObject()

__esx_table = (type(ESX) == 'table')
__esx_fn = (type(ESX.GetPlayerFromId) == 'function')
__esx_players_fn = (type(ESX.GetPlayers) == 'function')
__esx_identity = (exports['es_extended']:getSharedObject() == ESX)

print('esx-consumer ran: live=' .. tostring(__esx_identity))
`);

  // WRONG order on purpose; @esx_lib/imports.lua in es_extended's shared
  // scripts must force esx_lib first, then es_extended, then the consumer.
  await rt.loadAll([
    ['esx-consumer', consumerDir],
    ['es_extended', path.join(__dirname, '..', '..', '..', '..', 'server', 'resource_store', 'esx-legacy', '[core]', 'es_extended')],
    ['esx_lib', path.join(__dirname, '..', '..', '..', '..', 'server', 'resource_store', 'esx-legacy', '[core]', 'esx_lib')],
  ]);

  check('consumer got ESX table', rt.envGet('esx-consumer', '__esx_table') === true);
  check('consumer got live ESX.GetPlayerFromId function', rt.envGet('esx-consumer', '__esx_fn') === true);
  check('consumer got live ESX.GetPlayers function', rt.envGet('esx-consumer', '__esx_players_fn') === true);
  check('getSharedObject returns SAME table every call', rt.envGet('esx-consumer', '__esx_identity') === true);
  check('consumer script ran (log)', mock.logs.some((l) => l.includes('esx-consumer ran: live=true')));

  const libDone = mock.logs.findIndex((l) => l.includes("FiveM resource 'esx_lib' loaded"));
  const extDone = mock.logs.findIndex((l) => l.includes("FiveM resource 'es_extended' loaded"));
  const consumerRan = mock.logs.findIndex((l) => l.includes('esx-consumer ran'));
  check('@import order: esx_lib loaded before es_extended', libDone >= 0 && extDone > libDone);
  check('dependency order: es_extended loaded before consumer ran', extDone >= 0 && consumerRan > extDone);

  check('esx resources share ONE Lua VM', rt.engines.get('esx_lib').lua === rt.lua
    && rt.engines.get('es_extended').lua === rt.lua && rt.engines.get('esx-consumer').lua === rt.lua);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n==== LIVE EXPORTS: ${passed} passed, ${failed} failed ====`);
process.exit(failed > 0 ? 1 : 0);
