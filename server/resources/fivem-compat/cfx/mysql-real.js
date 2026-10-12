// Real MySQL backend for the cfx-compat runtime, backed by the vendored
// mysql2 single-file bundle (vendor/mysql2.bundle.cjs, MIT).
//
// Implements the runtime's `adapter.mysql` contract:
//   query(sql, values)   -> Promise<rows>          (text protocol, MySQL.query)
//   execute(sql, values) -> Promise<result packet>  (prepared, MySQL.execute/.insert)
//   queryRaw(sql)        -> Promise<[rows, fields]> (test/debug helper)
//   end()                -> close the pool
//
// Connection config comes from fivem_resources/mysql.json (the file the
// README already documents) with defaults matching tools/setup-db.sh:
//   { "host": "127.0.0.1", "port": 3307, "user": "root", "password": "", "database": "fivem" }
import { createRequire } from 'module';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

export function loadMysqlConfig(resourcesDir) {
  const cfgPath = resourcesDir
    ? path.join(resourcesDir, 'mysql.json')
    : path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fivem_resources', 'mysql.json');
  const defaults = { host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' };
  try {
    const raw = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    return { ...defaults, ...raw };
  } catch {
    return defaults;
  }
}

// oxmysql parameter semantics (documented at overextended.dev/docs/oxmysql):
//   - array params bind to '?' positionally
//   - object params bind to ':name'/'@name' named placeholders
//   - object params with a '?'-only query bind by value order
//     (qb-core does this everywhere: MySQL.prepare.await('... = ?', { citizenid }))
function normalizeParams(sql, values) {
  if (values === null || values === undefined) return [];
  if (Array.isArray(values)) return values;
  if (typeof values === 'object') {
    const hasNamed = /[:@][A-Za-z_][A-Za-z0-9_]*/.test(String(sql));
    if (hasNamed) return values;      // handled by mysql2 namedPlaceholders
    return Object.values(values);     // '?' + object: bind values in order
  }
  return [values];
}

export async function createRealMysql(config = null) {
  const cfg = config || loadMysqlConfig();
  const mysql = require('../vendor/mysql2.bundle.cjs');
  const pool = mysql.createPool({
    host: cfg.host, port: Number(cfg.port) || 3306,
    user: cfg.user, password: cfg.password, database: cfg.database,
    connectionLimit: 8, multipleStatements: false,
    namedPlaceholders: true, // :name / @name object params (oxmysql semantics)
    dateStrings: false, // DATETIME -> JS Date; the runtime JSON-encodes it
  });

  // verify connectivity eagerly so misconfiguration surfaces at boot, not mid-query
  await pool.query('SELECT 1');

  return {
    kind: 'mysql2-real',
    config: { ...cfg, password: '***' },

    async query(sql, values) {
      const [rows] = await pool.query(sql, normalizeParams(sql, values));
      return rows;
    },

    async execute(sql, values) {
      const [result] = await pool.execute(sql, normalizeParams(sql, values));
      return result;
    },

    // oxmysql-style bulk transaction: queries = [{query, params|values}, ...]
    // or plain SQL strings. Runs on one pooled connection, all-or-nothing.
    async transaction(queries) {
      const conn = await pool.getConnection();
      try {
        await conn.query('START TRANSACTION');
        for (const q of queries) {
          const sql = typeof q === 'string' ? q : q.query;
          const params = typeof q === 'string' ? [] : (q.params || q.values || []);
          if (!sql) throw new Error('transaction: entry missing query string');
          await conn.execute(sql, normalizeParams(sql, Array.isArray(params) ? params : [params]));
        }
        await conn.query('COMMIT');
        return true;
      } catch (e) {
        try { await conn.query('ROLLBACK'); } catch { /* connection already dead */ }
        throw e;
      } finally {
        conn.release();
      }
    },

    async queryRaw(sql, values) {
      return pool.query(sql, values || []);
    },

    async end() {
      await pool.end();
    },
  };
}
