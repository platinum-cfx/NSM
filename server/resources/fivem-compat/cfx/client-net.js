// Server-side glue between the cfx-compat Lua runtime and fivem-client
// resources connected through an alt:V server module.
//
// Wire protocol (client side lives in client/core.mjs):
//   client -> server:
//     '__fivem:net'    (evName, argsJson)   FiveM TriggerServerEvent
//     '__fivem:stateSet' (key, valueJson)   client writing its own player statebag
//     '__fivem:cmd'    (text)               ExecuteCommand("/...")
//     '__fivem:ready'  ()                   client finished booting
//   server -> client:
//     '__fivem:net'    (evName, argsJson)   TriggerClientEvent envelope
//     '__fivem:state'  (target, key, valueJson)  statebag replication
//     '__fivem:init'   (serverId, globalStateJson)  handshake reply
//
// Player id mapping: alt:V player.id IS the FiveM source id (1:1).
//
// This module is dependency-injected (alt + runtime) so the full wiring can be
// integration-tested in-process; index.js connects it to the real alt-server.

export class PlayerStateSync {
  constructor(alt, logError = () => {}) {
    this.alt = alt;
    this.logError = logError;
    this.byPlayer = new Map(); // src -> Map(key -> json)
  }

  set(src, key, json) {
    let bag = this.byPlayer.get(src);
    if (!bag) { bag = new Map(); this.byPlayer.set(src, bag); }
    bag.set(String(key), String(json));

    // mirror into alt:V synced meta so native alt:V resources can read it too
    try {
      const p = this.alt.Player.all.find((pl) => pl.id === src);
      if (p) p.setSyncedMeta(String(key), String(json));
    } catch {}

    this.broadcast(src, key, json);
  }

  get(src, key) {
    const bag = this.byPlayer.get(src);
    const v = bag ? bag.get(String(key)) : undefined;
    return v === undefined ? null : v;
  }

  // FiveM semantics: player statebag changes replicate to ALL clients
  // (including the owner).
  broadcast(src, key, json) {
    try { this.alt.emitAllClients('__fivem:state', `player:${src}`, String(key), String(json)); }
    catch (e) { this.logError(`state broadcast failed: ${e && e.message ? e.message : e}`); }
  }

  // Push the current state of every player to ONE client (join sync).
  snapshotFor(player) {
    for (const [src, bag] of this.byPlayer) {
      // don't stream a player's bag to themselves twice — set() already
      // broadcast it to everyone present; but for a JOINING client we must
      // include their own pre-existing bag (server-set state survives
      // reconnects), so send everything.
      for (const [key, json] of bag) {
        try { this.alt.emitClient(player, '__fivem:state', `player:${src}`, key, json); }
        catch (e) { this.logError(`snapshot emit failed: ${e && e.message ? e.message : e}`); }
      }
    }
  }

  delete(src) { this.byPlayer.delete(src); }
}

export function wireFivemClients({ alt, runtime, log = () => {}, logError = () => {} }) {
  const stateSync = new PlayerStateSync(alt, logError);

  const parseArgs = (argsJson) => {
    try {
      const a = JSON.parse(String(argsJson || '[]'));
      return Array.isArray(a) ? a : [];
    } catch { return []; }
  };

  // ---- client -> server FiveM events ----
  alt.onClient('__fivem:net', (player, evName, argsJson) => {
    try { runtime.dispatchNet(String(evName), player, parseArgs(argsJson)); }
    catch (e) { logError(`__fivem:net dispatch failed: ${(e && e.message) || e}`); }
  });

  // ---- client writing its own statebag (owner write) ----
  alt.onClient('__fivem:stateSet', (player, key, valueJson) => {
    stateSync.set(player.id, key, valueJson);
  });

  // ---- ExecuteCommand from the client (chat / keybinds) ----
  const handleCommand = (player, text) => {
    if (runtime.handleAdminCommand(player, String(text || ''))) return;
    if (!runtime.runCommand(player, String(text || ''))) {
      try { alt.emitClient(player, 'cfx:commandResult', false, String(text || '').split(' ')[0]); }
      catch {}
    }
  };
  alt.onClient('__fivem:cmd', (player, text) => handleCommand(player, text));

  // ---- join handshake: client booted, give it identity + full state ----
  const sendInit = (player) => {
    let globalState = {};
    try {
      if (runtime.globalState instanceof Map) {
        for (const [k, json] of runtime.globalState) globalState[k] = JSON.parse(json);
      }
    } catch {}
    try {
      alt.emitClient(player, '__fivem:init', player.id, JSON.stringify(globalState));
    } catch (e) { logError(`__fivem:init failed: ${(e && e.message) || e}`); }
    stateSync.snapshotFor(player);
    log(`fivem-client ready: player ${player.id} (${player.name || 'unknown'})`);
  };
  alt.onClient('__fivem:ready', (player, ok) => {
    if (ok === false) logError(`fivem-client: player ${player.id} booted WITH ERRORS — check the client log for [fivem-client] lines`);
    sendInit(player);
  });

  // ---- disconnect: drop the stored bag (alt:V removes synced meta itself) ----
  alt.on('playerDisconnect', (player) => {
    stateSync.delete(player.id);
  });

  return { stateSync, handleCommand, sendInit };
}
