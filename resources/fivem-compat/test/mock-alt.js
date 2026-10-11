// Minimal alt:V server mock for testing the cfx-compat runtime in plain Node.
export function makeMockAlt() {
  const players = [
    { id: 1, name: 'austi', socialId: 'soc-123', hwidHash: 'hwid-abc', ip: '127.0.0.1' },
    { id: 7, name: 'carmone', socialId: 'soc-777', hwidHash: 'hwid-def', ip: '10.0.0.2' },
  ];

  const logs = [];
  const errors = [];
  const clientEvents = [];
  const netListeners = new Map();
  const stateListeners = [];

  // fake synced-meta store: src -> Map(key -> json)
  const playerState = new Map();

  // fake entity store
  const entities = [];
  let nextEntId = 1;

  // fake mysql with canned responses
  const db = { users: [{ id: 1, name: 'austi' }, { id: 2, name: 'carmone' }], nextId: 3 };
  const mysql = {
    async query(sql, values) {
      await new Promise((r) => setTimeout(r, 5));
      if (/^select name from users/i.test(sql.trim())) return db.users.map((u) => ({ name: u.name }));
      if (/^select count\(\*\) as c from users/i.test(sql.trim())) return [{ c: db.users.length }];
      if (/^insert into users/i.test(sql.trim())) {
        const row = { id: db.nextId++, name: (values && values[0]) || 'unknown' };
        db.users.push(row);
        return { fieldCount: 0, affectedRows: 1, insertId: row.id };
      }
      return [];
    },
    async execute(sql, values) { return this.query(sql, values); },
  };

  return {
    players, logs, errors, clientEvents, netListeners, playerState, entities, db,

    log: (...a) => { logs.push(a.join(' ')); console.log('  [alt.log]', ...a); },
    logError: (...a) => { errors.push(a.join(' ')); console.error('  [alt.logError]', ...a); },

    onClient: (name, cb) => {
      if (!netListeners.has(name)) netListeners.set(name, []);
      netListeners.get(name).push(cb);
    },
    emitClient: (src, name, ...args) => { clientEvents.push({ target: src, name, args }); },
    emitAllClients: (name, ...args) => { clientEvents.push({ target: -1, name, args }); },
    findPlayer: (src) => players.find((p) => p.id === src) || null,
    playerIds: () => players.map((p) => p.id),
    dropPlayer: (p, reason) => { players.splice(players.indexOf(p), 1); logs.push(`KICKED ${p.name}: ${reason}`); },
    identifiers: (p) => [`ip:${p.ip}`, `license:${p.socialId}`, `discord:none`],
    convars: { sv_hostname: 'NSM Test Server' },

    mysql,

    // fake HTTP for PerformHttpRequest tests
    http: async (url, opts) => ({ status: 200, text: async () => '{"ok":true}', headers: { 'content-type': 'application/json' } }),

    createVehicle: (model, x, y, z, heading) => {
      const e = { entId: nextEntId++, model, pos: { x, y, z }, heading: heading || 0, plate: 'NSM123' };
      entities.push(e);
      return e;
    },
    deleteEntity: (ref) => { const i = entities.indexOf(ref); if (i >= 0) entities.splice(i, 1); },
    entityCoords: (ref) => ref.pos,
    setEntityCoords: (ref, x, y, z) => { ref.pos = { x, y, z }; },
    setEntityHeading: (ref, h) => { ref.heading = h; },
    entityHeading: (ref) => ref.heading,
    entityModel: (ref) => ref.model,
    setPlate: (ref, text) => { ref.plate = String(text).toUpperCase().slice(0, 8); },
    plate: (ref) => ref.plate,

    playerStateGet: (src, key) => {
      const m = playerState.get(src);
      return m && m.has(key) ? m.get(key) : null;
    },
    playerStateSet: (src, key, json) => {
      if (!playerState.has(src)) playerState.set(src, new Map());
      playerState.get(src).set(key, json);
      for (const cb of stateListeners) cb(`player:${src}`, key, json);
    },
    onStateChange: (cb) => { stateListeners.push(cb); },
  };
}
