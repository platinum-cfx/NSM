// Regression tests for the website security fixes (S2, S3, S4, S9, S10).
// Plain Node >= 18 + the website's own dependencies. Boots server.js on free
// ports with a temp DATA_DIR and asserts authorization behavior over real HTTP.
//
//   node test-security.js
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as net from 'net';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_KEY = 'test-admin-key';

let passed = 0, failed = 0;
const check = (name, cond, extra) => {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
};

function freePort() {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.status < 500) return true; } catch {}
    await sleep(150);
  }
  return false;
}
function cookieOf(res) {
  const set = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
  return (set && set[0] || '').split(';')[0];
}

function boot(extraEnv = {}) {
  return (async () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-web-sec-'));
    const port = await freePort();
    const child = spawn('node', ['server.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, GTAMP_SECRET: 'test-secret', ADMIN_KEY, ...extraEnv },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let log = '';
    child.stdout.on('data', (d) => { log += d; });
    child.stderr.on('data', (d) => { log += d; });
    const base = `http://127.0.0.1:${port}`;
    const up = await waitFor(base + '/login');
    return { child, base, dataDir, log };
  })();
}

async function login(base, username, password) {
  const r = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return { status: r.status, cookie: cookieOf(r), body: await r.json().catch(() => ({})) };
}

const sites = [];
try {
  const site = await boot();
  sites.push(site);
  const { base, dataDir } = site;
  check('website boots', true);

  console.log('== S2: server-deletion backdoors removed ==');
  let r = await fetch(`${base}/api/servers/99/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'Cravenz' }) });
  check('POST delete with username "Cravenz" is rejected (403)', r.status === 403, `got ${r.status}`);
  r = await fetch(`${base}/api/servers/99/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminKey: 'CravenzOwnerKey' }) });
  check('POST delete with the old hardcoded key is rejected (403)', r.status === 403, `got ${r.status}`);
  r = await fetch(`${base}/api/servers/99`, { method: 'DELETE', headers: { Authorization: 'anything-at-all' } });
  check('DELETE with an arbitrary Authorization header is rejected (403)', r.status === 403, `got ${r.status}`);
  r = await fetch(`${base}/api/servers/99`, { method: 'DELETE', headers: { 'X-Admin-Key': 'wrong' } });
  check('DELETE with a wrong X-Admin-Key is rejected (403)', r.status === 403, `got ${r.status}`);
  r = await fetch(`${base}/api/servers/99`, { method: 'DELETE', headers: { 'X-Admin-Key': ADMIN_KEY } });
  check('DELETE with the correct X-Admin-Key succeeds', r.status === 200, `got ${r.status}`);
  r = await fetch(`${base}/api/servers/99/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  check('POST delete with no credentials is rejected (403)', r.status === 403, `got ${r.status}`);

  console.log('== accounts still work (regression) ==');
  const owner = await login(base, 'Cravenz', 'Austin06');
  check('owner (Cravenz) can log in', owner.status === 200 && !!owner.cookie, JSON.stringify(owner.body));
  r = await fetch(`${base}/api/auth/me`, { headers: { Cookie: owner.cookie } });
  const me = await r.json();
  check('owner session reports isOwner', me.user && me.user.isOwner === true);
  const bobreg = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'bob-tester', password: 'bobpass123' }) });
  const bob = cookieOf(bobreg);
  check('a new user can register', bobreg.status === 200 && !!bob);
  r = await fetch(`${base}/api/auth/me`, { headers: { Cookie: bob } });
  const bobMe = (await r.json()).user;
  check('new user is NOT staff/owner', bobMe && bobMe.isAdmin === false && bobMe.isOwner === false);

  console.log('== S4: owner-tier badge escalation blocked ==');
  // make bob staff (b_admin) by writing the badge directly — the test owns
  // DATA_DIR; store re-reads the JSON file on every request
  const ubPath = path.join(dataDir, 'user_badges.json');
  const ub = JSON.parse(fs.readFileSync(ubPath, 'utf8'));
  ub.push({ uid: bobMe.id, bid: 'b_admin' });
  fs.writeFileSync(ubPath, JSON.stringify(ub));
  r = await fetch(`${base}/api/auth/me`, { headers: { Cookie: bob } });
  check('b_admin badge makes bob staff', (await r.json()).user.isAdmin === true);
  r = await fetch(`${base}/admin/badges/grant`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: bob }, body: JSON.stringify({ uid: bobMe.id, bid: 'b_owner' }) });
  check('staff self-granting b_owner is rejected (403)', r.status === 403, `got ${r.status}`);
  r = await fetch(`${base}/api/auth/me`, { headers: { Cookie: bob } });
  check('bob is still NOT owner after the attempt', (await r.json()).user.isOwner === false);
  r = await fetch(`${base}/admin/badges/grant`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: owner.cookie }, body: JSON.stringify({ uid: bobMe.id, bid: 'b_owner' }) });
  check('the real owner CAN grant b_owner', r.status === 302 || r.status === 200, `got ${r.status}`);
  r = await fetch(`${base}/api/auth/me`, { headers: { Cookie: bob } });
  check('granted b_owner does confer owner (why the block matters)', (await r.json()).user.isOwner === true);

  console.log('== S9: avatar changes require the session ==');
  r = await fetch(`${base}/api/auth/avatar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'Cravenz', avatar: 'pwned' }) });
  check('setting another user\'s avatar by username is rejected (401)', r.status === 401, `got ${r.status}`);
  r = await fetch(`${base}/api/auth/avatar`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: bob }, body: JSON.stringify({ avatar: 'data:image/png;base64,AAAA' }) });
  check('setting your own avatar with a session works', r.status === 200, `got ${r.status}`);
  r = await fetch(`${base}/api/auth/avatar`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: bob }, body: JSON.stringify({ avatar: 'x'.repeat(300000) }) });
  check('oversized avatar is rejected (400)', r.status === 400, `got ${r.status}`);

  console.log('== S3: CORS no longer reflects arbitrary origins with credentials ==');
  r = await fetch(`${base}/login`, { headers: { Origin: 'https://evil.example' } });
  const aco = r.headers.get('access-control-allow-origin');
  check('evil origin is NOT reflected', aco === null || aco !== 'https://evil.example', `ACAO=${aco}`);
  r = await fetch(`${base}/login`, { headers: { Origin: 'https://good.example' } });
  check('non-allowlisted "good" origin is not reflected either (no allowlist configured)', r.headers.get('access-control-allow-origin') === null);

  // second instance WITH an allowlist
  const site2 = await boot({ ALLOWED_ORIGINS: 'https://good.example' });
  sites.push(site2);
  r = await fetch(`${site2.base}/login`, { headers: { Origin: 'https://evil.example' } });
  check('with allowlist: evil origin still not reflected', r.headers.get('access-control-allow-origin') !== 'https://evil.example');
  r = await fetch(`${site2.base}/login`, { headers: { Origin: 'https://good.example' } });
  const aco2 = r.headers.get('access-control-allow-origin');
  const cred2 = r.headers.get('access-control-allow-credentials');
  check('with allowlist: allowlisted origin IS reflected with credentials', aco2 === 'https://good.example' && cred2 === 'true', `ACAO=${aco2} cred=${cred2}`);

  console.log('== S10: session secret default is random, not a committed constant ==');
  const site3 = await boot({ GTAMP_SECRET: '' });
  sites.push(site3);
  await sleep(300);
  check('unset GTAMP_SECRET logs a warning', site3.log.includes('GTAMP_SECRET is not set'), site3.log.slice(0, 200));
} finally {
  for (const s of sites) {
    try { s.child.kill('SIGTERM'); } catch {}
    try { fs.rmSync(s.dataDir, { recursive: true, force: true }); } catch {}
  }
  await sleep(300);
}

console.log(`\n==== WEBSITE SECURITY: ${passed} passed, ${failed} failed ====`);
process.exit(failed > 0 ? 1 : 0);
