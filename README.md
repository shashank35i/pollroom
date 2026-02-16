# PollRoom — Real‑Time Poll Rooms

<p align="center">
  <strong>Fast poll creation, single‑choice voting, and live results with Socket.IO.</strong><br/>
  Built with React, Node.js, and PostgreSQL for a smooth real‑time experience.
</p>

<p align="center">
  <a href="#-overview">Overview</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-project-structure">Project Structure</a> ·
  <a href="#-api--socket-contracts">API & Socket Contracts</a> ·
  <a href="#-fairness--anti-abuse">Fairness</a> ·
  <a href="#-local-development">Local Dev</a> ·
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ Overview

PollRoom is a focused, real‑time polling app where anyone can create a poll, share a short link, and see results update instantly across all viewers. It’s built for speed, clarity, and correctness, with persistence and basic anti‑abuse controls baked in.

---

## ✅ Features

- **Create polls** with 2–6 options
- **Shareable links** like `/p/:pollId`
- **Single‑choice voting**
- **Live results** via Socket.IO
- **Persistent storage** (PostgreSQL)
- **Anti‑abuse protections** (clientId + IP rate limits)
- **Focused public view** (shared links hide sidebar)

---

## ⚡ Tech Stack

**Frontend**
- React + Vite + TypeScript
- TanStack Query
- Tailwind CSS

**Backend**
- Node.js + Express
- Socket.IO
- Prisma + PostgreSQL
- Zod validation

---

## 📂 Project Structure

```
.
├── client/                # React app
├── server/                # Express + Socket.IO
├── prisma/                # Prisma schema + migrations
├── script/                # Build/dev helpers
├── docker-compose.yml     # Local Postgres
└── README.md
```

---

## 🔗 API & Socket Contracts

### REST API

**POST** `/api/polls`
```json
{ "question": "string", "options": ["string", "string"] }
```
Response:
```json
{ "pollId": "abc123xyz0", "shareUrl": "https://your-app/p/abc123xyz0" }
```

**GET** `/api/polls/:pollId`  
Header: `X-Client-Id: <string>`
```json
{
  "pollId": "abc123xyz0",
  "question": "What should we build next?",
  "options": [{ "id": "opt1", "text": "Feature A" }],
  "results": [{ "optionId": "opt1", "votes": 0 }],
  "totalVotes": 0,
  "userStatus": { "hasVoted": false },
  "shareUrl": "https://your-app/p/abc123xyz0"
}
```

**POST** `/api/polls/:pollId/vote`  
Header: `X-Client-Id: <string>`
```json
{ "optionId": "opt1" }
```
Errors:
- `403` → `{ "message": "Already voted" }`
- `429` → `{ "message": "Too many requests", "retryAfterSeconds": 30 }`

### Socket.IO

Client emits:
```
poll:join { pollId }
```
Server emits:
```
poll:state { pollId, results, totalVotes }
poll:error { message }
```

---

## 🛡️ Fairness & Anti‑Abuse

**1) One vote per poll per clientId**  
Database enforces `UNIQUE(poll_id, client_id)` so each client can vote once.

**2) IP + poll rate limiting**  
Limits vote bursts per IP + poll to reduce spam.

**Limitations**
- New devices/incognito can bypass clientId
- Shared IP networks can be throttled

---

## 🔄 Realtime Fallback

If sockets drop, the Poll Room shows a reconnect banner and allows manual Refresh via REST.

Shared links open a focused poll view without sidebar to reduce distraction.

---

## 🗄️ Database Schema

- `Poll(id, question, created_at)`
- `PollOption(id, poll_id, text)`
- `Vote(id, poll_id, option_id, client_id, ip_hash, created_at)`

Indexes:
- `UNIQUE (poll_id, client_id)`
- `INDEX (poll_id)`
- `INDEX (option_id)`

---

## 🧪 Local Development

### 1) Start Postgres
```bash
docker compose up -d
```

### 2) Install dependencies
```bash
npm install
```

### 3) Run migrations
```bash
npx prisma migrate dev
```

### 4) Start app
```bash
npm run dev
```

Frontend: `http://localhost:5000`  
API: `http://localhost:5001`

---

## 🔑 Environment Variables

```
DATABASE_URL="postgresql://pollrooms:pollrooms@localhost:5432/pollrooms?schema=public"
IP_HASH_SALT="change-me"
PUBLIC_BASE_URL="http://localhost:5000"
CORS_ORIGIN="http://localhost:5000"
```

---

## 🚀 Deployment

**Split Deploy**
- API: Render / Railway / Fly
- Web: Vercel / Netlify
- Set `PUBLIC_BASE_URL` and `CORS_ORIGIN` to production URLs

**Single Deploy**
- `npm run build`
- `npm run start`

---

## 📌 Roadmap

- Poll closing / freeze votes
- Auth + poll ownership
- Analytics dashboard
- CAPTCHA for stronger abuse defense

---

## 📄 License

MIT
