import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { db, logAudit } from './db.js';
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({error: 'Email and password required'});
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!user) return res.status(401).json({error:'Invalid credentials'});
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({error:'Invalid credentials'});
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
  logAudit(user.id, 'LOGIN', { email });
  res.json({ token });
});

export default router;
