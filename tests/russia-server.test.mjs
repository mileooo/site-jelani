import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { D1Database } from '../server-russia.mjs';

test('Russian server D1 adapter persists SQLite data and batches atomically', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'jjelani-db-'));
  const filename = path.join(directory, 'test.sqlite');
  const db = new D1Database(filename);

  try {
    await db.prepare('CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)').run();
    await db.batch([
      db.prepare('INSERT INTO items (name) VALUES (?)').bind('one'),
      db.prepare('INSERT INTO items (name) VALUES (?)').bind('two')
    ]);

    assert.deepEqual(await db.prepare('SELECT name FROM items WHERE id = ?').bind(1).first(), { name: 'one' });
    assert.deepEqual(
      (await db.prepare('SELECT name FROM items ORDER BY id').all()).results,
      [{ name: 'one' }, { name: 'two' }]
    );

    await assert.rejects(
      db.batch([
        db.prepare('INSERT INTO items (name) VALUES (?)').bind('three'),
        db.prepare('INSERT INTO missing_table (name) VALUES (?)').bind('broken')
      ])
    );
    assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM items').first()).count, 2);
  } finally {
    db.close();
    await rm(directory, { recursive: true, force: true });
  }
});
