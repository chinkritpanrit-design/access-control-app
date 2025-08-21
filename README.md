# Access Control Web App (ITGC-friendly)

A minimal full-stack starter for Access Control:
- Backend: Node.js (Express) + SQLite (better-sqlite3)
- Frontend: React + Vite

## Prereqs
- Node.js 18+

## Run backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
API: http://localhost:4000

## Run frontend
```bash
cd ../frontend
npm install
npm run dev
```
UI: http://localhost:5173

## Default admin
- Email: `admin@example.com`
- Password: `Admin123!`

> This is a demo starter. For production: move to Postgres, add MFA/SSO, rate limiting, password policy, and secure JWT handling.
