# SkillBridge

Peer-to-peer skill exchange for students. React + Vite + Tailwind v4 frontend, Express + MongoDB backend, JWT in HttpOnly cookies.

## Setup
1. Create a free MongoDB Atlas cluster and copy its connection string.
2. Backend:
   ```
   cd backend && cp .env.example .env   # fill in MONGODB_URI and a long random JWT_SECRET
   npm install && npm run dev           # http://localhost:5000/api/health
   ```
3. Frontend (new terminal):
   ```
   cd frontend && npm install && npm run dev   # http://localhost:5173
   ```
Vite proxies `/api` to the backend in development, so cookies stay same-origin.

## Environment variables (backend/.env)
`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV` (set `production` when deployed over HTTPS).
For a separately hosted frontend, set `VITE_API_URL` in the frontend build to your API's `/api` URL.

## API
`/api/auth/{register,login,logout,me}` · `/api/skills` (GET with search, category, level, mine; POST; PUT/DELETE /:id) · `/api/users/{stats,me,:id}` · `/api/requests` (POST, GET ?box=incoming|sent, PATCH /:id/status) · `/api/notifications` (GET, PATCH /read-all, PATCH /:id/read) · `/api/health`

## Testing checklist
- [ ] Register (bad email, short password, mismatch show errors), log in, log out, /app redirects when logged out
- [ ] Create, edit, delete (confirm) a skill; search and filter on Discover
- [ ] With two accounts: A requests B's skill offering one of A's; B sees it and an alert
- [ ] Duplicate pending request is rejected; requesting your own skill is blocked
- [ ] B accepts/rejects; A is notified. A cancels a pending request; B is notified
- [ ] Only the recipient can accept/reject and only the sender can cancel (try via API)
- [ ] Editing or deleting another user's skill returns 403
- [ ] Edit profile; view another student's profile
- [ ] Mark one / all notifications read; badge updates
- [ ] `npm run build` in frontend, `GET /api/health` returns ok

## Demo data
```
cd backend
node seed.js "Your Name" you@email.com yourPassword
```
(or `npm run seed` for the default demo account `demo@demo.skillbridge.dev` / `demo1234`).
This puts on YOUR account: 15 skills (every category, every level), 16 incoming requests (pending, accepted, rejected, cancelled), 10 sent requests and the matching alerts.
It also adds 30 other students with 216 skills: every topic is taught by 3 different students at 3 levels, so searching "react" or "spanish" returns several teachers.
If the email already exists it is reused (name and password are updated); otherwise it is created. Re-running resets only your data and the `@demo.skillbridge.dev` students.

## Deploy (one URL, free-tier friendly)
Express serves the built frontend, so there is a single service and no cross-site cookie problems.
- Build command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
- Start command: `cd backend && npm start`
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL` (your public URL)
- Atlas Network Access must allow the host (use `0.0.0.0/0` for a demo).
