/**
 * GTAMP Masterlist
 * ----------------
 * Central server directory. Game servers announce themselves here every ~30s,
 * the launcher fetches the list. Zero dependencies — plain Node.js >= 18.
 *
 *   node server.js                       # listens on 0.0.0.0:8080
 *   PORT=80 ADMIN_KEY=secret node server.js
 *
 * Endpoints
 *   GET  /servers                 -> public server list (JSON array)
 *   GET  /servers/:id             -> single server
 *   POST /announce                -> heartbeat from a game server (needs server key)
 *   POST /keys                    -> create a server key (needs ADMIN_KEY)
 *   GET  /health                  -> uptime / counts
 *
 * Servers that miss heartbeats for TIMEOUT_MS are dropped from the list.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dns = require('dns').promises;
const net = require('net');

// ---------- config ----------
const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_KEY = process.env.ADMIN_KEY || '';            // required to mint server keys
const OPEN_ANNOUNCE = process.env.OPEN_ANNOUNCE !== '0';  // default to open announce for easy setup (set 0 for strict key auth)
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '25000', 10);   // drop after 90 s silence
const VERIFY_PORT = process.env.VERIFY_PORT !== '0';      // TCP-probe the game port before listing
const BASE_DIR = process.pkg ? path.dirname(process.execPath) : __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(BASE_DIR, 'data');
const KEYS_FILE = path.join(DATA_DIR, 'keys.json');
const RATE_LIMIT_PER_MIN = 60;

fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- state ----------
/** id -> server record */
const servers = new Map();
/** key -> { owner, createdAt, lastUsed } */
let keys = loadKeys();
/** ip -> { count, resetAt } */
const rate = new Map();
const startedAt = Date.now();

// Active NSM.exe launchers and playing clients presence tracking
const activeLaunchers = new Map(); // id -> { lastSeen, ip, user }
const activePlayersByServer = new Map(); // sAddr -> Map(clientId -> lastSeen)

function pruneLaunchers() {
  const cutoff = Date.now() - 6000; // 6 sec cutoff
  for (const [id, l] of activeLaunchers) {
    if (l.lastSeen < cutoff) activeLaunchers.delete(id);
  }
}

function pruneActivePlayers() {
  const cutoff = Date.now() - 6000;
  for (const [sAddr, clients] of activePlayersByServer) {
    for (const [cId, lastSeen] of clients) {
      if (lastSeen < cutoff) clients.delete(cId);
    }
    if (clients.size === 0) activePlayersByServer.delete(sAddr);
  }

  // Synchronize server records with active client counts
  for (const s of servers.values()) {
    const addr = `${s.host}:${s.port}`;
    const activeP = (activePlayersByServer.get(addr)?.size || 0) +
                    (s.host === '127.0.0.1' ? (activePlayersByServer.get(`localhost:${s.port}`)?.size || 0) : 0);
    if (activePlayersByServer.has(addr) || (s.host === '127.0.0.1' && activePlayersByServer.has(`localhost:${s.port}`))) {
      s.players = activeP;
      s.reportedPlayers = activeP;
    } else {
      s.players = Math.max(s.reportedPlayers || 0, activeP);
    }
  }
}

function getTotalOnline() {
  pruneLaunchers();
  pruneActivePlayers();
  let totalServerPlayers = 0;
  for (const s of servers.values()) {
    totalServerPlayers += (s.players || 0);
  }
  return totalServerPlayers + activeLaunchers.size;
}


function loadKeys() {
  try { return new Map(Object.entries(JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8')))); }
  catch { return new Map(); }
}
function saveKeys() {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(Object.fromEntries(keys), null, 2));
}

// ---------- helpers ----------
function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Server-Key, X-Admin-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
  });
  res.end(data);
}

function readBody(req, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  const ip = (xf ? String(xf).split(',')[0].trim() : req.socket.remoteAddress) || '';
  return ip.replace(/^::ffff:/, '');
}

