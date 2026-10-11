// GTAMP Website - simple JSON-file store (lowdb-style, no external deps)
const fs = require('fs');
const path = require('path');

const BASE_DIR = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(BASE_DIR, 'data');
const COLLECTIONS = ['users', 'servers', 'upvotes', 'forum_categories', 'forum_posts',
  'forum_replies', 'assets', 'licenses', 'badges', 'user_badges', 'settings', 'docs', 'artifacts'];

function fileFor(name) { return path.join(DATA_DIR, name + '.json'); }

function load(name, fallback) {
  try {
    const raw = fs.readFileSync(fileFor(name), 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
function save(name, data) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(fileFor(name), JSON.stringify(data, null, 2));
    return true;
  } catch (e) { return false; }
}

function ensure(name, fallback) {
  if (!fs.existsSync(fileFor(name))) save(name, fallback);
  return load(name, fallback);
}

function nextId(coll) {
  const arr = load(coll, []);
  let max = 0;
  for (const r of arr) if (r && Number(r.id) > max) max = Number(r.id);
  return max + 1;
}

module.exports = { DATA_DIR, load, save, ensure, nextId, COLLECTIONS };
