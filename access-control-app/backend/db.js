import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const dbFile = process.env.SQLITE_DB_FILE || './data.db';
export const db = new Database(dbFile);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if not exists
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  dept TEXT,
  status TEXT DEFAULT 'active',
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  UNIQUE(user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS access_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, DENIED
  approver_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
`);

export function logAudit(userId, action, detailsObj) {
  const details = typeof detailsObj === 'string' ? detailsObj : JSON.stringify(detailsObj || {});
  db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?,?,?)').run(userId || null, action, details);
}
