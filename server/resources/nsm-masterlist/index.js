// nsm-masterlist — the server-list service the NSM/GTAMP launcher expects.
//
// The launcher (NSM.exe server browser) fetches:
//   GET {masterlistUrl}/servers            -> JSON array of server entries
//   GET {masterlistUrl}/api/launcher/ping  -> launcher heartbeat
// gtamp-online calls:
//   GET {masterlistUrl}/api/player/leave   -> player left notification
//
// THIS server is always in the list with a live player count. Other NSM
// servers can POST /announce to appear here too (60s keepalive TTL).
// Listens on the port from .cfg [masterlist] masterlist_url (default 8080),
// so the launcher's default http://127.0.0.1:8080 works out of the box.
import * as alt from 'alt-server';
import http from 'http';
import fs from 'fs';
import path from 'path';

// ---------- tiny .cfg reader (name/port/player_slots + [masterlist]) -------
function readCfg() {
  const out = {};
  const candidates = ['../../.cfg', '../.cfg', '.cfg'];
  let raw = null;
  for (const c of candidates) {
    try { raw = fs.readFileSync(path.resolve(c), 'utf8'); break; } catch (e) {}
  }
  if (!raw) return out;
  let section = '';
  for (let line of raw.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const sec = line.match(/^\[(.+)\]$/);
    if (sec) { section = sec[1]; continue; }
    const kv = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    const cm = v.indexOf(' #');
    if (cm >= 0) v = v.slice(0, cm).trim();
    if (v.startsWith('[')) {
      try { v = JSON.parse(v.replace(/'/g, '"')); } catch (e) { v = []; }
    } else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    else if (v === 'true' || v === 'false') v = (v === 'true');
    else if (/^-?\d+$/.test(v)) v = parseInt(v, 10);
    out[(section ? section + '.' : '') + kv[1]] = v;
  }
  return out;
}

const cfg = readCfg();

function mlPortFromUrl(u) {
  const m = String(u || '').match(/:(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 8080;
}

const ML_PORT = mlPortFromUrl(cfg['masterlist.masterlist_url']);
const SERVER_NAME = cfg['name'] || 'NSM Server';
const SERVER_PORT = cfg['port'] || 7788;
const MAX_PLAYERS = cfg['player_slots'] || 1052;
const PUBLIC_HOST = cfg['masterlist.public_host'] || '127.0.0.1';
const LANGUAGE = cfg['masterlist.language'] || 'en';
const TAGS = String(cfg['masterlist.tags'] || 'nsm')
  .split(',').map(s => s.trim()).filter(Boolean);
const GAMEMODE = cfg['masterlist.gamemode'] || '';
const DESCRIPTION = cfg['masterlist.description'] ||
  (GAMEMODE ? GAMEMODE + ' on NSM' : 'FiveM-compatible NSM server');
const LOCKED = !!cfg['masterlist.locked'];

// ---------- live entry for THIS server --------------------------------------
function localServer() {
  let players = 0;
  try { players = alt.Player.all.length; } catch (e) {}
  return {
    id: `local:${PUBLIC_HOST}:${SERVER_PORT}`,
    name: SERVER_NAME,
    description: DESCRIPTION,
    host: PUBLIC_HOST,
    port: SERVER_PORT,
    players: players,
    maxPlayers: MAX_PLAYERS,
    language: LANGUAGE,
    tags: TAGS,
    gamemode: GAMEMODE,
    locked: LOCKED
  };
}

// ---------- announced remote servers (forward-compatible) -------------------
const announced = new Map(); // "host:port" -> { entry, expires }
const ANNOUNCE_TTL = 60000;
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of announced) if (v.expires < now) announced.delete(k);
}, 15000);
if (sweeper.unref) sweeper.unref();

// ---------- http -------------------------------------------------------------
function json(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(obj));
}

const srv = http.createServer((req, res) => {
  let p = req.url || '/';
  const qi = p.indexOf('?');
  if (qi >= 0) p = p.slice(0, qi);
  p = p.replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS') { res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': '*'
  }); return res.end(); }

  if (p === '/' || p === '/health') return json(res, 200, { service: 'nsm-masterlist', ok: true });

  if (p === '/servers') {
    const list = [localServer()];
    for (const v of announced.values()) list.push(v.entry);
    return json(res, 200, list);
  }

  if (p === '/api/launcher/ping') return json(res, 200, { ok: true, pong: true });
  if (p === '/api/player/leave') return json(res, 200, { ok: true });
  if (p === '/api/keys') return json(res, 200, { keys: [] });

  if (p === '/announce' && req.method === 'POST') {
    let body = '';
    req.on('data', d => { body += d; if (body.length > 65536) req.destroy(); });
    req.on('end', () => {
      try {
        const e = JSON.parse(body || '{}');
        if (!e.host || !e.port) return json(res, 400, { ok: false, error: 'host and port required' });
        announced.set(`${e.host}:${e.port}`, {
          entry: {
            id: `${e.host}:${e.port}`,
            name: e.name || `${e.host}:${e.port}`,
            description: e.description || '',
            host: e.host,
            port: e.port,
            players: Number(e.players) || 0,
            maxPlayers: Number(e.maxPlayers) || 64,
            language: e.language || 'en',
            tags: Array.isArray(e.tags) ? e.tags : [],
            gamemode: e.gamemode || '',
            locked: !!e.locked
          },
          expires: Date.now() + ANNOUNCE_TTL
        });
        json(res, 200, { ok: true });
      } catch (err) { json(res, 400, { ok: false, error: 'bad json' }); }
    });
    return;
  }

  json(res, 404, { ok: false, error: 'not found' });
});

srv.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    alt.log(`[nsm-masterlist] port ${ML_PORT} is busy - another masterlist is already running there; the launcher will use that one.`);
  } else {
    alt.log(`[nsm-masterlist] error: ${e.message}`);
  }
});

srv.listen(ML_PORT, '0.0.0.0', () => {
  alt.log(`[nsm-masterlist] server list is LIVE at http://127.0.0.1:${ML_PORT}/servers - "${SERVER_NAME}" (${PUBLIC_HOST}:${SERVER_PORT})`);
});
