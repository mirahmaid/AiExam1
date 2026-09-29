# AiExam — منصة مسار التميز

Monorepo for the AI exam-prep platform: a Next.js frontend and a NestJS API
that generates curriculum-grounded practice questions with Gemini.

Previously this lived as two unconnected repositories (the frontend had its
own git history, the backend had none) communicating only over HTTP. Both
histories are preserved here via `git subtree`.

## Layout

```
apps/web/        Next.js 16.2.12 · React 19 · Tailwind v4 · App Router
apps/api/        NestJS 11 · Prisma 6 · BullMQ · Gemini · Passport/JWT
packages/types/  Shared HTTP contract, consumed by both apps
docker-compose.yml   Postgres 16 · Redis 7 · MinIO
```

`packages/types` is the single source of truth for request/response shapes.
`apps/api/src/common/types-parity.ts` turns any drift between those types and
the Prisma schema into a compile error.

## Requirements

- Node.js >= 20.9
- Podman or Docker (for Postgres, Redis, MinIO)

## Getting started

```bash
npm install                 # installs all workspaces, generates the Prisma client
npm run services:up         # postgres :5432 · redis :6379 · minio :9000/:9001
cp apps/api/.env.example apps/api/.env   # then fill in the values below
npm run db:setup            # migrate + seed
npm run dev                 # api :3002 · web :3000
```

Open http://localhost:3000. The seed creates an admin account — see
`apps/api/prisma/seed.ts`.

### Environment

`apps/api/.env` is validated at startup by `src/config/env.validation.ts`,
which coerces numeric vars and fails fast in production when a required
secret is missing. Required in production: `DATABASE_URL`, `JWT_SECRET`,
`REDIS_URL`, `ENCRYPTION_KEY`.

`apps/web` needs no `NEXT_PUBLIC_API_URL`. The browser talks to one origin
only — `next.config.ts` rewrites `/api/v1/*` to `API_ORIGIN` (default
`http://localhost:3002`), so there is no CORS preflight and session cookies
are same-site.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Runs both apps together |
| `npm run build` | Builds types, api, then web |
| `npm run typecheck` | `tsc --noEmit` across all workspaces |
| `npm test` | API unit tests (Jest) |
| `npm run db:setup` | `prisma migrate deploy` + seed |
| `npm run services:up` / `:down` | Start/stop the containers |

## Architecture notes

**Auth is cookie-based.** The API issues `httpOnly` `access_token` and
`refresh_token` cookies and returns no tokens in the response body. Nothing
is stored in `localStorage`. This is what lets pages render on the server
with the session already known — `apps/web/lib/session.ts` reads it, and
`apps/web/proxy.ts` (middleware was renamed to `proxy` in Next 16) guards
routes before any page is served.

**Background work runs on BullMQ**, not in the request: exam extraction,
question embedding, and style-matrix extraction. This is why the API is a
long-running process rather than serverless functions.

**Known gaps** are tracked in `CRITICAL_ISSUES_REPORT.md`. The most
significant: the exam-bank ingestion endpoints are ADMIN-only with no UI, so
the RAG question bank starts empty and generation requests fail until it is
filled; and `question-generation.service.ts` still builds raw SQL by string
interpolation.
