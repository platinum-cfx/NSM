/**
 * NSM FiveM compatibility layer — alt:V adapter (v4)
 * Drop FiveM Lua resources into <server-root>/fivem_resources/<name>/
 * (with fxmanifest.lua + server scripts) and they load on server start.
 *
 * v4: full transport wiring for fivem-client resources (CLIENT_COMPATIBILITY
 * §8) — TriggerClientEvent/statebags travel the __fivem:net/__fivem:state
 * envelope protocol with player-id mapping (alt player.id == FiveM source),
 * join handshake (__fivem:ready -> __fivem:init + statebag snapshot), and
 * client ExecuteCommand via __fivem:cmd. MySQL now runs through the shared
 * cfx/mysql-real.js adapter (vendored mysql2, oxmysql semantics incl.
 * MySQL.prepare + transactions) used by the integration tests.
 *
 * v3 features kept: one Lua VM with live cross-resource exports, per-resource
 * environments, dependency-ordered startup, entity natives (alt.Vehicle),
 * lifecycle events, and the 6.4k-native stub set (cfx/natives-stubs.lua).
 */
import * as alt from 'alt-server';
import * as fs from 'fs';
import * as path from 'path';
import { CfxCompatRuntime } from './cfx/runtime.js';
import { createRealMysql } from './cfx/mysql-real.js';
import { wireFivemClients } from './cfx/client-net.js';

const log = (...a) => alt.log('[cfx-compat]', ...a);
const logError = (...a) => { try { alt.logError('[cfx-compat]', ...a); } catch { console.error('[cfx-compat]', ...a); } };

function findPlayer(src) {
  if (src && typeof src === 'object') return src;
  // FiveM ids are strings half the time (ESX tostring's them); be tolerant
  if (typeof src === 'string' && /^-?\d+$/.test(src)) src = Number(src);
  return alt.Player.all.find((p) => p.id === src) || null;
}

// Events we pass through raw (protocol + native alt:V chat/UI events);
// everything else a server resource sends to a client is a FiveM event and
// travels inside the __fivem:net envelope (plus a raw emit for any native
// alt:V client resource listening on the plain name).
const isProtocolEvent = (name) => typeof name === 'string' && (name.startsWith('__fivem:') || name.startsWith('cfx:'));

// ---------- MySQL (optional: <server-root>/mysql.json) ----------
async function loadMysql() {
  const cfgPaths = [
    path.join(process.cwd(), 'mysql.json'),
    path.join(process.cwd(), 'server', 'mysql.json'),
    path.join(process.cwd(), 'fivem_resources', 'mysql.json'),
  ];
  const cfgPath = cfgPaths.find((p) => fs.existsSync(p));
  if (!cfgPath) return null;
  let cfg;
  const readCfg = () => fs.readFileSync(cfgPath, 'utf8');
  try { cfg = JSON.parse(readCfg()); }
  catch (e) {
    // mysql.json.example used to ship '//' hint lines after the JSON; users
    // copied them along and JSON has no comments. Retry once with full-line
    // comments stripped instead of failing the whole database.
    const stripped = readCfg().split(/?
/).filter((l) => !/^\s*\/\//.test(l)).join('
');
    try { cfg = JSON.parse(stripped); }
    catch (e2) { logError(`mysql.json is not valid JSON: ${e.message}`); return null; }
    logError(`mysql.json: comment lines are not valid JSON - parsed anyway after stripping them (remove the // lines to silence this)`);
  }
  try {
    const db = await createRealMysql(cfg);
    // qb-core's GetDatabaseInfo() parses this convar (mysql://user:pass@host:port/db)
    adapter.convars.mysql_connection_string =
      `mysql://${cfg.user || 'root'}:${cfg.password || ''}@${cfg.host || '127.0.0.1'}:${cfg.port || 3306}/${cfg.database || 'fivem'}`;
    log(`MySQL: real adapter connected (${db.config.user}@${db.config.host}:${db.config.port}/${db.config.database})`);
    return db;
  } catch (e) {
    logError(`MySQL connection failed: ${e && e.message ? e.message : e}`);
    return null;
  }
}

// ---------- adapter ----------
const adapter = {
  log,
  logError,
  onClient: (name, cb) => alt.onClient(name, cb),
  emitClient: (src, name, ...args) => {
    const p = findPlayer(src);
    if (!p) return;
    if (isProtocolEvent(name)) {
      try { alt.emitClient(p, name, ...args); } catch {}
      return;
    }
    let payload = '[]';
    try { payload = JSON.stringify(args); } catch {}
    try { alt.emitClient(p, '__fivem:net', name, payload); } catch {}   // fivem-client resources
    try { alt.emitClient(p, name, ...args.filter((v) => typeof v !== 'function' && typeof v !== 'symbol' && typeof v !== 'bigint')); } catch {} // native alt:V listeners (MValue-safe)
  },
  emitAllClients: (name, ...args) => {
    if (isProtocolEvent(name)) {
      try { alt.emitAllClients(name, ...args); } catch {}
      return;
    }
    let payload = '[]';
    try { payload = JSON.stringify(args); } catch {}
    try { alt.emitAllClients('__fivem:net', name, payload); } catch {}
    try { alt.emitAllClients(name, ...args.filter((v) => typeof v !== 'function' && typeof v !== 'symbol' && typeof v !== 'bigint')); } catch {}
  },
  findPlayer,
  playerIds: () => alt.Player.all.map((p) => p.id),
  dropPlayer: (p, reason) => { try { p.kick(reason); } catch {} },
  identifiers: (p) => [
    `ip:${p.ip || '127.0.0.1'}`,
    `license:${p.socialId || p.hwidHash || 'unknown'}`,
    `discord:none`,
  ],
  convars: {},
  mysql: null, // set in main()

  // OneSync-style entities (compat handles, backed by real alt:V entities)
  createVehicle: (model, x, y, z, heading) => {
    try {
      const veh = new alt.Vehicle(model, x, y, z, 0, 0, 0);
      try { veh.rot = new alt.Vector3(0, 0, ((heading || 0) % 360) * Math.PI / 180); } catch {}
      return veh;
    } catch (e) {
      logError(`CreateVehicle(${model}) failed: ${e && e.message ? e.message : e}`);
      return null;
    }
  },
  deleteEntity: (ref) => { try { ref.destroy(); } catch {} },
  entityCoords: (ref) => ref.pos || { x: 0, y: 0, z: 0 },
  setEntityCoords: (ref, x, y, z) => { try { ref.pos = new alt.Vector3(x, y, z); } catch {} },
  setEntityHeading: (ref, h) => { try { ref.rot = new alt.Vector3(0, 0, ((Number(h) || 0) % 360) * Math.PI / 180); } catch {} },
  entityHeading: (ref) => {
    try { return ((ref.rot ? ref.rot.z : 0) * 180 / Math.PI + 360) % 360; } catch { return 0; }
  },
  entityModel: (ref) => { try { return ref.model; } catch { return 0; } },
  setPlate: (ref, text) => { try { ref.numberPlateText = String(text).slice(0, 8); } catch {} },
  plate: (ref) => { try { return ref.numberPlateText || ''; } catch { return ''; } },

  // statebags -> PlayerStateSync (store + alt:V synced meta + __fivem:state
  // push to every client). Filled in by main() once wiring exists.
  playerStateGet: null,
  playerStateSet: null,
  onStateChange: (cb) => {
    // external synced-meta changes reach server-Lua statebag handlers;
    // PlayerStateSync (installed in main) owns replication to fivem clients
    alt.on('syncedMetaDataChange', (key, newValue, oldValue, entity) => {
      try {
        if (entity instanceof alt.Player) cb(`player:${entity.id}`, key, newValue);
      } catch {}
    });
  },
};

// Find fivem_resources/, including FiveM-style [category] subfolders
function listResourceDirs(root) {
  const out = [];
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    const p = path.join(root, e.name);
    // statSync (not the dirent type) so symlinked resource dirs work too
    let isDir = false;
    try { isDir = fs.statSync(p).isDirectory(); } catch {}
    if (!isDir) continue;
    if (e.name.startsWith('[')) {
      try {
        for (const e2 of fs.readdirSync(p, { withFileTypes: true })) {
          if (fs.statSync(path.join(p, e2.name)).isDirectory() && fs.existsSync(path.join(p, e2.name, 'fxmanifest.lua'))) {
            out.push([e2.name, path.join(p, e2.name)]);
          }
        }
      } catch {}
    } else {
      out.push([e.name, p]);
    }
  }
  return out.sort((a, b) => a[0].localeCompare(b[0]));
}

