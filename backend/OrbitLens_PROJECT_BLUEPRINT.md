# OrbitLens — Project Blueprint & Prompt Sheet

### Multi-modal, Sun-angle & Scale-Invariant Lunar Image Registration
### MERN + TypeScript (Web/API tier) + Python CV/ML (Processing tier)

> **Version:** 1.0
> **Document snapshot:** Practices are maintained over time — dependency numbers in this file are **not** authoritative.
> **Audience:** Solo developers, AI coding assistants (Cursor, Copilot, Claude), team developers, hackathon/evaluation reviewers
> **Purpose:** Copy-paste prompts, security checklists, folder structure, algorithm architecture, and API documentation standards for building **OrbitLens** — a system that finds sub-pixel correspondence between Chandrayaan-2 optical images (OHRC, TMC, IIRS) despite illumination, viewpoint, and scale variation.

---

## ⚠️ Version Safety Rule (Read First)

> **Never copy version numbers from this document (or from memory) into `package.json` or `requirements.txt`/`pyproject.toml`.** Old pins stay vulnerable; docs go stale the day they ship.

### For humans

1. Open [npmjs.com](https://www.npmjs.com/) or [pypi.org](https://pypi.org/) for each package — confirm **latest** and read the **Security** / advisory links if shown.
2. Prefer the **newest patched release** on a supported major line — not an old pin "because the tutorial said so."
3. After install: `npm audit` (Node) and `pip-audit` (Python) — fix **high/critical** before shipping.

```bash
# Node
npm show <package-name> version
npm audit

# Python
pip index versions <package-name>
pip-audit
```

### For AI assistants (mandatory)

Before you write or edit **`package.json`**, **`requirements.txt`**, **`pyproject.toml`**, lockfiles, or recommend install commands:

1. **Web search** for each non-trivial dependency, e.g. `"npm <package-name> latest version"`, `"<package-name> CVE"`, `"pip <package-name> latest version"`, `"opencv-python security advisory"`. For **Node.js** search `"Node.js LTS current release"`; for **PyTorch/CUDA** search `"pytorch latest stable release"` and align GPU/CUDA versions with the target deploy host.
2. Cross-check with `npm show <package> version` / `pip index versions <package>` in the terminal when the environment allows.
3. If search turns up an **unpatched CVE** on `latest`, search again for a **patched version** or an alternative package.
4. In your reply, **briefly state** what you verified — do not silently invent versions.
5. Use `^` ranges in `package.json` and unpinned/`>=`-with-upper-bound ranges in Python deps unless you have a documented reason to pin exactly — then pin to a **verified good release**.

**No hardcoded version table in this file** — the tables below are only **names to verify** (not versions).

#### Node / web tier — verify each

| Package | What to search / check |
|---|---|
| `express` | Latest stable major line; Express/Node compatibility; advisories |
| `mongoose` | Latest stable; MongoDB driver / Atlas compatibility |
| `zod` | Latest stable; note betas |
| `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, `helmet`, `cors`, `socket.io` | Same pattern: npm latest + advisory search |
| `bullmq`, `ioredis` | Latest stable; Redis version compatibility |
| `aws-sdk` / `@aws-sdk/client-s3` (or MinIO SDK) | Latest stable; advisory search |

#### Python / CV-ML tier — verify each

| Package | What to search / check |
|---|---|
| `opencv-python` / `opencv-contrib-python` | Latest stable; note SIFT/patented-algorithm licensing status (contrib vs. main) |
| `numpy`, `scipy` | Latest stable compatible with the pinned Python version |
| `torch`, `torchvision` | Latest stable; match CUDA version to deploy GPU/host |
| `rasterio`, `GDAL` | Latest stable; GDAL system-library version must match the Python binding version |
| `fastapi`, `uvicorn` | Latest stable; advisory search |
| `celery` or `rq` | Latest stable; Redis broker compatibility |
| A learned matcher package (e.g. `kornia`, or a vendored SuperPoint/SuperGlue/LoFTR implementation) | Verify license terms (some matcher weights are non-commercial-only — confirm before using in any deployed product) |

Repeat this pattern for **every** dependency you add.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Repository Structure](#2-repository-structure)
3. [Environment Variables](#3-environment-variables)
4. [Web/API Backend Architecture](#4-webapi-backend-architecture)
5. [CV/ML Processing Service Architecture](#5-cvml-processing-service-architecture)
6. [API Documentation Standard](#6-api-documentation-standard)
7. [Backend Security Checklist](#7-backend-security-checklist)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Frontend Security Checklist](#9-frontend-security-checklist)
10. [AI Workflow, CI & Git Hygiene](#10-ai-workflow-ci--git-hygiene)
11. [Postman & Testing Guide](#11-postman--testing-guide)
12. [Master Prompts](#12-master-prompts)
13. [Algorithm Add-On Prompts](#13-algorithm-add-on-prompts)
14. [Document Maintenance](#14-document-maintenance)

---

## 1. Tech Stack

| Layer | Choice | Versions | Notes |
|---|---|---|---|
| **Web runtime** | Node.js | **Web search** current Active LTS | [nodejs.org](https://nodejs.org/) |
| **Web framework** | Express | Search + `npm show` | Orchestration API only — no heavy image math here |
| **Web language** | TypeScript | Search + `npm show typescript` | Strict mode enabled |
| **Metadata DB** | MongoDB Atlas | — | Users, projects, jobs, metrics, tie-point references |
| **ODM** | Mongoose | Search + `npm show` | |
| **Validation** | Zod | Search + `npm show` | Env + request bodies, both tiers |
| **Auth** | Google OAuth + Email/Password | — | Passport.js strategies |
| **JWT** | jsonwebtoken | Search + `npm show` + advisory | Access + refresh tokens |
| **Password hashing** | bcryptjs | Search + `npm show` | |
| **Security headers** | helmet | Search + `npm show` + advisory | |
| **CORS** | cors | Search + `npm show` | Explicit origin allowlist |
| **Rate limiting** | express-rate-limit | Search + `npm show` | |
| **NoSQL sanitize** | express-mongo-sanitize | Search + `npm show` | |
| **Job queue (shared)** | Redis + BullMQ (Node side) / Celery or RQ (Python side) | Search + `npm show` / `pip index versions` | Node enqueues, Python workers consume |
| **Real-time job status** | socket.io | Search + `npm show` | Push job progress to UI |
| **Object storage** | S3-compatible (AWS S3 or self-hosted MinIO) | — | Raw + registered raster products (can be multi-GB) |
| **Processing runtime** | Python (FastAPI service + worker pool) | Search current stable Python | Isolated from the Node API for CPU/GPU-heavy work |
| **Computer vision** | OpenCV (`opencv-python`/`opencv-contrib-python`) | Search + `pip index versions` | Classical detectors (SIFT/ORB/AKAZE), RANSAC, warping |
| **Deep learning** | PyTorch (+ optional `kornia`) | Search + match CUDA to host | Learned illumination-robust / cross-modal matchers |
| **Geospatial I/O** | rasterio / GDAL | Search + `pip index versions` | PDS4 `.img`/`.xml` label parsing, GeoTIFF read/write, windowed/tiled I/O for large scenes |
| **Numerics** | NumPy, SciPy | Search + `pip index versions` | |
| **Email** | nodemailer | Search + `npm show` | Job-complete notifications |
| **Logging** | winston (Node) / structlog or standard `logging` (Python) | Search + `npm show` / `pip index versions` | Structured production logs, both tiers |
| **Monitoring** | @sentry/node + `sentry-sdk` (Python) | Search + `npm show`/`pip index versions` + Sentry docs | Error tracking across both tiers |
| **Frontend** | React + Vite | Search + `npm show` each | SPA |
| **Routing** | react-router-dom | Search + `npm show` | Protected routes |
| **Server state** | TanStack Query | Search + `npm show` | Job polling, caching, retries |
| **HTTP client** | Axios | Search + `npm show` | Interceptors for refresh |
| **Forms** | React Hook Form + Zod | Search + `npm show` each | Upload/job-config forms |
| **HTML sanitize** | DOMPurify | Search + `npm show` + advisory | XSS prevention on any rendered report/notes text |
| **Imagery/tile viewer** | OpenSeadragon (or custom canvas/WebGL viewer) | Search + `npm show` | Deep-zoom viewing of large lunar rasters + match-point overlay |
| **Charts** | Recharts or Chart.js | Search + `npm show` | Metrics dashboard (RMSE, inlier ratio, coverage score) |
| **Deploy: Frontend** | Vercel | — | Set env vars in dashboard |
| **Deploy: Web API** | Render / Railway | — | Set env vars in dashboard |
| **Deploy: Processing workers** | Containerized (Docker), GPU-capable host if using deep matchers | — | Scale horizontally behind the Redis queue |
| **Deploy: DB / Storage** | MongoDB Atlas, S3/MinIO | — | IP allowlist / bucket policy required |

**Token lifetime standard:**

- Access JWT: `15 minutes` — sent in `Authorization: Bearer` header
- Refresh token: `7 days` — stored in `HttpOnly; Secure; SameSite=Strict` cookie

**Job lifetime standard:**

- Job status values: `queued → preprocessing → matching → estimating_transform → warping → scoring → complete | failed`
- Every job persists: input image refs, chosen algorithm + parameters, all intermediate artifact URIs, and final metrics — for reproducibility.

---

## 2. Repository Structure

```
OrbitLens/
├── web-backend/                       # Node/Express orchestration API
│   ├── src/
│   │   ├── server.ts                  # Entry: DB connect → queue init → listen
│   │   ├── app.ts                     # Express app: middleware stack + route mounts
│   │   ├── config/
│   │   │   ├── env.ts                 # Zod-validated env — crash on startup if misconfigured
│   │   │   ├── db.ts                  # mongoose.connect + disconnect
│   │   │   ├── queue.ts               # BullMQ/Redis connection
│   │   │   ├── storage.ts             # S3/MinIO client setup
│   │   │   └── passport.ts            # Google OAuth strategy (only if env vars present)
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts
│   │   │   ├── validate.ts
│   │   │   ├── roleGuard.ts
│   │   │   └── errorHandler.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── projects/              # Group images/jobs by project
│   │   │   ├── images/                # Upload, metadata parse trigger, storage refs
│   │   │   │   ├── image.routes.ts
│   │   │   │   ├── image.controller.ts
│   │   │   │   ├── image.service.ts
│   │   │   │   ├── image.model.ts     # sensor, sunAzimuth, sunElevation, resolution, footprint, storageUri
│   │   │   │   └── image.schema.ts
│   │   │   ├── jobs/                  # Registration job lifecycle
│   │   │   │   ├── job.routes.ts
│   │   │   │   ├── job.controller.ts
│   │   │   │   ├── job.service.ts     # enqueue → poll/callback → persist metrics
│   │   │   │   ├── job.model.ts       # status, algorithm, params, metrics, artifactUris
│   │   │   │   └── job.schema.ts
│   │   │   └── metrics/               # Metric query/export endpoints
│   │   ├── services/
│   │   │   ├── email.service.ts
│   │   │   └── processingClient.service.ts   # Calls the Python FastAPI service / enqueues jobs
│   │   ├── sockets/
│   │   │   └── index.ts               # JWT-guarded rooms; emits job progress events
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── encryption.ts
│   │   │   ├── ownershipCheck.ts
│   │   │   └── tokenCompare.ts
│   │   └── types/
│   │       └── express.d.ts
│   ├── postman/
│   │   ├── collection.json
│   │   └── environment.json
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
├── processing-service/                # Python FastAPI + worker pool (the CV/ML engine)
│   ├── app/
│   │   ├── main.py                    # FastAPI entry — internal service, not public-facing
│   │   ├── config.py                  # Pydantic-settings env validation
│   │   ├── api/
│   │   │   └── routes_jobs.py         # POST /internal/jobs, GET /internal/jobs/{id}
│   │   ├── pipeline/
│   │   │   ├── ingest.py              # PDS4 label + GeoTIFF parsing (rasterio/GDAL)
│   │   │   ├── preprocess.py          # Radiometric normalization, denoising, shadow handling
│   │   │   ├── pyramid.py             # Multi-scale pyramid construction
│   │   │   ├── detectors/
│   │   │   │   ├── classical.py       # SIFT / ORB / AKAZE via OpenCV
│   │   │   │   └── learned.py         # SuperPoint/SuperGlue or LoFTR-style matcher (PyTorch)
│   │   │   ├── matching.py            # NN + ratio test, or dense-matcher output, cross-scale merge
│   │   │   ├── geometry.py            # RANSAC/MAGSAC, affine/homography estimation
│   │   │   ├── coverage.py            # Grid-based uniform-distribution enforcement
│   │   │   ├── warp.py                # Sub-pixel resampling of source onto reference grid
│   │   │   └── metrics.py             # RMSE, inlier count/ratio, coverage score, reprojection error
│   │   ├── workers/
│   │   │   └── tasks.py               # Celery/RQ task: run full pipeline, write artifacts, report status
│   │   └── storage/
│   │       └── s3_client.py
│   ├── tests/
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt / pyproject.toml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── lib/
│   │   │   ├── env.ts
│   │   │   └── api/
│   │   │       ├── client.ts
│   │   │       └── refreshClient.ts
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── tokenStore.ts
│   │   ├── components/
│   │   │   ├── RequireAuth.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── features/
│   │   │   ├── images/                # Upload + metadata review UI
│   │   │   ├── jobs/                  # Job config form, live status, history
│   │   │   ├── viewer/                # OpenSeadragon deep-zoom viewer + match overlay + swipe compare
│   │   │   └── metrics/               # Metrics dashboard + coverage heatmap
│   │   └── pages/
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── docs/
    ├── PROJECT_BLUEPRINT.md           # This file
    ├── PRD.md                         # Product requirements document
    └── ALGORITHM_NOTES.md             # Living notes on matcher benchmarks/tuning
```

**Rules — never break these:**

- Never commit `.env`, `node_modules`, `venv`/`.venv`, `dist/`, `build/`, or raw imagery/model weight files.
- Always commit `.env.example` (both tiers) with placeholder values and comments.
- One source of truth for env validation per service: `web-backend/src/config/env.ts`, `processing-service/app/config.py`, `frontend/src/lib/env.ts`.
- TypeScript strict mode always on. Python: type hints + `mypy` (or `pyright`) enforced in CI where practical.
- Large raster files and trained model weights are **never** committed to git — use object storage / a model registry / Git LFS only if the team has explicitly agreed to it.

### `.gitignore` — dependencies, env files, secrets, build output, and large binary assets

```gitignore
# Node dependencies
node_modules/

# Python virtual env / cache
.venv/
venv/
__pycache__/
*.pyc

# Environment & secrets — NEVER commit (only .env.example is allowed)
.env
.env.*
!.env.example

# Private keys and common secret filenames
*.pem
*.key
id_rsa
id_ed25519
*.p12
*.pfx

# Build output
dist/
build/
out/
*.tsbuildinfo

# Logs & coverage
*.log
coverage/
.nyc_output/
.pytest_cache/

# Large imagery / model weights — use object storage, not git
*.img
*.tif
*.tiff
*.pth
*.onnx
data/raw/
data/processed/

# OS / editor noise
.DS_Store
Thumbs.db
```

**Rules:**

- **`node_modules/` and `.venv/`** — ignored everywhere. Lockfiles (`package-lock.json`, `requirements.txt`/`poetry.lock`) **are** committed.
- **`.env*`** — covered with the `!.env.example` exception, in every service directory.
- Raw and processed lunar imagery, and any trained matcher weights, live in object storage — reference them by URI in MongoDB, never in git.
- **Verify before first push:** `git status` must not list `.env`, `node_modules`, `.venv`, or raster files.

---

## 3. Environment Variables

### `web-backend/.env.example`

```env
# ── Server ──────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ── Database ─────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/orbitlens
# Production: mongodb+srv://<user>:<pass>@cluster.mongodb.net/orbitlens

# ── JWT ───────────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=replace_with_64_char_hex
JWT_REFRESH_SECRET=replace_with_different_64_char_hex
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Google OAuth (optional) ────────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# ── Frontend URL ──────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173

# ── CORS ──────────────────────────────────────────────────────────────────
CORS_ORIGINS=http://localhost:5173

# ── Encryption ──────────────────────────────────────────────────────────
ENCRYPTION_KEY=replace_with_64_char_hex

# ── Redis / Job Queue (shared with processing-service) ───────────────────
REDIS_URL=redis://localhost:6379

# ── Object Storage (S3-compatible) ───────────────────────────────────────
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=orbitlens-imagery
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=ap-south-1

# ── Processing Service ────────────────────────────────────────────────────
PROCESSING_SERVICE_URL=http://localhost:8000
PROCESSING_SERVICE_API_KEY=shared_internal_service_key

# ── Email (Nodemailer) ────────────────────────────────────────────────────
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_smtp_api_key
EMAIL_FROM=noreply@orbitlens.app

# ── Monitoring ────────────────────────────────────────────────────────────
SENTRY_DSN=https://your_sentry_dsn_here
```

### `processing-service/.env.example`

```env
ENV=development
PORT=8000

REDIS_URL=redis://localhost:6379

S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=orbitlens-imagery
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=ap-south-1

# Shared secret used to authenticate calls from web-backend
INTERNAL_API_KEY=shared_internal_service_key

# Matcher configuration
DEFAULT_MATCHER=classical      # classical | learned
MODEL_WEIGHTS_URI=s3://orbitlens-models/learned_matcher_v1.pth
USE_GPU=false                  # true if a CUDA device is available

SENTRY_DSN=https://your_sentry_dsn_here
```

### `frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ENABLE_LEARNED_MATCHER=true
```

### Env Validation Pattern (Node backend)

```typescript
// web-backend/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).default('5000'),
  MONGODB_URI: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url(),
  CORS_ORIGINS: z.string(),
  ENCRYPTION_KEY: z.string().length(64),
  REDIS_URL: z.string().url(),
  S3_ENDPOINT: z.string().url(),
  S3_BUCKET: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  PROCESSING_SERVICE_URL: z.string().url(),
  PROCESSING_SERVICE_API_KEY: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

### Env Validation Pattern (Python processing service)

```python
# processing-service/app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    env: str = "development"
    port: int = 8000
    redis_url: str
    s3_endpoint: str
    s3_bucket: str
    s3_access_key_id: str
    s3_secret_access_key: str
    internal_api_key: str
    default_matcher: str = "classical"
    model_weights_uri: str | None = None
    use_gpu: bool = False
    sentry_dsn: str | None = None

    class Config:
        env_file = ".env"

# Crash fast on bad config — do not silently fall back
settings = Settings()  # raises ValidationError -> process exits non-zero
```

---

## 4. Web/API Backend Architecture

### Middleware Stack Order (`app.ts`)

```typescript
// web-backend/src/app.ts
app.use(Sentry.Handlers.requestHandler());          // 1. Sentry (first)
app.use(helmet());                                  // 2. Security headers
app.use(cors({ origin: env.CORS_ORIGINS.split(','), credentials: true })); // 3. CORS
app.use(express.json({ limit: '5mb' }));             // 4. Body parsing — larger limit for metadata/JSON blobs, NOT for raw imagery (that goes via presigned S3 upload)
app.use(mongoSanitize());                            // 5. NoSQL injection prevention
if (env.NODE_ENV === 'development') app.use(morgan('dev')); // 6. Dev logging
app.use('/api', globalLimiter);                      // 7. Global rate limit
app.use('/api/v1/auth', authLimiter);                // 8. Strict auth-route limit
app.use('/api/v1/jobs', jobCreationLimiter);          // 9. Separate limit — job creation is compute-expensive downstream
app.use('/api/v1', router);                           // 10. Routes
app.use(Sentry.Handlers.errorHandler());              // 11. Sentry error handler
app.use(errorHandler);                                // 12. Central error handler (always last)
```

### Large-Image Upload Pattern

Never proxy multi-GB raster files through the Node process body parser. Use **presigned URLs**:

1. Client requests `POST /api/v1/images/upload-url` with filename + content type.
2. Node backend generates a presigned S3/MinIO PUT URL and creates an `Image` record with status `pending_upload`.
3. Client uploads the file **directly to object storage**.
4. Client confirms via `POST /api/v1/images/:id/confirm`; Node backend triggers a lightweight metadata-extraction job (sensor, sun angle, resolution, footprint) in the processing service and flips status to `ready`.

### Job Orchestration Pattern

```typescript
// web-backend/src/modules/jobs/job.service.ts (concept)
export async function createRegistrationJob(input: CreateJobInput, userId: string) {
  const job = await Job.create({
    userId,
    sourceImageId: input.sourceImageId,
    referenceImageId: input.referenceImageId,
    algorithm: input.algorithm ?? 'classical',   // classical | learned
    transformModel: input.transformModel ?? 'homography',
    status: 'queued',
  });

  await processingQueue.add('register', {
    jobId: job._id.toString(),
    sourceImageId: input.sourceImageId,
    referenceImageId: input.referenceImageId,
    algorithm: job.algorithm,
    transformModel: job.transformModel,
  });

  return job;
}

// Processing service reports progress/results back via an authenticated
// internal callback (or the Node side polls GET /internal/jobs/:id on the
// processing service) — persist to MongoDB and emit a socket event to the
// owning user's room: io.to(`user:${userId}`).emit('job:update', job).
```

### Standard Error Response Shape (unchanged pattern)

```typescript
// Errors
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable", "fields": { } } }

// Success
{ "success": true, "data": { } }

// Paginated
{ "success": true, "data": [], "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 } }
```

### Ownership Check Helper (unchanged pattern — apply to Image and Job resources)

```typescript
// web-backend/src/utils/ownershipCheck.ts
import { Model, Types } from 'mongoose';

export async function assertOwnership<T>(ModelClass: Model<T>, resourceId: string, userId: string): Promise<T> {
  const doc = await ModelClass.findOne({ _id: new Types.ObjectId(resourceId), userId: new Types.ObjectId(userId) });
  if (!doc) {
    const err = new Error('Resource not found') as any;
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return doc;
}
```

---

## 5. CV/ML Processing Service Architecture

This service is **internal-only** — never exposed directly to the public internet. All calls from `web-backend` include `INTERNAL_API_KEY`; it is not reachable from the frontend.

### Pipeline Stages (implementation notes)

1. **Ingest (`pipeline/ingest.py`)** — use `rasterio`/GDAL to open PDS4 `.img`/`.xml` or GeoTIFF files with **windowed reads**; never load a multi-GB raster fully into memory. Extract sun azimuth/elevation, resolution, and footprint from the PDS4 label when present; fall back to user-supplied metadata.
2. **Preprocess (`pipeline/preprocess.py`)** — radiometric normalization (histogram stretch/match), optional shadow suppression, denoising. Keep this step swappable — illumination correction strategy is a first-class experiment variable.
3. **Pyramid (`pipeline/pyramid.py`)** — build a multi-scale image pyramid on both source and reference to bridge sensor resolution gaps (e.g. OHRC ~25 cm vs. IIRS ~80 m).
4. **Detectors (`pipeline/detectors/`)**:
   - `classical.py` — OpenCV SIFT/ORB/AKAZE keypoints + descriptors; CPU-only, fast baseline.
   - `learned.py` — a learned, illumination/modality-robust matcher (e.g. SuperPoint+SuperGlue or a LoFTR-style dense matcher) via PyTorch; GPU-accelerated when `USE_GPU=true`. **Verify model license terms before any deployed/commercial use.**
5. **Matching (`pipeline/matching.py`)** — nearest-neighbor + Lowe's ratio test for classical descriptors, or direct dense-matcher correspondences; merge matches found across pyramid levels.
6. **Geometry (`pipeline/geometry.py`)** — robust model fitting (RANSAC or MAGSAC) for an affine or homography transform (configurable per job; consider a piecewise/TPS model as a stretch goal for local terrain relief).
7. **Coverage (`pipeline/coverage.py`)** — partition the overlap region into a grid; enforce a maximum number of inliers per cell so match points are **uniformly distributed**, not clustered on the most-textured patch.
8. **Warp (`pipeline/warp.py`)** — resample the source image onto the reference grid using sub-pixel interpolation (bicubic/lanczos); write the registered product back to object storage as GeoTIFF.
9. **Metrics (`pipeline/metrics.py`)** — compute RMSE (inlier residuals), inlier count, inlier ratio, coverage/distribution score, per-point reprojection error map; write a JSON metrics report and a GeoJSON/CSV match-point file to object storage.

### Job Contract (internal API)

```
POST /internal/jobs
Headers: X-Internal-Key: <INTERNAL_API_KEY>
Body:
{
  "jobId": "…",
  "sourceImageUri": "s3://orbitlens-imagery/…",
  "referenceImageUri": "s3://orbitlens-imagery/…",
  "algorithm": "classical" | "learned",
  "transformModel": "affine" | "homography",
  "coverageTargetCells": 64
}

GET /internal/jobs/{jobId}
→ { "status": "...", "progress": 0-100, "metrics": {...} | null, "artifacts": {...} | null, "error": {...} | null }
```

### Worker Pattern (Celery/RQ)

- Workers are **stateless** — pull a job, run the full pipeline, write artifacts, update job status, and pick up the next job. Scale horizontally by adding worker replicas.
- Long-running steps report incremental progress (e.g. after each pipeline stage) so the UI's progress bar reflects real state, not just "queued/done."
- Any unhandled exception in a stage must set job status to `failed` with a structured error `code`/`message` — never leave a job silently stuck.

### Reproducibility

Every job record persists: algorithm name + version/commit hash, all tunable parameters used (ratio-test threshold, RANSAC reprojection threshold, coverage grid size, transform model), and input image checksums — so any result can be exactly reproduced or audited later.

---

## 6. API Documentation Standard

Every endpoint (both the public `web-backend` API and the internal processing-service API) must be documented in this format.

### Template (copy for each endpoint)

```
### METHOD /api/v1/<resource>/<action>

**Description:** One sentence describing what this does.
**Auth required:** Yes / No
**Minimum role:** owner / admin / member / public

#### Request
Headers:
  Authorization: Bearer <accessToken>   (if auth required)
  Content-Type: application/json

Path params:
  :id — MongoDB ObjectId of the resource

Query params:
  ?page=1&limit=20

Body:
  {
    "field": "value",       // Required. Description.
    "optionalField": "val"  // Optional. Default: null. Description.
  }

#### Response — 200 OK / 201 Created
  { "success": true, "data": { ... } }

#### Response — 400 Validation Error
  { "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "fields": { "field": ["Error message"] } } }

#### Response — 401 / 403 / 404 (standard shapes — see Error Codes Master Reference)

#### Postman example
  Method: POST
  URL: {{baseUrl}}/api/v1/<resource>
  Body (raw JSON): { "field": "example value" }
  Tests: pm.test("Status 200", () => pm.response.to.have.status(200));

#### Use cases
  - Use case 1: …
  - Use case 2: …

#### Business rules
  - Rule 1: …
```

### Error Codes Master Reference

| HTTP | Code | When to use |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Zod validation failed on body/query/params |
| 400 | `UNSUPPORTED_IMAGE_FORMAT` | Uploaded file is not a recognized OHRC/TMC/IIRS/GeoTIFF format |
| 400 | `INVALID_SENSOR_PAIR` | Job requested with an unsupported source/reference combination |
| 401 | `UNAUTHORIZED` | No token provided |
| 401 | `TOKEN_EXPIRED` | Access token expired — client should refresh |
| 401 | `TOKEN_INVALID` | Token tampered or wrong secret |
| 403 | `FORBIDDEN` | Authenticated but wrong role |
| 404 | `NOT_FOUND` | Resource not found or doesn't belong to this user |
| 409 | `CONFLICT` | Duplicate resource / job already running for this image pair |
| 422 | `REGISTRATION_LOW_CONFIDENCE` | Pipeline completed but inlier ratio/coverage fell below the confidence threshold — result returned with a warning flag, not a hard failure |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests in window |
| 500 | `INTERNAL_ERROR` | Unhandled server error — check Sentry |
| 502 | `PROCESSING_SERVICE_UNAVAILABLE` | Node could not reach the Python processing service |

---

## 7. Backend Security Checklist

Run through this before every production deployment. (Applies to `web-backend`; items marked **[Py]** apply to `processing-service` too.)

### Environment & Configuration

- All secrets in `.env` — zero secrets hardcoded in source (both tiers)
- `.env` and all `.env.*` in `.gitignore` (both tiers)
- Env validated at startup — app crashes on bad config **[Py]** (Zod / pydantic-settings)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `INTERNAL_API_KEY` are all distinct, high-entropy values
- MongoDB connection string uses a restricted DB user; Atlas IP allowlist configured
- Object storage bucket is **private** — access only via presigned URLs or the service credential, never public-read

### Authentication & Service-to-Service Trust

- Access tokens short-lived (15min), refresh tokens long-lived (7 days), rotation implemented
- Refresh token stored in `HttpOnly; Secure; SameSite=Strict` cookie, hashed at rest
- `crypto.timingSafeEqual()` for all token/API-key comparisons
- The processing service is **not publicly reachable** — network-level restriction (private subnet/VPC or firewall rule) plus the `INTERNAL_API_KEY` header check **[Py]**
- Account lockout after N failed login attempts

### API Security

- `helmet()`, explicit-origin `cors()`, `express-mongo-sanitize()`, `express-rate-limit` in the middleware chain
- Job-creation and upload-URL endpoints rate-limited **separately** from general API traffic (they trigger expensive downstream work)
- Zod / pydantic validation on every route body/query/params **[Py]**
- `assertOwnership()` used in every controller touching Image/Job resources — 404 not 403 on wrong user
- All MongoDB queries filtered by `userId`/`projectId`
- File-type/content validation on upload confirmation — reject anything that isn't a recognized raster/label format before it reaches the pipeline **[Py]**

### Data & Privacy

- Passwords hashed with bcrypt (cost ≥ 10)
- Presigned upload/download URLs are short-lived and scoped to a single object
- Sensitive third-party tokens (e.g. Google OAuth tokens) encrypted with AES-256-GCM
- `DELETE /users/me` requires confirmation text
- `GET /users/me/export` endpoint exists (data portability)

### Infrastructure

- `GET /health` (liveness) and `GET /ready` (readiness — Mongo + Redis + storage reachability) on both `web-backend` **and** `processing-service` **[Py]**
- Health/readiness routes excluded from aggressive rate limits
- Winston / structured Python logging in production — **no passwords, tokens, API keys, or raw PII** in logs
- Sentry configured and scrubbing sensitive data (`beforeSend`) on both tiers **[Py]**
- `npm audit` / `pip-audit` clean — zero high/critical vulnerabilities
- `npm ci` (Node) and a locked Python environment (`pip install -r requirements.txt` from a pinned/hashed lockfile, or Poetry) used in CI **[Py]**
- API versioning prefix (`/api/v1/`) in place on the public API
- Worker pool resource limits set (CPU/GPU/memory caps) so a malformed job can't exhaust a shared host **[Py]**
- HTTPS enforced everywhere in production

---

## 8. Frontend Architecture

### Axios Client Setup, Auth Provider, Route Protection

Unchanged from the base MERN pattern (JWT access token in memory, refresh via `HttpOnly` cookie, single-flight refresh interceptor with a separate `refreshClient`, `AuthProvider` bootstrapping session on load, `RequireAuth` route guard). See original blueprint code samples — apply verbatim to `frontend/src/lib/api/client.ts`, `frontend/src/auth/`, `frontend/src/components/RequireAuth.tsx`.

### Job Polling / Live Status Pattern

```typescript
// frontend/src/features/jobs/api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../../lib/api/client';

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => client.get(`/jobs/${jobId}`).then(r => r.data.data),
    // Poll while the job is still running; stop once terminal.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'complete' || status === 'failed' ? false : 3000;
    },
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateJobInput) => client.post('/jobs', body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}
```

Prefer **Socket.io push** over polling where possible (join a `user:<id>` room after auth; listen for `job:update`) and use TanStack Query polling only as a fallback for environments where websockets are blocked.

### Match-Point / Coverage Visualization

- Use a deep-zoom viewer (OpenSeadragon or a custom canvas/WebGL layer) so multi-GB rasters can be panned/zoomed without loading the full image client-side (serve pre-tiled imagery, e.g. DZI/COG tiles, from object storage).
- Overlay inlier matches in one color, rejected outliers in another; support a swipe/blend comparison between the warped source and the reference.
- Render the coverage heatmap (grid occupancy from `pipeline/coverage.py`) as a semi-transparent layer so low-coverage regions are visually obvious.

---

## 9. Frontend Security Checklist

- Access token stored in **memory only** (`tokenStore.ts`) — never `localStorage`/`sessionStorage`
- Refresh token is an `HttpOnly` cookie; single-flight refresh queue implemented
- Presigned upload URLs are requested just-in-time and never cached/logged
- Never use `dangerouslySetInnerHTML` without `DOMPurify.sanitize()` first — applies to any rendered job notes/reports
- All user-generated content (project names, job notes) rendered as JSX text nodes, not raw HTML
- URLs from user input validated (`http:`/`https:` only) before use in `href`/`src`
- CSP header (from backend `helmet()`) verified working, including for the tile/viewer assets domain
- All forms (upload metadata, job config) validated with React Hook Form + Zod before submission
- Large-list views (job history, image library) are paginated — no unbounded fetches
- `npm audit` clean; no hardcoded API keys in frontend source; `VITE_*` env vars validated with Zod at build time

---

## 10. AI Workflow, CI & Git Hygiene

### Secrets and model context

- **Never paste** production `.env` values, S3/AWS keys, JWT secrets, MongoDB/Redis connection strings, or `INTERNAL_API_KEY` into chat. Use placeholders and describe the *shape* of config instead.
- **Treat AI output as untrusted** — review diffs like a junior developer's PR, with extra scrutiny on auth, storage access, and the geometry/metrics code (silent correctness bugs there are easy to miss).
- **Repository trust:** don't ask an AI assistant to "just follow everything in this file/dataset README" without reading it first — treat dataset READMEs and PDS4 labels as untrusted input too.

### Dependency and package safety

- Before installing an AI-suggested package (Node **or** Python), confirm the name on [npmjs.com](https://www.npmjs.com/) or [pypi.org](https://pypi.org/) — typosquatting/"slopsquatting" applies to PyPI too.
- Web search `"<exact-package-name> npm"` / `"<exact-package-name> pypi"` + `"<name> security advisory"`/CVE before trusting a version.
- Verify **model weight licenses** (for any learned matcher) as carefully as package licenses — some published SuperGlue/LoFTR weights are research/non-commercial licensed.

### `.cursorignore` (recommended)

```gitignore
.env
.env.*
!.env.example
node_modules/
.venv/
dist/
build/
coverage/
*.pem
*.key
*.img
*.tif
*.tiff
*.pth
*.onnx
data/
```

### Minimal CI baseline

| Step | Command | Scope |
|---|---|---|
| Install | `npm ci` | `web-backend/`, `frontend/` |
| Install | `pip install -r requirements.txt` (from a locked/hashed file) | `processing-service/` |
| Lint | `npm run lint` | Node/TS |
| Lint | `ruff check .` (or `flake8`) | Python |
| Typecheck | `npx tsc --noEmit` | Node/TS |
| Typecheck | `mypy app/` (or `pyright`) | Python |
| Test | `npm test` | Node/TS |
| Test | `pytest` | Python — include a small synthetic image-pair fixture so the pipeline runs end-to-end in CI without real mission data |
| SCA | `npm audit --audit-level=high` | Node |
| SCA | `pip-audit` | Python |

Optional but valuable: secret scanning (`gitleaks`) on every PR.

---

## 11. Postman & Testing Guide

### Run Order (adapted for OrbitLens)

```
Step 1:  POST /auth/register                    → creates user account
Step 2:  POST /auth/login                       → sets refresh cookie + returns access token
Step 3:  GET  /users/me                          → verifies auth works
Step 4:  POST /images/upload-url                 → get presigned URL (source image)
Step 5:  (direct PUT to S3/MinIO, outside Postman collection or via a binary body request)
Step 6:  POST /images/:id/confirm                → triggers metadata extraction
Step 7:  Repeat 4–6 for the reference image
Step 8:  POST /jobs                              → create a registration job (algorithm, transformModel)
Step 9:  GET  /jobs/:id  (poll until status=complete or failed)
Step 10: GET  /jobs/:id/metrics                  → RMSE, inlier count/ratio, coverage score
Step 11: GET  /jobs/:id/artifacts                → registered image + match-point file URLs
Step 12: POST /auth/refresh                      → verify token refresh works
Step 13: POST /auth/logout                       → verify cookie cleared
```

### Test Script Additions (beyond the standard status/shape assertions)

```javascript
// After GET /jobs/:id when status === 'complete':
pm.test("Metrics object present", () => {
  const json = pm.response.json();
  pm.expect(json.data.metrics).to.exist;
  pm.expect(json.data.metrics.rmse).to.be.a('number');
  pm.expect(json.data.metrics.inlierRatio).to.be.within(0, 1);
});

pm.test("Sub-pixel RMSE target (informational, not a hard gate)", () => {
  const rmse = pm.response.json().data.metrics.rmse;
  if (rmse > 1.0) console.warn(`RMSE ${rmse} exceeds 1px target — check test fixture / algorithm params`);
});
```

### Testing All Response Scenarios

| Test | How to trigger |
|---|---|
| Happy path (200/201) | Valid request through the full upload → job → metrics flow |
| Validation error (400) | Missing required field, or `UNSUPPORTED_IMAGE_FORMAT` with a bad file |
| Unauthorized (401) | Remove Authorization header |
| Token expired (401) | Use expired token |
| Not found (404) | Reference a non-existent or another user's image/job ID |
| Low-confidence result (422) | Feed two unrelated/non-overlapping images and confirm a graceful low-confidence response instead of a crash |
| Rate limited (429) | Send 11+ requests in 1 minute on an auth or job-creation route |
| Processing unavailable (502) | Stop the processing service and confirm the Node API degrades gracefully |

---

## 12. Master Prompts

### 12.1 Full-Stack Bootstrap Prompt

```
Build OrbitLens: a production-ready full-stack system for multi-modal, sun-angle and
scale-invariant image registration between Chandrayaan-2 optical images (OHRC, TMC, IIRS).

── Services ──────────────────────────────────────────────────────────────
- web-backend/ (Express 5 + Mongoose + TypeScript) — auth, project/image/job metadata,
  presigned-upload orchestration, job enqueue, Socket.io live status
- processing-service/ (Python FastAPI + Celery/RQ workers) — the actual CV/ML registration
  pipeline (see Section 5): ingest (rasterio/GDAL) → preprocess → multi-scale pyramid →
  classical (OpenCV SIFT/ORB/AKAZE) and learned (SuperPoint/SuperGlue or LoFTR-style,
  PyTorch) feature matching → RANSAC/MAGSAC geometric verification → grid-based uniform
  coverage enforcement → sub-pixel warping → RMSE/inlier/coverage metrics
- frontend/ (Vite + React + TypeScript) — upload UI, job config + live status, deep-zoom
  viewer (OpenSeadragon) with match-point/coverage overlay, metrics dashboard, export

Before writing any dependency manifest: web search each dependency (Node AND Python) for
latest stable + security advisories, then confirm with `npm show` / `pip index versions` —
never copy versions from this doc. Verify any learned-matcher model weight license before use.

── Backend requirements ─────────────────────────────────────────────────
- Zod-validated env at startup — crash on bad config (both tiers, pydantic-settings for Python)
- Auth: Google OAuth + email/password; JWT access (15min) + rotated refresh (7d, HttpOnly cookie)
- Security middleware order: Sentry, helmet, cors (explicit origins), json body limit,
  express-mongo-sanitize, rate-limit (general + stricter on auth AND job-creation routes),
  requireAuth, validate, roleGuard
- Presigned-URL upload flow for large rasters — never proxy raw imagery through Express body parsing
- assertOwnership() in every controller touching Image/Job — always 404 never 403 on wrong user
- Standard { success, data } / { success:false, error:{code,message,fields} } response shape
- Job model persists algorithm, parameters, artifact URIs, and metrics for full reproducibility
- Winston + Sentry in production, both tiers, with log redaction / beforeSend scrubbing
- GET /health + GET /ready (Mongo + Redis + object storage reachable) on both services

── Processing service requirements ──────────────────────────────────────
- Internal-only service — network-restricted + INTERNAL_API_KEY header check, never public
- Windowed/tiled raster I/O (rasterio) — never load a full multi-GB scene into memory
- Selectable matcher per job: classical (CPU-only fallback) vs. learned (GPU-accelerated)
- Grid-based coverage enforcement so inliers are spread across the overlap region
- Structured error codes on failure — never leave a job silently stuck
- Stateless, horizontally scalable workers behind the shared Redis queue

── Frontend requirements ────────────────────────────────────────────────
- Access token in memory only; single-flight refresh interceptor with separate refreshClient
- TanStack Query for job polling (with Socket.io push as the primary channel, polling fallback)
- Deep-zoom viewer with match-point overlay, inlier/outlier coloring, swipe compare, coverage heatmap
- Metrics dashboard: RMSE, inlier count/ratio, coverage score, processing time
- React Hook Form + Zod for upload metadata and job-config forms
- DOMPurify for any rendered user-generated text

── Deliverables ─────────────────────────────────────────────────────────
1. .env.example for all three services with comments
2. Root .gitignore covering node_modules, .venv, .env*, raster/model files, dist/build
3. .cursorignore mirroring sensitive + large-binary paths
4. README with setup instructions (install, seed, run all three services) + CI instructions
5. Postman collection + environment JSON under web-backend/postman/
6. Strict TypeScript config; mypy/pyright config for the Python service
7. Full API documentation for every public and internal endpoint per the template in OrbitLens_PROJECT_BLUEPRINT.md
8. A short ALGORITHM_NOTES.md documenting which matcher/parameters were used and observed RMSE/inlier metrics on test image pairs
```

### 12.2 Processing-Service-Only Prompt

```
Build the OrbitLens processing-service: a Python FastAPI + Celery/RQ worker system that
registers one lunar image onto another with sub-pixel accuracy and well-distributed match points.

Before writing requirements.txt/pyproject.toml: web search latest + CVE/advisory for each
dependency, confirm with `pip index versions`; verify any learned-matcher weight license.

Requirements:
- pydantic-settings env validation — crash if misconfigured
- rasterio/GDAL-based ingest supporting PDS4 .img/.xml labels and GeoTIFF, with windowed reads
- Preprocessing: radiometric normalization + optional shadow/illumination correction
- Multi-scale pyramid to bridge OHRC/TMC/IIRS resolution gaps
- Two selectable matchers: OpenCV classical (SIFT/ORB/AKAZE, CPU) and a learned illumination-
  robust matcher (PyTorch, GPU-optional)
- RANSAC/MAGSAC geometric verification (affine + homography models)
- Grid-based coverage enforcement for uniform match-point distribution
- Sub-pixel warping/resampling of source onto reference grid; output GeoTIFF
- Metrics: RMSE, inlier count, inlier ratio, coverage/distribution score, per-point reprojection error
- Internal-only API secured with a shared header key; never publicly exposed
- Structured logging + Sentry; every job persists full parameters for reproducibility
- GET /health + GET /ready (Redis + storage reachable)

Deliver: .env.example, README, a pytest suite with a small synthetic image-pair fixture,
and per-function docstrings explaining the registration math.
```

### 12.3 Security Hardening Prompt (both tiers)

```
Audit and harden OrbitLens (Node web-backend + Python processing-service + React frontend)
for production.

Check and implement if missing:
1. Presigned, short-lived, single-object-scoped URLs for all raster upload/download — bucket private
2. Processing service unreachable from the public internet; INTERNAL_API_KEY verified with
   crypto.timingSafeEqual() on every internal call
3. express-mongo-sanitize, express-rate-limit (general + stricter on auth AND job-creation),
   helmet(), explicit-origin CORS
4. assertOwnership() on every Image/Job controller — 404 not 403 on wrong user
5. Refresh token: bcrypt hash in DB, rotate on use, revoke all on reuse detection
6. Account lockout after repeated failed logins
7. AES-256-GCM for any stored third-party OAuth tokens
8. Zod (Node) / pydantic (Python) validation on every route body/query/params
9. Winston + Sentry (Node) and structured logging + sentry-sdk (Python) — no secrets/PII in logs
10. npm audit and pip-audit — fix all high/critical before deploying
11. Worker resource limits set so a malformed job can't exhaust shared compute
12. GET /health + GET /ready on both services; rate limits tuned so health checks aren't throttled
13. .gitignore / .cursorignore verified — .env*, node_modules, .venv, raster files, model
    weights never tracked
14. Confirm any bundled learned-matcher model weights have a license compatible with the
    project's intended use (research demo vs. any commercial/production deployment)
```

---

## 13. Algorithm Add-On Prompts

These are short add-ons to append to the master prompt when focusing on a specific part of the registration problem.

### Illumination-Invariance Focus

```
Add illumination-robust preprocessing/matching to the OrbitLens pipeline:
- Shadow-aware normalization (e.g. gradient-domain or Retinex-style processing) before
  feature detection
- Benchmark classical SIFT/ORB against a learned matcher under synthetically varied
  sun-elevation renders of the same terrain (if a lunar DEM + relighting tool is available),
  and log inlier ratio / RMSE for each condition in ALGORITHM_NOTES.md
- Add an illumination-difference metadata field (delta sun azimuth/elevation between source
  and reference) to the Job model and surface it in the metrics dashboard as context for
  interpreting match quality
```

### Cross-Sensor Scale Bridging Focus

```
Add multi-scale, cross-sensor matching to the OrbitLens pipeline:
- Build Gaussian/Laplacian pyramids sized to bridge the specific OHRC/TMC/IIRS resolution
  ratio for the given job (compute from image metadata, don't hardcode)
- Search for correspondences coarse-to-fine: establish an initial low-resolution alignment,
  then refine at progressively finer pyramid levels within the previously estimated region
- Add a per-scale-level match-count/inlier breakdown to the metrics output for debugging
```

### Uniform Coverage Focus

```
Add/verify grid-based uniform-distribution enforcement:
- Partition the overlap region into an NxN grid (configurable, default from job param
  coverageTargetCells)
- Cap the number of accepted inliers per cell (favor highest-confidence match per cell over
  raw match count) so the final tie-point set is spatially well distributed
- Compute and report a coverage/distribution score (e.g. normalized variance of per-cell
  inlier counts, or fraction of non-empty cells) alongside RMSE and inlier ratio
```

---

## 14. Document Maintenance

This document reflects **processes** that stay valid over time; **dependency numbers are never authoritative** here.

**When to update this file:**

- When you add a new sensor/reference dataset (e.g. LRO NAC/WAC mosaics) → add its metadata schema fields to the `Image` model and any format-specific ingest logic in `pipeline/ingest.py`
- When you add or swap a matcher algorithm → document it in Section 5 and add/update an Algorithm Add-On Prompt in Section 13
- When you change auth strategy or storage provider → update Section 7 checklist and Section 12 prompts
- When you change AI/CI/git hygiene practices → update Section 10
- When a **CVE** is published for a dependency you use (Node or Python) → rotate secrets if affected, upgrade to a patched release, document the incident in your own changelog
- When deploying to a new hosting provider (especially for GPU workers) → re-verify cookie `Secure` flag, CORS origins, bucket policy, and HTTPS enforcement

**Security review triggers:**

- Any change to cookie domain, `SameSite`, or `Secure` attributes
- Any change to CORS `origin` list or object-storage bucket policy
- Any change to the processing-service network exposure
- Any new public endpoint (no auth) — add to rate-limit config
- Any newly bundled model weight file — re-check license terms

**AI assistant instruction:**
When using this document as context, follow the **⚠️ Version Safety Rule** at the top: **web search** for each dependency (Node and Python), confirm with `npm show` / `pip index versions` when the shell is available, state what you verified in your answer, and **never** copy semver literals from this file into a manifest.

---

*Adapt Section 13's algorithm add-ons as the registration approach evolves; this file describes architecture and process, not a frozen implementation.*
