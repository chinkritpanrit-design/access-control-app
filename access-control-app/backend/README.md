# Access Control Backend

Simple Express + SQLite (better-sqlite3) API for Access Control (ITGC-ready).

## Quick start
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
API default: `http://localhost:4000`

## Endpoints (selection)
- POST `/api/auth/login` { email, password }
- GET `/api/me`
- GET/POST/PUT/DELETE `/api/users` (admin)
- GET/POST/PUT/DELETE `/api/roles` (admin for write)
- GET `/api/users/:id/roles` (admin)
- POST `/api/users/:id/roles` (admin) { roleIds: number[] }
- GET/POST `/api/requests`
- POST `/api/requests/:id/approve` (admin)
- POST `/api/requests/:id/deny` (admin)
- GET `/api/audit-logs` (admin)
