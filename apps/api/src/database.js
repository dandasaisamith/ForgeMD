import Database from 'better-sqlite3';
import config from './config.js';

const db = new Database(config.storage.dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    conversion_time INTEGER,
    output_path TEXT,
    status TEXT NOT NULL,
    error TEXT
  );
  
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.exec(`ALTER TABLE documents ADD COLUMN group_id TEXT REFERENCES groups(id)`);
} catch (err) {
  // Ignore if column already exists
}

export const addDocument = (doc) => {
  const stmt = db.prepare(`
    INSERT INTO documents (id, filename, type, size, status)
    VALUES (@id, @filename, @type, @size, @status)
  `);
  stmt.run(doc);
};

export const updateDocument = (id, updates) => {
  const keys = Object.keys(updates);
  const setClause = keys.map(k => `${k} = @${k}`).join(', ');
  const stmt = db.prepare(`UPDATE documents SET ${setClause} WHERE id = @id`);
  stmt.run({ ...updates, id });
};

export const getDocument = (id) => {
  return db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
};

export const listDocuments = (limit = 50, offset = 0) => {
  return db.prepare('SELECT * FROM documents ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
};

export const createGroup = (group) => {
  const stmt = db.prepare(`INSERT INTO groups (id, name) VALUES (@id, @name)`);
  stmt.run(group);
};

export const updateGroup = (id, name) => {
  const stmt = db.prepare(`UPDATE groups SET name = ? WHERE id = ?`);
  stmt.run(name, id);
};

export const deleteGroup = (id) => {
  // First, unset the group_id for all documents in this group
  db.prepare(`UPDATE documents SET group_id = NULL WHERE group_id = ?`).run(id);
  // Then delete the group
  db.prepare(`DELETE FROM groups WHERE id = ?`).run(id);
};

export const listGroups = () => {
  return db.prepare('SELECT * FROM groups ORDER BY created_at DESC').all();
};

export const getGroup = (id) => {
  return db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
};

export const getDocumentsByGroup = (groupId) => {
  return db.prepare('SELECT * FROM documents WHERE group_id = ? AND status = "COMPLETED"').all(groupId);
};

export default db;