function rateLimited(ip) {
  const now = Date.now();
  let r = rate.get(ip);
  if (!r || now > r.resetAt) { r = { count: 0, resetAt: now + 60_000 }; rate.set(ip, r); }
  return ++r.count > RATE_LIMIT_PER_MIN;
}

function clampStr(v, max, fallback = '') {
  if (typeof v !== 'string') return fallback;
  return v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max) || fallback;
}
function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** Quick TCP connect to make sure the announced host:port is actually reachable. */
function probe(host, port, timeoutMs = 3000) {
  return new Promise(resolve => {
    const s = net.createConnection({ host, port });
    const done = ok => { s.destroy(); resolve(ok); };
    s.setTimeout(timeoutMs, () => done(false));
    s.once('connect', () => done(true));
    s.once('error', () => done(false));
  });
}

function publicView(s) {
  return {
    id: s.id,
    name: s.name,
    host: s.host,
    port: s.port,
    players: s.players,
    maxPlayers: s.maxPlayers,
    gamemode: s.gamemode,
    language: s.language,
    website: s.website,
    description: s.description,
    tags: s.tags,
    locked: s.locked,
    version: s.version,
    verified: s.verified,
    upvotes: s.upvotes || 0,
    lastSeen: s.lastSeen,
  };
}

// ---------- routes ----------
async function handleAnnounce(req, res) {
  const ip = clientIp(req);
  if (rateLimited(ip)) return json(res, 429, { error: 'rate limited' });

  let body;
  try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }

  // --- auth ---
  const key = req.headers['x-server-key'] || body.key;
  let owner = null;
  if (key && keys.has(key)) {
    owner = keys.get(key).owner;
    keys.get(key).lastUsed = Date.now();
  } else if (!OPEN_ANNOUNCE) {
    return json(res, 401, { error: 'invalid or missing server key' });
  }

  // --- validate ---
  const port = clampInt(body.port, 1, 65535, 7788);
  let host = clampStr(body.host, 253, '');
  if (!host) host = ip;                            // default to the announcing IP
  if (!net.isIP(host)) {
    try { await dns.lookup(host); } catch { return json(res, 400, { error: 'host does not resolve' }); }
  }

  const id = crypto.createHash('sha1').update(`${host}:${port}`).digest('hex').slice(0, 16);
  const existing = servers.get(id);

  // A key can only update servers it created (unless OPEN_ANNOUNCE)
  if (existing && existing.owner && existing.owner !== owner) {
    return json(res, 403, { error: 'host:port is registered to a different key' });
  }

  let verified = existing ? existing.verified : false;
  if (host === '127.0.0.1' || host === 'localhost' || host === '::1' || host.startsWith('192.168.') || host.startsWith('10.')) {
    verified = true;
  } else if (VERIFY_PORT && (!existing || Date.now() - existing.verifiedAt > 5 * 60_000)) {
    verified = await probe(host, port);
    if (!verified && !existing && process.env.STRICT_VERIFY === '1') {
      return json(res, 400, { error: `could not reach ${host}:${port} — is the port forwarded?` });
    }
  }

  const reportedP = clampInt(body.players, 0, 10000, 0);
  const addrKey = `${host}:${port}`;
  const clientPlayingCount = (activePlayersByServer.get(addrKey)?.size || 0) +
                             (host === '127.0.0.1' ? (activePlayersByServer.get(`localhost:${port}`)?.size || 0) : 0);
  const finalPlayers = Math.max(reportedP, clientPlayingCount);

  const rec = {
    id, host, port, owner,
    reportedPlayers: reportedP,
    name: clampStr(body.name, 64, 'Unnamed Server'),
    players: finalPlayers,
    maxPlayers: clampInt(body.maxPlayers, 1, 10000, 128),
    gamemode: clampStr(body.gamemode, 48, 'Freeroam'),
    language: clampStr(body.language, 16, 'en'),
    website: clampStr(body.website, 128, ''),
    description: clampStr(body.description, 280, ''),
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 8).map(t => clampStr(t, 24)).filter(Boolean) : [],
    locked: !!body.locked,
    version: clampStr(body.version, 32, ''),
    verified,
    upvotes: existing ? (existing.upvotes || 0) : 0,
    verifiedAt: verified ? Date.now() : (existing ? existing.verifiedAt : 0),
    firstSeen: existing ? existing.firstSeen : Date.now(),
    lastSeen: Date.now(),
  };
  servers.set(id, rec);
  json(res, 200, { ok: true, id, nextAnnounceIn: 5, verified });
}

