import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { db } from './db.js';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export function authRequired(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({error: 'Unauthorized'});
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({error: 'Invalid token'});
  }
}

export function adminOnly(req, res, next) {
  // Check if user has Admin role
  const roles = db.prepare('SELECT r.name FROM roles r JOIN user_roles ur ON r.id=ur.role_id WHERE ur.user_id=?').all(req.user.id).map(r=>r.name);
  if (!roles.includes('Admin')) {
    return res.status(403).json({error: 'Admin only'});
  }
  next();
}
