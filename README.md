# Quality Services Platform

Full-stack application monorepo powered by **Turborepo**, **pnpm workspaces**, **NestJS**, **React (Vite)**, and **Supabase (PostgreSQL)**.

---

## Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0 (`npm install -g pnpm`)
- **Docker & Docker Compose**: For local PostgreSQL database and Supabase services

---

## Quick Start (Setup & Run)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy the environment template files:
```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

### 3. Start Local Database (Docker)
Launch PostgreSQL (port `54322`), PostgREST API (port `54321`), and Supabase Studio (port `54323`):
```bash
docker compose -f supabase/docker-compose.yml up -d
```
> Database schema and migrations (`tbrand`, `tuser`, `tbrand_user`, `treply`, `tevaluation`) are applied automatically on startup.

### 4. Run Development Servers
Start both the Frontend and Backend concurrently via Turborepo:
```bash
pnpm dev
```

---

## Application Access Points

| Service | URL | Notes |
| :--- | :--- | :--- |
| **Web Frontend** | [http://localhost:5173](http://localhost:5173) | React + Vite + Tailwind + daisyUI |
| **Backend REST API** | [http://localhost:3001/api/v1](http://localhost:3001/api/v1) | NestJS modular API |
| **Health Check** | [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health) | API status & uptime |
| **Supabase Studio UI** | [http://localhost:54323](http://localhost:54323) | Database table editor & SQL runner |
| **PostgreSQL Database** | `localhost:54322` | User: `postgres`, Password: `postgrespassword` |

---

## Available REST API Endpoints

All endpoints are prefixed with `/api/v1/`:

- `POST|GET /api/v1/brands` - Brands management (`tbrand`)
- `POST|GET /api/v1/users` - Users management (`tuser`)
- `POST|GET /api/v1/brand-users` - Brand to User assignments (`tbrand_user`)
- `POST|GET /api/v1/replies` - Customer service replies (`treply`)
- `POST|GET /api/v1/evaluations` - QA evaluations (`tevaluation`)
- `GET /api/v1/health` - API health check

---

## Monorepo Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Runs both frontend and backend concurrently in watch mode |
| `pnpm build` | Compiles all shared packages and applications with caching |
| `pnpm lint` | Runs TypeScript type checking across all workspace packages |
| `pnpm clean` | Cleans all build artifacts and dist folders |
| `docker compose -f supabase/docker-compose.yml down` | Stops the local Supabase Docker containers |

---

## Project Structure

```text
├── apps/
│   ├── web/          # React + Vite frontend application
│   └── api/          # NestJS backend REST API
├── packages/
│   ├── types/        # Shared TypeScript interfaces & DTO contracts
│   ├── config/       # Shared Tailwind preset & ESLint configurations
│   └── utils/        # Shared helper functions & formatters
├── supabase/
│   ├── docker-compose.yml # Local database & Supabase services stack
│   └── migrations/        # SQL schema migrations with RLS enabled
└── pnpm-workspace.yaml
```
