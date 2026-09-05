# OrbitLens Backend

Multi-modal Chandrayaan-2 image registration system — backend infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser / API clients                                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────────┐
│  web-backend  (Node 24 / Express 5 / TypeScript)                │
│  Auth · Image upload · Job management · Socket.io               │
│  Port 5000                                                      │
└────────┬─────────────────┬───────────────────────────────────────┘
         │ Redis/BullMQ    │ HTTP (internal)
┌────────▼──────┐  ┌───────▼────────────────────────────────────┐
│  Redis 7      │  │  processing-service  (Python / FastAPI)    │
│  Port 6379    │  │  CV pipeline · Celery workers              │
└───────────────┘  │  Port 8000                                 │
                   └───────────────────┬────────────────────────┘
                                       │ boto3
┌──────────────────────────────────────▼────────────────────────┐
│  MinIO / AWS S3  (object storage)                             │
│  Imagery + model weights + artifacts                          │
└────────────────────────────────────────────────────────────────┘
```

---

## Quick Start (Local Dev)

### 1. Infrastructure

```bash
# Start Redis + MinIO (auto-creates orbitlens-imagery bucket)
docker compose up -d
```

### 2. web-backend

```bash
cd web-backend

# Copy and fill in your env vars
cp .env.example .env

# Install deps (Node 24 required)
npm install

# Start dev server (hot-reload)
npm run dev
```

API available at **http://localhost:5000**

### 3. processing-service

```bash
cd processing-service

# Create virtual environment (Python 3.12 required)
python -m venv .venv
.venv\Scripts\activate          # Windows
# or: source .venv/bin/activate  # macOS/Linux

# Install deps (GDAL required for rasterio — see Dockerfile for apt packages)
pip install -r requirements.txt

# Copy and fill in env vars
cp .env.example .env

# Start FastAPI server
uvicorn app.main:app --reload --port 8000

# Start Celery workers (separate terminal)
celery -A app.workers.tasks.celery_app worker \
  --queues registration,metadata \
  --concurrency 2 \
  --loglevel info
```

---

## API Reference

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/v1/auth/register` | Email/password registration |
| `POST` | `/api/v1/auth/login` | Login → access token + HttpOnly refresh cookie |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token |
| `POST` | `/api/v1/auth/logout` | Revoke session |
| `GET`  | `/api/v1/auth/google` | Initiate Google OAuth |

### Images — Presigned Upload Flow

```
POST /api/v1/images/upload-url
  → { image, uploadUrl }          # presigned S3 PUT URL

Client PUTs directly to S3 using uploadUrl

POST /api/v1/images/:id/confirm   # mark upload complete
```

### Registration Jobs

```
POST /api/v1/jobs         # create & enqueue job
GET  /api/v1/jobs/:id     # poll status
GET  /api/v1/jobs/:id/metrics    # RMSE, inlier ratio, coverage
GET  /api/v1/jobs/:id/artifacts  # presigned GET URLs for outputs
```

### Real-time Updates

Connect via Socket.io with an access token:
```js
const socket = io('http://localhost:5000', {
  auth: { token: accessToken }
});
socket.on('job:update', (job) => console.log(job));
```

### Health

```
GET /health   # liveness
GET /ready    # readiness (MongoDB + Redis + S3)
```

---

## Security Architecture

| Control | Implementation |
|---------|---------------|
| Passwords | bcrypt cost 12 |
| Access tokens | JWT HS256, 15min |
| Refresh tokens | JWT HS256, 7d, hashed at rest, rotation with reuse detection |
| Account lockout | 5 failures → 15min lockout |
| OAuth tokens | AES-256-GCM encrypted at rest |
| Internal service auth | X-Internal-Key (timing-safe compare) |
| Imagery upload | Presigned S3 PUT URLs — never proxied through Node |
| Input validation | Zod on every route (Node) + Pydantic (Python) |
| NoSQL injection | express-mongo-sanitize |
| Security headers | helmet |
| Rate limiting | 100rpm global / 10rpm auth / 20rpm job-creation |
| CORS | Explicit allowlist only |

---

## CV Pipeline Stages

```
Ingest (PDS4/GeoTIFF) → Preprocess (CLAHE + bilateral) → Pyramid
→ Detect (SIFT / LightGlue) → Match (ratio test) → Merge pyramid levels
→ RANSAC/MAGSAC → Coverage enforcement (NxN grid)
→ Warp (bicubic GeoTIFF) → Metrics (RMSE, inlier ratio, coverage)
→ Upload artifacts → Callback to web-backend
```

Sensor pairs supported: OHRC ↔ TMC, OHRC ↔ IIRS, TMC ↔ IIRS, GeoTIFF ↔ GeoTIFF.

---

## Environment Variables

| Service | File |
|---------|------|
| web-backend | [`web-backend/.env.example`](web-backend/.env.example) |
| processing-service | [`processing-service/.env.example`](processing-service/.env.example) |

---

## Algorithm Benchmark Log

See [`docs/ALGORITHM_NOTES.md`](docs/ALGORITHM_NOTES.md) for the living benchmark log.

---

## Project Structure

```
Orbit_Lens/
├── docker-compose.yml          # Redis + MinIO for local dev
├── docs/
│   └── ALGORITHM_NOTES.md
├── web-backend/                # Node 24 / Express 5 / TypeScript
│   ├── src/
│   │   ├── config/             # env, db, queue, storage, passport
│   │   ├── middleware/         # requireAuth, validate, roleGuard, errorHandler
│   │   ├── modules/            # auth, users, projects, images, jobs, metrics, health
│   │   ├── services/           # processingClient, email
│   │   ├── sockets/            # Socket.io JWT rooms
│   │   └── utils/              # jwt, encryption, ownershipCheck, tokenCompare
│   └── package.json
└── processing-service/         # Python 3.12 / FastAPI / Celery
    ├── app/
    │   ├── api/                # Internal routes + auth dep
    │   ├── pipeline/           # All CV stages
    │   │   ├── detectors/      # classical (SIFT/ORB/AKAZE), learned (LightGlue)
    │   │   └── ...
    │   ├── storage/            # S3 client
    │   └── workers/            # Celery tasks
    ├── tests/
    └── requirements.txt
```
