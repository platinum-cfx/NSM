// Regression tests for the masterlist security fixes (S1, S6, S11, claim C).
// Plain Node >= 18, no dependencies. Boots server.js on a free port with a
// temp DATA_DIR and asserts the authorization behavior with real HTTP calls.
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

async function waitFor(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return true; } catch {}
    await sleep(150);
  }
  return false;
}

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-ml-sec-'));
const port = await freePort();
const base = `http://127.0.0.1:${port}`;

const child = spawn('node', ['server.js'], {
  cwd: __dirname,
  env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, ADMIN_KEY },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
child.stdout.on('data', (d) => { serverLog += d; });
child.stderr.on('data', (d) => { serverLog += d; });

try {
  const up = await waitFor(`${base}/health`);
  check('server boots', up, serverLog.slice(-300));

  const health = await (await fetch(`${base}/health`)).json();

  console.log('== claim C: config defaults match documentation ==');
  check('OPEN_ANNOUNCE defaults to strict (0)', health.config.openAnnounce === false);
  check('TIMEOUT_MS defaults to 90000 (README + comment)', health.config.timeoutMs === 90000);
  check('TRUST_PROXY defaults to off', health.config.trustProxy === false);

  console.log('== announce auth (strict by default) ==');
  let r = await fetch(`${base}/announce`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Anon', port: 7788 }) });
  check('announce without a key is rejected (401)', r.status === 401);
  r = await fetch(`${base}/announce`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Server-Key': 'not-a-real-key' }, body: JSON.stringify({ name: 'Fake', port: 7788 }) });
  check('announce with an invalid key is rejected (401)', r.status === 401);

  console.log('== key minting ==');
  r = await fetch(`${base}/keys`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Key': 'wrong' }, body: '{}' });
  check('minting a key with a wrong admin key is rejected (401)', r.status === 401);
  r = await fetch(`${base}/keys`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY }, body: JSON.stringify({ owner: 'alice' }) });
  check('admin can mint a server key', r.status === 201);
  const { key: aliceKey } = await r.json();
  r = await fetch(`${base}/keys`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY }, body: JSON.stringify({ owner: 'bob' }) });
  const { key: bobKey } = await r.json();

  console.log('== announce with a valid key ==');
  r = await fetch(`${base}/announce`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Server-Key': aliceKey }, body: JSON.stringify({ name: 'Alice Server', host: '127.0.0.1', port: 17778, players: 3 }) });
  check('announce with a valid key succeeds', r.status === 200);
  const announced = await r.json();
  check('loopback host from loopback source is verified', announced.verified === true);
  const sid = announced.id;

  console.log('== S1: server deletion requires authorization ==');
  r = await fetch(`${base}/servers/${sid}`, { method: 'DELETE' });
  check('DELETE without any key is rejected (403)', r.status === 403);
  r = await fetch(`${base}/servers/${sid}/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  check('POST delete without any key is rejected (403)', r.status === 403);
  let list = await (await fetch(`${base}/servers`)).json();
  check('server still listed after rejected deletes', list.some((s) => s.id === sid));
  r = await fetch(`${base}/servers/${sid}`, { method: 'DELETE', headers: { 'X-Server-Key': bobKey } });
  check("DELETE with another owner's key is rejected (403)", r.status === 403);
  r = await fetch(`${base}/servers/${sid}`, { method: 'DELETE', headers: { 'X-Admin-Key': ADMIN_KEY } });
  check('DELETE with the admin key succeeds', r.status === 200);
  list = await (await fetch(`${base}/servers`)).json();
  check('server gone after admin delete', !list.some((s) => s.id === sid));

  // owner-key delete path
  r = await fetch(`${base}/announce`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Server-Key': aliceKey }, body: JSON.stringify({ name: 'Alice Server 2', host: '127.0.0.1', port: 17779, players: 0 }) });
  const sid2 = (await r.json()).id;
  r = await fetch(`${base}/servers/${sid2}`, { method: 'DELETE', headers: { 'X-Server-Key': aliceKey } });
  check('DELETE with the owning server key succeeds', r.status === 200);

  console.log('== S6: upvote spam protection ==');
  r = await fetch(`${base}/announce`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Server-Key': aliceKey }, body: JSON.stringify({ name: 'Alice Server 3', host: '127.0.0.1', port: 17780, players: 0 }) });
  const sid3 = (await r.json()).id;
  r = await fetch(`${base}/servers/${sid3}/upvote`, { method: 'POST' });
  check('first upvote counts', r.status === 200 && (await r.json()).upvotes === 1);
  r = await fetch(`${base}/servers/${sid3}/upvote`, { method: 'POST' });
  check('second upvote from the same address is rejected (409)', r.status === 409);
  const rec = await (await fetch(`${base}/servers/${sid3}`)).json();
  check('upvote count stays at 1', rec.upvotes === 1);

  console.log('== S11: X-Forwarded-For is not trusted by default ==');
  r = await fetch(`${base}/announce`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Server-Key': aliceKey, 'X-Forwarded-For': '6.6.6.6' }, body: JSON.stringify({ name: 'No Host', port: 17781 }) });
  check('announce without host succeeds', r.status === 200);
  const sid4 = (await r.json()).id;
  const rec4 = await (await fetch(`${base}/servers/${sid4}`)).json();
  check('spoofed X-Forwarded-For is ignored (host = real socket IP)', rec4.host === '127.0.0.1', `got host=${rec4.host}`);
} finally {
  child.kill('SIGTERM');
  await sleep(200);
  try { child.kill('SIGKILL'); } catch {}
  fs.rmSync(dataDir, { recursive: true, force: true });
}

console.log(`\n==== MASTERLIST SECURITY: ${passed} passed, ${failed} failed ====`);
process.exit(failed > 0 ? 1 : 0);
