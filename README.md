# Real-Time Poll Rooms

Real-Time Poll Rooms is a React + Node.js app where users can create poll rooms, share links, join instantly, cast a single-choice vote, and watch results update live across all connected clients.

## Features Checklist (Assignment Alignment)

- [x] Poll creation (`POST /api/polls`)
- [x] Shareable poll links (`/p/:pollId`)
- [x] Join by link or poll ID
- [x] Single-choice voting (`POST /api/polls/:pollId/vote`)
- [x] Real-time updates to all viewers via Socket.IO room broadcasts
- [x] Two server-side anti-abuse mechanisms
- [x] PostgreSQL persistence (polls/options/votes survive restarts)
- [x] Deployment-ready API with env-driven config + health endpoint

## Tech Stack

- Frontend: React, Vite, TypeScript, TanStack Query, Socket.IO Client
- Backend: Node.js, Express, TypeScript, Socket.IO, Zod, Helmet, CORS, express-rate-limit
- Database: PostgreSQL + Prisma ORM

## Monorepo Layout

- `client/` - existing Vite React frontend
- `server/` - Express + Socket.IO backend
- `prisma/` - Prisma schema + SQL migrations
- `docker-compose.yml` - local PostgreSQL

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required:

- `DATABASE_URL` - PostgreSQL connection string
- `PUBLIC_BASE_URL` - public app base URL used for generated share links (e.g. `https://yourapp.example.com`)
- `CORS_ORIGIN` - allowed frontend origin(s), comma-separated
- `IP_HASH_SALT` - salt used to hash IP addresses before storing

Useful local/dev:

- `API_PORT` - API port for dev (default `5001`)
- `VITE_API_BASE` - frontend override for API URL (empty for same-origin/proxy)
- `VITE_DEV_API_PROXY` - Vite proxy target for `/api` and `/socket.io` (default `http://localhost:5001`)

## Local DB (Docker)

Start PostgreSQL:

```bash
docker compose up -d
```

Verify container status:

```bash
docker compose ps
```

Run migrations:

```bash
npx prisma migrate dev
```

Stop DB:

```bash
docker compose down
```

Reset DB data (optional):

```bash
docker compose down -v
```

## Local Setup

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run migrations:

```bash
npm run prisma:migrate
```

5. Start app (frontend + backend):

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5000`
- API + Socket.IO: `http://localhost:5001` (proxied by Vite in dev)

## API Contracts

### `POST /api/polls`

Request:

```json
{ "question": "string", "options": ["string", "string"] }
```

Validation:

- `question`: trimmed, 10-140 chars
- `options`: 2-6 items
- each option: trimmed, 1-60 chars
- no duplicate options (case-insensitive)

Response:

```json
{ "pollId": "abc123xyz0", "shareUrl": "https://your-app/p/abc123xyz0" }
```

### `GET /api/polls/:pollId`

Optional header:

- `X-Client-Id: <string>`

Response:

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

### `POST /api/polls/:pollId/vote`

Required header:

- `X-Client-Id: <string>`

Request:

```json
{ "optionId": "opt1" }
```

Behavior:

- `404` if poll not found
- `400` if option is not part of poll or payload invalid
- `403` if same client already voted in poll
- `429` if rate limit exceeded

Success response: updated poll state (same shape as `GET /api/polls/:pollId`).

### `GET /api/health`

Response:

```json
{ "ok": true }
```

### Error Shape

All API errors return:

```json
{ "message": "string", "details": {} }
```

(`details` is present only when useful, e.g. validation failures.)

## Socket.IO Contract

Client emits:

- `poll:join` with `{ pollId }`

Server emits:

- `poll:state` with `{ pollId, results, totalVotes }`
- `poll:error` with `{ message }`

Behavior:

- On join, backend validates `pollId`, joins room, sends latest state to that socket.
- After a successful vote, backend emits fresh `poll:state` to the poll room.

## Fairness / Anti-Abuse Controls

### 1) One vote per poll per clientId

- Enforced in DB with `UNIQUE (poll_id, client_id)` on `Vote`
- Backend returns `403` for duplicate vote attempts

Prevents:

- Duplicate votes from refresh/retry in same browser identity

Limitation:

- Can be bypassed by changing client identity (incognito/new browser/device)

### 2) IP + poll rate limiting

- `express-rate-limit` on `POST /api/polls/:pollId/vote`
- Keyed by `IP + pollId`
- Limit: 10 vote requests / minute / IP / poll

Prevents:

- Rapid vote spam from one network source

Limitation:

- Shared NAT/WiFi can throttle legitimate users behind the same public IP

## Realtime Fallback

- Live updates use Socket.IO (`poll:state`), but the Poll Room also exposes a Refresh button to pull REST state if sockets disconnect.
- UI shows reconnect/offline banners to make fallback behavior explicit.

Shared links open a focused poll view without sidebar to reduce distraction.

Additional telemetry:

- `Vote.ip_hash` stores `sha256(ip + IP_HASH_SALT)` for abuse analytics without raw IP retention.

## Edge Cases Handled

- Invalid poll ID format -> `400`
- Missing/invalid `X-Client-Id` on vote -> `400`
- Poll not found -> `404`
- Option not in poll -> `400`
- Duplicate vote race -> DB unique constraint catches and maps to `403`
- Zero-vote polls -> all options returned with `0` counts
- Graceful shutdown -> closes HTTP server + disconnects Prisma client

## Database Schema

Tables/models:

- `Poll(id, question, created_at)`
- `PollOption(id, poll_id, text)`
- `Vote(id, poll_id, option_id, client_id, ip_hash, created_at)`

Constraints/indexes:

- `UNIQUE (poll_id, client_id)` on `Vote`
- index `Vote(poll_id)`
- index `Vote(option_id)`

## Deployment

### Option A: Split Deploy (recommended)

1. Deploy API (`server/`) to Render/Railway/Fly:
   - Set `DATABASE_URL`, `PUBLIC_BASE_URL`, `CORS_ORIGIN`, `IP_HASH_SALT`
   - Run:
     - build: `npm run build`
     - start: `npm run start`
2. Deploy frontend to Vercel:
   - Set `VITE_API_BASE=https://your-api.example.com`
   - Set API `CORS_ORIGIN=https://your-frontend.example.com`

### Option B: Single Deploy

- Build and run one Node service:
  - `npm run build`
  - `npm run start`
- In production, Express serves static frontend from `dist/public`.

## Public URL Placeholders

- Frontend URL: `https://your-frontend.example.com`
- API URL: `https://your-api.example.com`
- Example share link: `https://your-frontend.example.com/p/abc123xyz0`

## Known Limitations and Improvements

- Current anti-abuse is pragmatic but not Sybil-proof; stronger controls could include signed device tokens, CAPTCHA, and anomaly detection.
- No admin/moderation panel yet (close poll, freeze votes, audit view).
- No authentication or ownership model for poll management.
- No end-to-end/integration test suite yet (recommended next step).
