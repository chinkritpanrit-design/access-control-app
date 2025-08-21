import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db, logAudit } from './db.js';
dotenv.config();

function ensureRole(name, description='') {
  const existing = db.prepare('SELECT * FROM roles WHERE name=?').get(name);
  if (existing) return existing.id;
  const info = db.prepare('INSERT INTO roles (name, description) VALUES (?,?)').run(name, description);
  return info.lastInsertRowid;
}

function ensureUser(email, password, name='Admin User', dept='IT') {
  const existing = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (existing) return existing.id;
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (email, name, dept, password_hash) VALUES (?,?,?,?)').run(email, name, dept, hash);
  return info.lastInsertRowid;
}

const adminRoleId = ensureRole('Admin', 'Full administrative privileges');
const viewerRoleId = ensureRole('Viewer', 'Read-only access');

const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';
const adminId = ensureUser(adminEmail, adminPass, 'System Admin', 'IT');

// grant admin role
db.prepare('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)').run(adminId, adminRoleId);

logAudit(adminId, 'SEED_COMPLETE', { adminEmail });

console.log('Seed complete. Admin:', adminEmail, 'Password:', adminPass);
