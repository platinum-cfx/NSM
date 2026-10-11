/**
 * NSM (formerly GTAMP) FiveM JavaScript Compatibility Shim
 * Allows FiveM JavaScript / TypeScript client and server scripts to run inside alt:V (NSM).
 */

(function (global) {
  'use strict';

  // Detect alt:V environment
  const isAltV = typeof alt !== 'undefined';
  const isServer = isAltV && typeof alt.Player !== 'undefined' && typeof alt.Player.all !== 'undefined';
  const isClient = isAltV && !isServer;

  // Active event context
  let currentSource = null;
  const eventHandlers = new Map();
  const ticks = new Map();
  let nextTickId = 1;

  // -------------------------------------------------------------
  // Citizen FX Core
  // -------------------------------------------------------------
  const Citizen = {
    Wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    CreateThread(fn) {
      if (typeof fn !== 'function') return;
      (async () => {
        try {
          await fn();
        } catch (err) {
          (global.console || alt).error('[NSM FiveM-Shim] Error in thread:', err);
        }
      })();
    },

    Trace(...args) {
      if (isAltV && alt.log) {
        alt.log('[FiveM]', ...args);
      } else {
        console.log('[FiveM]', ...args);
      }
    },

    invokeNative(nativeHash, ...args) {
      if (isClient && typeof alt.natives !== 'undefined') {
        // In alt:V client, natives are in alt.natives
        return alt.natives[nativeHash] ? alt.natives[nativeHash](...args) : null;
      }
      return null;
    },

    pointerValueInt() { return 0; },
    pointerValueFloat() { return 0.0; },
    returnResultAnyway() { return true; },
    resultAsInteger() { return 0; },
    resultAsFloat() { return 0.0; },
    resultAsString() { return ''; }
  };

  global.Citizen = Citizen;

  // -------------------------------------------------------------
  // Global Thread & Tick Primitives
  // -------------------------------------------------------------
  global.setTick = function (fn) {
    const id = nextTickId++;
    let running = true;

    if (isClient && typeof alt.everyTick === 'function') {
      const altTickId = alt.everyTick(() => {
        if (!running) return;
        try {
          fn();
        } catch (e) {
          alt.logError('[NSM FiveM-Shim] Tick error:', e);
        }
      });
      ticks.set(id, { type: 'alt', handle: altTickId });
    } else {
      const timer = setInterval(() => {
        if (!running) return;
        try {
          fn();
        } catch (e) {
          console.error('[NSM FiveM-Shim] Tick error:', e);
        }
      }, 0);
      ticks.set(id, { type: 'interval', handle: timer });
    }

    return id;
  };

  global.clearTick = function (id) {
    const tick = ticks.get(id);
    if (!tick) return;
    if (tick.type === 'alt' && isClient && typeof alt.clearEveryTick === 'function') {
      alt.clearEveryTick(tick.handle);
    } else if (tick.type === 'interval') {
      clearInterval(tick.handle);
    }
    ticks.delete(id);
  };

  // -------------------------------------------------------------
  // Event System
  // -------------------------------------------------------------
  global.on = function (eventName, callback) {
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, []);
      if (isAltV) {
        alt.on(eventName, (...args) => {
          const list = eventHandlers.get(eventName) || [];
          for (const cb of list) {
            try { cb(...args); } catch (e) { (global.console || alt).error(e); }
          }
        });
      }
    }
    eventHandlers.get(eventName).push(callback);
    return callback;
  };

  global.AddEventHandler = global.on;

  global.onNet = function (eventName, callback) {
    if (isServer) {
      alt.onClient(eventName, (player, ...args) => {
        const prevSource = currentSource;
        currentSource = player.id;
        try {
          callback.apply({ source: player.id }, args);
        } catch (err) {
          alt.logError(`[NSM FiveM-Shim] Error in net event '${eventName}':`, err);
        } finally {
          currentSource = prevSource;
        }
      });
    } else if (isClient) {
      alt.onServer(eventName, (...args) => {
        try {
          callback(...args);
        } catch (err) {
          alt.logError(`[NSM FiveM-Shim] Error in client net event '${eventName}':`, err);
        }
      });
    }
    return callback;
  };

  global.RegisterNetEvent = function (eventName, callback) {
    if (typeof callback === 'function') {
      return global.onNet(eventName, callback);
    }
  };

  global.emit = function (eventName, ...args) {
    if (isAltV) {
      alt.emit(eventName, ...args);
    } else {
      const list = eventHandlers.get(eventName) || [];
      for (const cb of list) cb(...args);
    }
  };

  global.TriggerEvent = global.emit;

  global.emitNet = function (eventName, ...args) {
    if (isClient) {
      alt.emitServer(eventName, ...args);
    } else if (isServer) {
      const target = args[0];
      const payload = args.slice(1);
      if (target === -1) {
        // Broadcast
        alt.emitAllClients(eventName, ...payload);
      } else {
        const player = typeof target === 'object' ? target : alt.Player.all.find(p => p.id === target);
        if (player) {
          alt.emitClient(player, eventName, ...payload);
        }
      }
    }
  };

  global.TriggerServerEvent = function (eventName, ...args) {
    if (isClient) {
      alt.emitServer(eventName, ...args);
    }
  };

  global.TriggerClientEvent = function (eventName, target, ...args) {
    if (isServer) {
      if (target === -1) {
        alt.emitAllClients(eventName, ...args);
      } else {
        const player = typeof target === 'object' ? target : alt.Player.all.find(p => p.id === target);
        if (player) {
          alt.emitClient(player, eventName, ...args);
        }
      }
    }
  };

  // 'source' getter for FiveM server scripts
  Object.defineProperty(global, 'source', {
    get() {
      return currentSource;
    },
    configurable: true
  });

  // -------------------------------------------------------------
  // FiveM Server Natives & Helpers
  // -------------------------------------------------------------
  global.GetPlayerPed = function (src) {
    if (isServer) {
      const p = typeof src === 'object' ? src : alt.Player.all.find(x => x.id === src);
      return p || null;
    } else if (isClient) {
      return alt.Player.local;
    }
    return null;
  };

  global.GetEntityCoords = function (entity) {
    if (!entity) return [0, 0, 0];
    const pos = entity.pos || entity.position || entity;
    return [pos.x || 0, pos.y || 0, pos.z || 0];
  };

  global.GetPlayerName = function (src) {
    if (isServer) {
      const p = typeof src === 'object' ? src : alt.Player.all.find(x => x.id === src);
      return p ? p.name : 'Unknown';
    } else if (isClient) {
      return alt.Player.local ? alt.Player.local.name : 'Unknown';
    }
    return 'Unknown';
  };

  global.GetPlayerPing = function (src) {
    if (isServer) {
      const p = typeof src === 'object' ? src : alt.Player.all.find(x => x.id === src);
      return p ? p.ping : 0;
    }
    return 0;
  };

  global.GetPlayerIdentifiers = function (src) {
    if (isServer) {
      const p = typeof src === 'object' ? src : alt.Player.all.find(x => x.id === src);
      if (!p) return [];
      return [
        `ip:${p.ip || '127.0.0.1'}`,
        `license:${p.hwidHash || p.socialId || 'unknown'}`,
        `discord:${p.discordId || 'none'}`
      ];
    }
    return [];
  };

  global.DropPlayer = function (src, reason) {
    if (isServer) {
      const p = typeof src === 'object' ? src : alt.Player.all.find(x => x.id === src);
      if (p && typeof p.kick === 'function') {
        p.kick(reason || 'Disconnected by server');
      }
    }
  };

  // -------------------------------------------------------------
  // Exports proxy (FiveM exports['resource-name'].method())
  // -------------------------------------------------------------
  const exportedResources = new Map();
  global.exports = new Proxy({}, {
    get(target, resName) {
      if (!exportedResources.has(resName)) {
        exportedResources.set(resName, {});
      }
      return exportedResources.get(resName);
    },
    set(target, resName, value) {
      exportedResources.set(resName, value);
      return true;
    }
  });

  // -------------------------------------------------------------
  // Runner / Loader for FiveM scripts
  // -------------------------------------------------------------
  global.loadFiveMScript = function (code, filename) {
    try {
      const fn = new Function('Citizen', 'setTick', 'clearTick', 'on', 'onNet', 'emit', 'emitNet', 'TriggerEvent', 'TriggerServerEvent', 'TriggerClientEvent', 'exports', code);
      fn(Citizen, global.setTick, global.clearTick, global.on, global.onNet, global.emit, global.emitNet, global.TriggerEvent, global.TriggerServerEvent, global.TriggerClientEvent, global.exports);
      (global.console || alt).log(`[NSM FiveM-Shim] Successfully loaded FiveM script: ${filename || 'inline'}`);
    } catch (err) {
      (global.console || alt).error(`[NSM FiveM-Shim] Failed to load FiveM script ${filename}:`, err);
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      Citizen,
      setTick: global.setTick,
      clearTick: global.clearTick,
      on: global.on,
      onNet: global.onNet,
      emit: global.emit,
      emitNet: global.emitNet,
      loadFiveMScript: global.loadFiveMScript
    };
  }

  
  // -------------------------------------------------------------
  // Live Player Count Synchronization with GTAMP/NSM Host Server
  // -------------------------------------------------------------
  if (isServer && typeof alt !== 'undefined' && typeof alt.on === 'function') {
    const notifyPlayerCount = () => {
      try {
        const count = (alt.Player && alt.Player.all) ? alt.Player.all.length : 0;
        const http = require('http');
        const req = http.request({
          hostname: '127.0.0.1',
          port: 7799,
          path: `/updateOnline?online=${count}`,
          method: 'GET',
          timeout: 1000
        }, () => {});
        req.on('error', () => {});
        req.end();
      } catch (e) {}
    };

    alt.on('playerConnect', () => {
      setTimeout(notifyPlayerCount, 50);
    });
    alt.on('playerDisconnect', () => {
      setTimeout(notifyPlayerCount, 50);
    });
    // Regular heartbeat sync
    setInterval(notifyPlayerCount, 2500);
  }

  (global.console || alt).log('[NSM] FiveM Compatibility Shim loaded successfully.');
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