async function main() {
  adapter.mysql = await loadMysql();
  const runtime = new CfxCompatRuntime(adapter);
  await runtime.init();

  // fivem-client transport: __fivem:net / __fivem:state / __fivem:cmd wiring,
  // join handshake, statebag store + replication (CLIENT_COMPATIBILITY §8)
  const { stateSync, handleCommand } = wireFivemClients({ alt, runtime, log, logError });
  adapter.playerStateGet = (src, key) => stateSync.get(src, key);
  adapter.playerStateSet = (src, key, json) => stateSync.set(src, key, json);
  // NOTE: runtime.init() already consumed adapter.onStateChange (it forwards
  // synced-meta changes to Lua handlers). PlayerStateSync.set does the client
  // replication, so each state change reaches clients exactly once.

  // Locate <server-root>/fivem_resources — resources run with cwd = server root
  const roots = [
    path.join(process.cwd(), 'fivem_resources'),
    path.join(process.cwd(), 'server', 'fivem_resources'),
  ];
  const root = roots.find((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());

  if (root) {
    const entries = listResourceDirs(root);
    // v3: dependency-ordered loading (manifest `dependencies` + @imports);
    // alphabetical discovery order is only the tiebreaker.
    await runtime.loadAll(entries);
  } else {
    log('no fivem_resources/ folder found — create it next to the server exe and drop FiveM Lua resources in');
  }

  // ---- lifecycle events (FiveM names, `source` set to the player id) ----
  alt.on('playerConnect', (player) => {
    runtime.fireLifecycle('playerJoining', player, [player.name]);
    // FiveM-style deferrals: auto-accepting stubs (scripts that just log/score
    // work; to actually block connections, kick from the handler)
    const deferrals = {
      defer() {}, update() {}, presentCard() {},
      done(reason) { if (reason) { try { player.kick(String(reason)); } catch {} } },
    };
    const setKickReason = (msg) => { try { player.kick(String(msg || 'Kicked')); } catch {} };
    runtime.fireLifecycle('playerConnecting', player, [player.name, setKickReason, deferrals]);
  });
  alt.on('playerDisconnect', (player, reason) => {
    runtime.fireLifecycle('playerDropped', player, [reason || 'Disconnected']);
  });

  // Chat command bridge — two entry points, same logic:
  //   'cfx:command'  a native alt:V chat resource emits this with raw text
  //   '__fivem:cmd'  fivem-client ExecuteCommand()/chat emits this
  alt.onClient('cfx:command', (player, text) => handleCommand(player, text));

  return runtime;
}

export const ready = main().catch((e) => {
  logError('fatal:', e && e.message ? e.message : e);
  return null;
});
