/**
 * alt:V adapter for the cfx-compat runtime — the exact bindings the real
 * server entry (index.js) installs. Parameterized on `alt` (and the two
 * loggers) so the test suite can exercise the same __fivem:net envelope and
 * raw-passthrough whitelist code that runs against a live alt:V server.
 */
export function makeAdapter(alt, { log, logError }) {
// Events we pass through raw (protocol + native alt:V chat/UI events);
// everything else a server resource sends to a client is a FiveM event and
// travels inside the __fivem:net envelope (plus a raw emit for any native
// alt:V client resource listening on the plain name).
const isProtocolEvent = (name) => typeof name === 'string' && (name.startsWith('__fivem:') || name.startsWith('cfx:'));

// Raw passthrough fires only for MValue-safe primitives. alt:V's MValue
// conversion logs an internal error for functions, Lua-table proxies and
// other exotic values even inside try/catch, so anything non-primitive is
// delivered exclusively through the __fivem:net JSON envelope.
const mvalueSafe = (args) => args.every((v) => v === null || typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string');

function findPlayer(src) {
  if (src && typeof src === 'object') return src;
  // FiveM ids are strings half the time (ESX tostring's them); be tolerant
  if (typeof src === 'string' && /^-?\d+$/.test(src)) src = Number(src);
  return alt.Player.all.find((p) => p.id === src) || null;
}

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
    if (mvalueSafe(args)) { try { alt.emitClient(p, name, ...args); } catch {} } // native alt:V listeners (primitives only)
  },
  emitAllClients: (name, ...args) => {
    if (isProtocolEvent(name)) {
      try { alt.emitAllClients(name, ...args); } catch {}
      return;
    }
    let payload = '[]';
    try { payload = JSON.stringify(args); } catch {}
    try { alt.emitAllClients('__fivem:net', name, payload); } catch {}
    if (mvalueSafe(args)) { try { alt.emitAllClients(name, ...args); } catch {} }
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


  return adapter;
}