async function handleCreateKey(req, res) {
  if (!ADMIN_KEY) return json(res, 503, { error: 'ADMIN_KEY not configured on masterlist' });
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return json(res, 401, { error: 'bad admin key' });
  let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
  const owner = clampStr(body.owner, 64, 'anonymous');
  const key = 'gtamp_' + crypto.randomBytes(24).toString('hex');
  keys.set(key, { owner, createdAt: Date.now(), lastUsed: 0 });
  saveKeys();
  json(res, 201, { key, owner });
}

function handleList(req, res, url) {
  prune();
  pruneLaunchers();
  pruneActivePlayers();
  for (const s of servers.values()) {
    const addr = `${s.host}:${s.port}`;
    const activeP = (activePlayersByServer.get(addr)?.size || 0) +
                    (s.host === '127.0.0.1' ? (activePlayersByServer.get(`localhost:${s.port}`)?.size || 0) : 0);
    s.players = Math.max(s.reportedPlayers || 0, activeP);
  }
  let list = [...servers.values()];
  const q = url.searchParams;
  if (q.get('gamemode')) list = list.filter(s => s.gamemode.toLowerCase() === q.get('gamemode').toLowerCase());
  if (q.get('language')) list = list.filter(s => s.language.toLowerCase() === q.get('language').toLowerCase());
  if (q.get('search')) { const t = q.get('search').toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(t) || s.description.toLowerCase().includes(t)); }
  if (q.get('verified') === '1') list = list.filter(s => s.verified);
  const sort = q.get('sort');
  if (sort === 'players') {
    list.sort((a, b) => b.players - a.players || (b.upvotes || 0) - (a.upvotes || 0) || a.name.localeCompare(b.name));
  } else {
    // Default: boosted / upvoted first, then players
    list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0) || b.players - a.players || a.name.localeCompare(b.name));
  }
  pruneLaunchers();
  const totalOnline = getTotalOnline();
  res.setHeader('X-Active-Launchers', String(activeLaunchers.size));
  res.setHeader('X-Total-Online', String(totalOnline));
  json(res, 200, list.map(publicView));
}

function prune() {
  const cutoff = Date.now() - TIMEOUT_MS;
  for (const [id, s] of servers) if (s.lastSeen < cutoff) servers.delete(id);
}
setInterval(prune, 15_000).unref();

