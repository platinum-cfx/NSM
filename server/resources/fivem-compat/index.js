/**
 * NSM FiveM compatibility layer — alt:V adapter
 * Drop FiveM Lua resources into <server-root>/fivem_resources/<name>/
 * (with fxmanifest.lua + server scripts) and they load on server start.
 */
import * as alt from 'alt-server';
import * as fs from 'fs';
import * as path from 'path';
import { CfxCompatRuntime } from './cfx/runtime.js';

const log = (...a) => alt.log('[cfx-compat]', ...a);
const logError = (...a) => { try { alt.logError('[cfx-compat]', ...a); } catch { console.error('[cfx-compat]', ...a); } };

function findPlayer(src) {
  if (src && typeof src === 'object') return src;
  return alt.Player.all.find((p) => p.id === src) || null;
}

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
};

async function main() {
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

  const entries = fs.readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  let loaded = 0;
  for (const name of entries) {
    try {
      await runtime.loadResource(name, path.join(root, name));
      loaded++;
    } catch (e) {
      logError(`failed to load FiveM resource '${name}': ${e && e.message ? e.message : e}`);
    }
  }
  log(`${loaded}/${entries.length} FiveM resource(s) running`);

  // Base FiveM events, mapped from alt:V
  alt.on('playerConnect', (player) => {
    runtime.dispatchLocal('playerJoining', [player.id]);
  });
  alt.on('playerDisconnect', (player) => {
    runtime.dispatchLocal('playerDropped', ['Disconnected', player.id]);
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
