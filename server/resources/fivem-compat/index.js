/**
 * NSM FiveM compatibility layer — alt:V adapter (v2)
 * Drop FiveM Lua resources into <server-root>/fivem_resources/<name>/
 * (with fxmanifest.lua + server scripts) and they load on server start.
 *
 * v2 wiring: MySQL (mysql.json + mysql2), entity natives (alt.Vehicle),
 * player statebags (synced meta), lifecycle events (playerConnecting /
 * playerDropped), and the full 6.4k-native stub set (see cfx/natives-stubs.lua).
 */
import * as alt from 'alt-server';
import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';
import { CfxCompatRuntime } from './cfx/runtime.js';

const require = createRequire(import.meta.url);

const log = (...a) => alt.log('[cfx-compat]', ...a);
const logError = (...a) => { try { alt.logError('[cfx-compat]', ...a); } catch { console.error('[cfx-compat]', ...a); } };

function findPlayer(src) {
  if (src && typeof src === 'object') return src;
  return alt.Player.all.find((p) => p.id === src) || null;
}

// ---------- MySQL (optional: <server-root>/mysql.json + npm i mysql2) ----------
function loadMysql() {
  const cfgPaths = [
    path.join(process.cwd(), 'mysql.json'),
    path.join(process.cwd(), 'server', 'mysql.json'),
  ];
  const cfgPath = cfgPaths.find((p) => fs.existsSync(p));
  if (!cfgPath) return null;
  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); }
  catch (e) { logError(`mysql.json is not valid JSON: ${e.message}`); return null; }
  let mysql2;
  try { mysql2 = require('mysql2/promise'); }
  catch { logError('mysql.json found but mysql2 is not installed — run: npm i mysql2'); return null; }
  const pool = mysql2.createPool({
    host: cfg.host || '127.0.0.1',
    port: cfg.port || 3306,
    user: cfg.user || 'root',
    password: cfg.password || '',
    database: cfg.database || 'fivem',
    connectionLimit: cfg.poolSize || 10,
    dateStrings: true,
  });
  log(`MySQL: using ${cfg.user}@${cfg.host || '127.0.0.1'}:${cfg.port || 3306}/${cfg.database}`);
  return {
    query: async (sql, values) => { const [rows] = await pool.query(sql, values || []); return rows; },
    execute: async (sql, values) => { const [r] = await pool.query(sql, values || []); return r; },
  };
}

// ---------- adapter ----------
const adapter = {
  log,
  logError,
  onClient: (name, cb) => alt.onClient(name, cb),
  emitClient: (src, name, ...args) => {
    const p = findPlayer(src);
    if (p) alt.emitClient(p, name, ...args);
  },
  emitAllClients: (name, ...args) => alt.emitAllClients(name, ...args),
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

  // statebags -> alt:V synced meta (values stored as JSON strings)
  playerStateGet: (src, key) => {
    const p = findPlayer(src);
    if (!p) return null;
    const v = p.getSyncedMeta(key);
    return v === undefined || v === null ? null : v;
  },
  playerStateSet: (src, key, json) => {
    const p = findPlayer(src);
    if (p) { try { p.setSyncedMeta(key, json); } catch {} }
  },
  onStateChange: (cb) => {
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
    if (!e.isDirectory()) continue;
    if (e.name.startsWith('[')) {
      try {
        for (const e2 of fs.readdirSync(path.join(root, e.name), { withFileTypes: true })) {
          if (e2.isDirectory() && fs.existsSync(path.join(root, e.name, e2.name, 'fxmanifest.lua'))) {
            out.push([e2.name, path.join(root, e.name, e2.name)]);
          }
        }
      } catch {}
    } else {
      out.push([e.name, path.join(root, e.name)]);
    }
  }
  return out.sort((a, b) => a[0].localeCompare(b[0]));
}

async function main() {
  adapter.mysql = loadMysql();
  const runtime = new CfxCompatRuntime(adapter);
  await runtime.init();

  // Locate <server-root>/fivem_resources — resources run with cwd = server root
  const roots = [
    path.join(process.cwd(), 'fivem_resources'),
    path.join(process.cwd(), 'server', 'fivem_resources'),
  ];
  const root = roots.find((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());

  if (!root) {
    log('no fivem_resources/ folder found — create it next to the server exe and drop FiveM Lua resources in');
    return runtime;
  }

  const entries = listResourceDirs(root);
  let loaded = 0;
  for (const [name, dir] of entries) {
    try {
      await runtime.loadResource(name, dir);
      loaded++;
    } catch (e) {
      logError(`failed to load FiveM resource '${name}': ${e && e.message ? e.message : e}`);
    }
  }
  log(`${loaded}/${entries.length} FiveM resource(s) running`);

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

  // Chat command bridge — have your chat UI emit 'cfx:command' with the raw text
  alt.onClient('cfx:command', (player, text) => {
    if (!runtime.runCommand(player, text)) {
      alt.emitClient(player, 'cfx:commandResult', false, String(text).split(' ')[0]);
    }
  });

  return runtime;
}

main().catch((e) => logError('fatal:', e && e.message ? e.message : e));