// ---------- server ----------
const srv = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname.replace(/\/+$/, '') || '/';
  try {
    if (req.method === 'OPTIONS') return json(res, 204, {});
    if ((req.method === 'GET' || req.method === 'HEAD') && (p === '/' || p === '/health')) {
      prune();
      return json(res, 200, { ok: true, servers: servers.size, players: getTotalOnline(), activeLaunchers: activeLaunchers.size, serverPlayers: [...servers.values()].reduce((a, s) => a + s.players, 0), uptime: Math.floor((Date.now() - startedAt) / 1000) });
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && p === '/servers') return handleList(req, res, url);
    if (req.method === 'GET' && p === '/api/news') {
      return json(res, 200, {
        ok: true,
        feed: [
          {
            id: 'tw-1',
            source: 'twitter',
            author: 'scravenz101',
            handle: '@scravenz101',
            avatar: 'https://unavatar.io/twitter/scravenz101',
            url: 'https://x.com/scravenz101',
            time: Date.now() - 3600000,
            text: 'NSM Multiplayer is now live! Check out the server browser, F8 in-game console, playtime upvotes, and FiveM script support! 🚀'
          },
          {
            id: 'dc-1',
            source: 'discord',
            author: 'NSM Announcements',
            channel: '#announcements',
            channelUrl: 'https://discord.com/channels/1537269824864915568/1545984006196166736',
            time: Date.now() - 7200000,
            text: '📢 Welcome to NSM! Playtime-based upvotes, masterlist, and server boosting are active. Join our Discord for updates!'
          }
        ]
      });
    }
    if (req.method === 'POST' && p.startsWith('/servers/') && p.endsWith('/upvote')) {
      const sId = p.slice(9, -7);
      let s = servers.get(sId);
      if (!s) {
        for (const candidate of servers.values()) {
          if (`${candidate.host}:${candidate.port}` === sId) {
            s = candidate;
            break;
          }
        }
      }
      if (s) {
        s.upvotes = (s.upvotes || 0) + 1;
        return json(res, 200, { ok: true, id: s.id, upvotes: s.upvotes });
      }
      return json(res, 404, { error: 'server not found' });
    }

    
    if (req.method === 'POST' && (p === '/api/player/heartbeat' || p === '/api/server/playing')) {
      let body; try { body = await readBody(req); } catch { body = {}; }
      const ip = clientIp(req);
      const cId = String((body && body.clientId) || (body && body.id) || ip);
      let sAddr = String((body && body.server) || (body && body.addr) || '');
      if (sAddr.startsWith('altv://connect/')) sAddr = sAddr.slice(15);
      if (sAddr) {
        if (!activePlayersByServer.has(sAddr)) activePlayersByServer.set(sAddr, new Map());
        activePlayersByServer.get(sAddr).set(cId, Date.now());
      }
      pruneActivePlayers();

      // Find the server record and update players immediately
      let srv = null;
      for (const s of servers.values()) {
        if (s.id === sAddr || `${s.host}:${s.port}` === sAddr || (sAddr.startsWith('127.0.0.1') && s.host === '127.0.0.1')) {
          srv = s;
          break;
        }
      }
      const activeCount = sAddr && activePlayersByServer.has(sAddr) ? activePlayersByServer.get(sAddr).size : 0;
      if (srv) {
        srv.players = Math.max(srv.reportedPlayers || 0, activeCount);
      }
      return json(res, 200, { ok: true, server: sAddr, serverPlayers: srv ? srv.players : activeCount, totalOnline: getTotalOnline() });
    }

    if ((req.method === 'GET' || req.method === 'POST') && (p === '/api/player/leave' || p === '/api/server/leave')) {
      let body = {};
      if (req.method === 'POST') {
        try { body = await readBody(req); } catch { body = {}; }
      }
      const ip = clientIp(req);
      const cId = String((body && body.clientId) || (body && body.id) || url.searchParams.get('clientId') || url.searchParams.get('id') || ip);
      let sAddr = String((body && body.server) || (body && body.addr) || url.searchParams.get('server') || url.searchParams.get('addr') || '');
      const hostParam = url.searchParams.get('host') || (body && body.host) || '';
      const portParam = url.searchParams.get('port') || (body && body.port) || '';
      if (!sAddr && hostParam) {
        sAddr = `${hostParam}:${portParam || '7788'}`;
      }
      if (sAddr.startsWith('altv://connect/')) sAddr = sAddr.slice(15);
      
      const targets = [sAddr];
      if (sAddr.startsWith('127.0.0.1:')) targets.push(sAddr.replace('127.0.0.1:', 'localhost:'));
      if (sAddr.startsWith('localhost:')) targets.push(sAddr.replace('localhost:', '127.0.0.1:'));

      for (const t of targets) {
        if (t && activePlayersByServer.has(t)) {
          activePlayersByServer.get(t).delete(cId);
          if (activePlayersByServer.get(t).size === 0) activePlayersByServer.delete(t);
        }
      }

      pruneActivePlayers();

      // Find the server record and update players immediately
      let srv = null;
      for (const s of servers.values()) {
        const addr = `${s.host}:${s.port}`;
        if (s.id === sAddr || addr === sAddr || (sAddr.includes('127.0.0.1') && s.host === '127.0.0.1') || (sAddr.includes('localhost') && s.host === '127.0.0.1')) {
          srv = s;
          const activeCount = (activePlayersByServer.get(addr)?.size || 0) +
                              (s.host === '127.0.0.1' ? (activePlayersByServer.get(`localhost:${s.port}`)?.size || 0) : 0);
          srv.players = activeCount;
          srv.reportedPlayers = activeCount;
          break;
        }
      }

      return json(res, 200, { ok: true, serverPlayers: srv ? srv.players : 0, totalOnline: getTotalOnline() });
    }

    if ((req.method === 'GET' || req.method === 'POST') && p === '/api/launcher/ping') {
      let body = {};
      if (req.method === 'POST') {
        try { body = await readBody(req); } catch { body = {}; }
      }
      const ip = clientIp(req);
      const id = String(url.searchParams.get('id') || (body && body.id) || ip);
      activeLaunchers.set(id, { lastSeen: Date.now(), ip, user: (body && body.user) || url.searchParams.get('user') || 'Guest' });
      pruneLaunchers();
      pruneActivePlayers();
      const serverPlayers = [...servers.values()].reduce((a, s) => {
        const addr = `${s.host}:${s.port}`;
        const activePlayingClients = activePlayersByServer.has(addr) ? activePlayersByServer.get(addr).size : 0;
        return a + Math.max(s.players || 0, activePlayingClients);
      }, 0);
      return json(res, 200, {
        ok: true,
        activeLaunchers: activeLaunchers.size,
        serverPlayers: serverPlayers,
        totalOnline: serverPlayers + activeLaunchers.size
      });
    }

    if ((req.method === 'GET' || req.method === 'POST') && p === '/api/launcher/leave') {
      let body = {};
      if (req.method === 'POST') {
        try { body = await readBody(req); } catch { body = {}; }
      }
      const ip = clientIp(req);
      const id = String(url.searchParams.get('id') || (body && body.id) || ip);
      activeLaunchers.delete(id);
      return json(res, 200, { ok: true });
    }

    if (req.method === 'GET' && (p === '/api/launcher/active' || p === '/api/stats')) {
      pruneLaunchers();
      const serverPlayers = [...servers.values()].reduce((a, s) => a + (s.players || 0), 0);
      return json(res, 200, {
        activeLaunchers: activeLaunchers.size,
        serverPlayers: serverPlayers,
        totalOnline: serverPlayers + activeLaunchers.size
      });
    }
    if ((req.method === 'DELETE' || (req.method === 'POST' && p.endsWith('/delete'))) && p.startsWith('/servers/')) {
      let sId = p.slice(9);
      if (sId.endsWith('/delete')) sId = sId.slice(0, -7);
      let found = servers.delete(sId);
      if (!found) {
        for (const [id, candidate] of servers) {
          if (`${candidate.host}:${candidate.port}` === sId || candidate.id === sId) {
            servers.delete(id);
            found = true;
            break;
          }
        }
      }
      return json(res, 200, { ok: true, deleted: sId });
    }
    if (req.method === 'GET' && p.startsWith('/servers/')) {
      prune();
      const s = servers.get(p.slice(9));
      return s ? json(res, 200, publicView(s)) : json(res, 404, { error: 'not found' });
    }
    if (req.method === 'POST' && p === '/announce') return await handleAnnounce(req, res);
    if (req.method === 'POST' && p === '/keys') return await handleCreateKey(req, res);
    json(res, 404, { error: 'not found' });
  } catch (e) {
    console.error(e);
    json(res, 500, { error: 'internal error' });
  }
});

srv.listen(PORT, HOST, () => {
  console.log(`[masterlist] listening on http://${HOST}:${PORT}`);
  console.log(`[masterlist] announce auth: ${OPEN_ANNOUNCE ? 'OPEN (dev mode)' : 'server key required'}`);
  console.log(`[masterlist] admin key: ${ADMIN_KEY ? 'set' : 'NOT SET — POST /keys disabled'}`);
  console.log(`[masterlist] known server keys: ${keys.size}`);
});
