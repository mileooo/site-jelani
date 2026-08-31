import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

import worker from './_worker.js';

function normalizeBinding(value) {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
}

function normalizeRow(row) {
  return row ? Object.fromEntries(Object.entries(row)) : row;
}

class D1Statement {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new D1Statement(this.database, this.sql, values.map(normalizeBinding));
  }

  run() {
    const result = this.database.sqlite.prepare(this.sql).run(...this.values);
    return Promise.resolve({
      success: true,
      meta: {
        changes: Number(result.changes || 0),
        last_row_id: Number(result.lastInsertRowid || 0)
      }
    });
  }

  first(column) {
    const row = this.database.sqlite.prepare(this.sql).get(...this.values);
    if (column) return Promise.resolve(row?.[column] ?? null);
    return Promise.resolve(normalizeRow(row) ?? null);
  }

  all() {
    const results = this.database.sqlite.prepare(this.sql).all(...this.values).map(normalizeRow);
    return Promise.resolve({ success: true, results });
  }
}

export class D1Database {
  constructor(filename) {
    this.sqlite = new DatabaseSync(filename);
    this.sqlite.exec('PRAGMA foreign_keys = ON');
    this.sqlite.exec('PRAGMA journal_mode = WAL');
    this.sqlite.exec('PRAGMA synchronous = NORMAL');
    this.sqlite.exec('PRAGMA busy_timeout = 5000');
  }

  prepare(sql) {
    return new D1Statement(this, sql);
  }

  async batch(statements) {
    const results = [];
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      for (const statement of statements) {
        if (!(statement instanceof D1Statement) || statement.database !== this) {
          throw new TypeError('Invalid database statement');
        }
        if (/^\s*(SELECT|PRAGMA|WITH)\b/i.test(statement.sql)) {
          results.push(await statement.all());
        } else {
          results.push(await statement.run());
        }
      }
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }

  exec(sql) {
    this.sqlite.exec(sql);
    return Promise.resolve({ success: true });
  }

  close() {
    this.sqlite.close();
  }
}

function requestUrl(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto === 'https' ? 'https' : 'http';
  const host = req.headers.host || '127.0.0.1';
  return new URL(req.url || '/', `${protocol}://${host}`);
}

function webRequest(req) {
  const method = req.method || 'GET';
  const init = { method, headers: req.headers };
  if (!['GET', 'HEAD'].includes(method)) {
    init.body = req;
    init.duplex = 'half';
  }
  return new Request(requestUrl(req), init);
}

function writeResponse(res, response) {
  res.statusCode = response.status;
  const setCookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [];
  for (const [name, value] of response.headers) {
    if (name.toLowerCase() !== 'set-cookie') res.setHeader(name, value);
  }
  if (setCookies.length) res.setHeader('set-cookie', setCookies);
  return response.arrayBuffer().then(body => res.end(Buffer.from(body)));
}

export function createRuntime(options = {}) {
  const databasePath = options.databasePath || process.env.DATABASE_PATH || '/var/lib/jjelani/jjelani.sqlite';
  const database = options.database || new D1Database(databasePath);
  const env = { ...process.env, ...options.env, DB: database };

  const server = http.createServer(async (req, res) => {
    try {
      const response = await worker.fetch(webRequest(req), env);
      await writeResponse(res, response);
    } catch (error) {
      console.error('Unhandled request error', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ ok: false, error: 'Внутренняя ошибка сервера' }));
    }
  });

  let reconciliationRunning = false;
  const reconcile = async () => {
    if (reconciliationRunning) return;
    reconciliationRunning = true;
    const tasks = [];
    try {
      await worker.scheduled({}, env, {
        waitUntil(task) {
          tasks.push(Promise.resolve(task));
        }
      });
      await Promise.all(tasks);
    } catch (error) {
      console.error('Payment reconciliation failed', error);
    } finally {
      reconciliationRunning = false;
    }
  };

  const timer = setInterval(reconcile, 5 * 60 * 1000);
  timer.unref();

  return {
    database,
    env,
    server,
    async close() {
      clearInterval(timer);
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      database.close();
    }
  };
}

export function startServer(options = {}) {
  const runtime = createRuntime(options);
  const port = Number(options.port || process.env.PORT || 8787);
  const host = options.host || process.env.HOST || '127.0.0.1';
  runtime.server.listen(port, host, () => {
    console.log(`JELANI API listening on http://${host}:${port}`);
  });

  const shutdown = signal => {
    console.log(`${signal}: shutting down`);
    runtime.close()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Shutdown failed', error);
        process.exit(1);
      });
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return runtime;
}

const isEntrypoint = process.argv[1]
  && path.basename(process.argv[1]) === path.basename(fileURLToPath(import.meta.url));

if (isEntrypoint) startServer();
