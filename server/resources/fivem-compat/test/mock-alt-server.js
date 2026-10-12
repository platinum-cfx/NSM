// In-process mock of the alt:V SERVER module ('alt-server') for the
// multiplayer integration test.
//
// It implements the surface index.js touches (alt.log/logError, alt.Player.all,
// alt.on/onClient/emitClient/emitAllClients, alt.Vector3, alt.Vehicle) plus a
// virtual network: each connected client endpoint receives server->client
// events directly, and client->server events arrive as (player, ...args)
// through the same onClient listeners the real module would call.
//
// What this MOCKS: the alt:V transport + game entities only. Everything above
// it (index.js wiring, cfx runtime, qb-core, MySQL, client Lua VMs) is REAL.
import { EventEmitter } from 'events';

export function makeAltServerMock() {
  const players = new Map();      // id -> player object (alt.Player shape)
  const endpoints = new Map();    // id -> client endpoint (virtual network)
  const clientListeners = new Map(); // eventName -> [cb(player, ...args)]
  const serverListeners = new Map(); // eventName -> [cb(...)]
  const logs = [];
  const errors = [];
  const kicked = [];

  class Vector3 {
    constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
  }

  let nextVehicleId = 1;
  class Vehicle {
    constructor(model, x, y, z) {
      this.id = nextVehicleId++;
      this.model = model;
      this.pos = new Vector3(x, y, z);
      this.rot = new Vector3(0, 0, 0);
      this.numberPlateText = '';
      this.destroyed = false;
    }
    destroy() { this.destroyed = true; }
  }

  const syncedMeta = new Map(); // playerId -> Map(key -> value)

  const makePlayer = ({ id, name, socialId, hwidHash, ip }) => {
    const p = {
      id, name, socialId, hwidHash, ip: ip || '127.0.0.1',
      valid: true,
      getSyncedMeta: (key) => {
        const m = syncedMeta.get(p.id);
        return m && m.has(key) ? m.get(key) : undefined;
      },
      setSyncedMeta: (key, value) => {
        if (!syncedMeta.has(p.id)) syncedMeta.set(p.id, new Map());
        const m = syncedMeta.get(p.id);
        const old = m.get(key);
        m.set(key, value);
        for (const cb of serverListeners.get('syncedMetaDataChange') || []) {
          try { cb(key, value, old, p); } catch (e) { errors.push(`syncedMetaDataChange handler: ${e.message}`); }
        }
      },
      kick: (reason) => { kicked.push({ id: p.id, name: p.name, reason }); },
    };
    return p;
  };

  const alt = {
    log: (...a) => { logs.push(a.join(' ')); },
    logError: (...a) => { errors.push(a.join(' ')); console.error('  [alt.logError]', ...a); },
    Player: { get all() { return [...players.values()]; } },
    Vector3,
    Vehicle,
    on: (name, cb) => {
      if (!serverListeners.has(name)) serverListeners.set(name, []);
      serverListeners.get(name).push(cb);
    },
    onClient: (name, cb) => {
      if (!clientListeners.has(name)) clientListeners.set(name, []);
      clientListeners.get(name).push(cb);
    },
    emitClient: (player, name, ...args) => {
      const ep = endpoints.get(player.id);
      if (ep) ep.deliver(name, ...args);
    },
    emitAllClients: (name, ...args) => {
      for (const ep of endpoints.values()) ep.deliver(name, ...args);
    },
  };

  // ---- virtual network + test controls ----
  const test = {
    alt, logs, errors, kicked, players, endpoints, syncedMeta,

    // connect a player + register their client endpoint. Fires playerConnect.
    connectPlayer(spec) {
      const p = makePlayer(spec);
      players.set(p.id, p);
      const ep = {
        player: p,
        handlers: new Map(),   // onServer registrations from the client runtime
        delivered: [],         // everything the server sent this client
        deliver: (name, ...args) => {
          ep.delivered.push({ name, args });
          // REAL transports never deliver synchronously inside the emit call:
          // alt:V/FiveM net events arrive on a later tick. qb-core's
          // TriggerCallback relies on this (register -> emit -> await).
          queueMicrotask(() => {
            const h = ep.handlers.get(name);
            if (h) { try { h(...args); } catch (e) { errors.push(`client ${p.id} handler ${name}: ${e.message}`); } }
          });
        },
        // client runtime API: feed its onServer/emitServer
        sendToServer: (name, ...args) => {
          queueMicrotask(() => {
            for (const cb of clientListeners.get(name) || []) {
              try { cb(p, ...args); } catch (e) { errors.push(`onClient ${name} from ${p.id}: ${e.message}`); }
            }
          });
        },
      };
      endpoints.set(p.id, ep);
      for (const cb of serverListeners.get('playerConnect') || []) {
        try { cb(p); } catch (e) { errors.push(`playerConnect handler: ${e.message}`); }
      }
      return ep;
    },

    disconnectPlayer(id, reason = 'Disconnected') {
      const p = players.get(id);
      if (!p) return;
      for (const cb of serverListeners.get('playerDisconnect') || []) {
        try { cb(p, reason); } catch (e) { errors.push(`playerDisconnect handler: ${e.message}`); }
      }
      players.delete(id);
      endpoints.delete(id);
      syncedMeta.delete(id);
    },

    // build the mock alt-CLIENT module for a fengari client runtime
    makeClientAlt(ep, extras = {}) {
      return {
        log: (...a) => { logs.push(`[client ${ep.player.id}] ` + a.join(' ')); },
        logError: (...a) => { errors.push(`[client ${ep.player.id}] ` + a.join(' ')); },
        setTimeout: (fn, ms) => setTimeout(fn, ms),
        clearTimeout: (id) => clearTimeout(id),
        onServer: (name, cb) => { ep.handlers.set(name, cb); },
        emitServer: (name, ...args) => { ep.sendToServer(name, ...args); },
        on: () => {}, emit: () => {},
        showCursor: () => {},
        WebView: class { constructor(url, o) { this.url = url; this.isOverlay = !!o; } emit() {} on() {} focus() {} unfocus() {} },
        KeyCode: {},
        ...extras,
      };
    },

    serverEvents: serverListeners,
    clientListeners,
  };

  return test;
}
