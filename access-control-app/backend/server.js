import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db, logAudit } from './db.js';
import authRouter from './auth.js';
import { authRequired, adminOnly } from './middleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRouter);

// Me
app.get('/api/me', authRequired, (req, res)=>{
  const user = db.prepare('SELECT id, email, name, dept, status, created_at FROM users WHERE id=?').get(req.user.id);
  const roles = db.prepare('SELECT r.id, r.name FROM roles r JOIN user_roles ur ON r.id=ur.role_id WHERE ur.user_id=?').all(req.user.id);
  res.json({ user, roles });
});

// Users (Admin only for list/create/update/delete)
app.get('/api/users', authRequired, adminOnly, (req, res)=>{
  const users = db.prepare('SELECT id, email, name, dept, status, created_at FROM users').all();
  res.json(users);
});

app.post('/api/users', authRequired, adminOnly, (req,res)=>{
  const { email, name, dept, password, status } = req.body || {};
  if (!email || !password) return res.status(400).json({error:'email & password required'});
  const bcrypt = (await import('bcryptjs')).default;
  const hash = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (email, name, dept, status, password_hash) VALUES (?,?,?,?,?)');
  try {
    const info = stmt.run(email, name||'', dept||'', status||'active', hash);
    logAudit(req.user.id, 'USER_CREATE', { targetUserId: info.lastInsertRowid, email });
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({error: e.message});
  }
});

app.put('/api/users/:id', authRequired, adminOnly, (req, res)=>{
  const id = Number(req.params.id);
  const { name, dept, status } = req.body || {};
  db.prepare('UPDATE users SET name=?, dept=?, status=? WHERE id=?').run(name||'', dept||'', status||'active', id);
  logAudit(req.user.id, 'USER_UPDATE', { targetUserId: id });
  res.json({ ok: true });
});

app.delete('/api/users/:id', authRequired, adminOnly, (req, res)=>{
  const id = Number(req.params.id);
  db.prepare('DELETE FROM users WHERE id=?').run(id);
  logAudit(req.user.id, 'USER_DELETE', { targetUserId: id });
  res.json({ ok: true });
});

// Roles
app.get('/api/roles', authRequired, (req,res)=>{
  const roles = db.prepare('SELECT * FROM roles').all();
  res.json(roles);
});

app.post('/api/roles', authRequired, adminOnly, (req,res)=>{
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({error:'name required'});
  try {
    const info = db.prepare('INSERT INTO roles (name, description) VALUES (?,?)').run(name, description||'');
    logAudit(req.user.id, 'ROLE_CREATE', { roleId: info.lastInsertRowid, name });
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({error:e.message});
  }
});

app.put('/api/roles/:id', authRequired, adminOnly, (req,res)=>{
  const id = Number(req.params.id);
  const { name, description } = req.body || {};
  db.prepare('UPDATE roles SET name=?, description=? WHERE id=?').run(name||'', description||'', id);
  logAudit(req.user.id, 'ROLE_UPDATE', { roleId: id });
  res.json({ ok: true });
});

app.delete('/api/roles/:id', authRequired, adminOnly, (req,res)=>{
  const id = Number(req.params.id);
  db.prepare('DELETE FROM roles WHERE id=?').run(id);
  logAudit(req.user.id, 'ROLE_DELETE', { roleId: id });
  res.json({ ok: true });
});

// Assign roles to user
app.get('/api/users/:id/roles', authRequired, adminOnly, (req,res)=>{
  const id = Number(req.params.id);
  const roles = db.prepare('SELECT r.* FROM roles r JOIN user_roles ur ON r.id=ur.role_id WHERE ur.user_id=?').all(id);
  res.json(roles);
});

app.post('/api/users/:id/roles', authRequired, adminOnly, (req,res)=>{
  const id = Number(req.params.id);
  const { roleIds } = req.body || {};
  if (!Array.isArray(roleIds)) return res.status(400).json({error:'roleIds array required'});
  // Clear then insert
  db.prepare('DELETE FROM user_roles WHERE user_id=?').run(id);
  const insert = db.prepare('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)');
  const trx = db.transaction((ids)=>{
    ids.forEach(rid=> insert.run(id, rid));
  });
  trx(roleIds);
  logAudit(req.user.id, 'USER_ROLES_SET', { targetUserId: id, roleIds });
  res.json({ ok: true });
});

// Access Requests
app.get('/api/requests', authRequired, (req,res)=>{
  const userId = req.user.id;
  const roles = db.prepare('SELECT r.name FROM roles r JOIN user_roles ur ON r.id=ur.role_id WHERE ur.user_id=?').all(userId).map(r=>r.name);
  let rows;
  if (roles.includes('Admin')) {
    rows = db.prepare(`
      SELECT ar.*, u.email as user_email, r.name as role_name, a.email as approver_email
      FROM access_requests ar
      JOIN users u ON ar.user_id=u.id
      JOIN roles r ON ar.role_id=r.id
      LEFT JOIN users a ON ar.approver_id=a.id
      ORDER BY ar.id DESC
    `).all();
  } else {
    rows = db.prepare(`
      SELECT ar.*, r.name as role_name
      FROM access_requests ar
      JOIN roles r ON ar.role_id=r.id
      WHERE ar.user_id=?
      ORDER BY ar.id DESC
    `).all(userId);
  }
  res.json(rows);
});

app.post('/api/requests', authRequired, (req,res)=>{
  const { role_id, reason } = req.body || {};
  if (!role_id) return res.status(400).json({error:'role_id required'});
  const info = db.prepare('INSERT INTO access_requests (user_id, role_id, reason) VALUES (?,?,?)').run(req.user.id, role_id, reason||'');
  logAudit(req.user.id, 'REQUEST_CREATE', { requestId: info.lastInsertRowid, role_id });
  res.json({ id: info.lastInsertRowid });
});

app.post('/api/requests/:id/approve', authRequired, adminOnly, (req,res)=>{
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM access_requests WHERE id=?').get(id);
  if (!row) return res.status(404).json({error:'not found'});
  db.prepare('UPDATE access_requests SET status="APPROVED", approver_id=?, updated_at=datetime("now") WHERE id=?').run(req.user.id, id);
  // Grant role
  db.prepare('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)').run(row.user_id, row.role_id);
  logAudit(req.user.id, 'REQUEST_APPROVE', { requestId: id });
  res.json({ ok: true });
});

app.post('/api/requests/:id/deny', authRequired, adminOnly, (req,res)=>{
  const id = Number(req.params.id);
  db.prepare('UPDATE access_requests SET status="DENIED", approver_id=?, updated_at=datetime("now") WHERE id=?').run(req.user.id, id);
  logAudit(req.user.id, 'REQUEST_DENY', { requestId: id });
  res.json({ ok: true });
});

// Audit logs (Admin only)
app.get('/api/audit-logs', authRequired, adminOnly, (req,res)=>{
  const rows = db.prepare(`
    SELECT al.*, u.email as user_email
    FROM audit_logs al LEFT JOIN users u ON al.user_id=u.id
    ORDER BY al.id DESC LIMIT 200
  `).all();
  res.json(rows);
});

app.listen(PORT, ()=>{
  console.log('API listening on port', PORT);
});
