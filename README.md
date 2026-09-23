# Quality Services Platform - Monorepo

Enterprise full-stack monorepo for the **Quality Services Platform**, orchestrated with **Turborepo** and **pnpm workspaces**.

## Architecture & Structure Overview

```text
quality-service-app/
├── apps/
│   ├── web/                     # Frontend: React 18 + Vite + TypeScript + Tailwind CSS + daisyUI + React Router
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI elements (Navbar, Footer, badges)
│   │   │   ├── features/        # Feature domains (e.g., services/ components, state)
│   │   │   ├── hooks/           # Custom React hooks (e.g., useServices)
│   │   │   ├── lib/             # API client and Supabase client abstractions
│   │   │   ├── routes/          # Client-side router, HomePage, and NotFoundPage
│   │   │   ├── App.tsx          # Main application layout and routes shell
│   │   │   ├── main.tsx         # React DOM entrypoint
│   │   │   └── index.css        # Tailwind directives and base styles
│   │   ├── vite.config.ts       # Vite bundler configuration with @ path alias & proxy
│   │   └── tailwind.config.js   # Extends shared preset from @quality-services/config
│   │
│   └── api/                     # Backend: NestJS 11 + TypeScript + @nestjs/config
│       ├── src/
│       │   ├── common/          # Cross-cutting filters, guards, interceptors, pipes
│       │   ├── modules/         # Modular feature domain structure
│       │   │   ├── health/      # Health check controller and service
│       │   │   └── services/    # Quality services controller, service, module, and DTOs
│       │   ├── supabase/        # Injected SupabaseService and SupabaseModule
│       │   ├── app.module.ts    # Root application module with ConfigModule
│       │   └── main.ts          # Bootstrap entrypoint with CORS, prefix, and filters
│       └── nest-cli.json
│
├── packages/
│   ├── types/                   # @quality-services/types: shared types, DTOs, API models
│   ├── config/                  # @quality-services/config: shared Tailwind preset & ESLint rules
│   └── utils/                   # @quality-services/utils: shared formatters, constants, helpers
│
├── supabase/
│   ├── config.toml              # Supabase CLI local development configuration
│   ├── docker-compose.yml       # Local Supabase Docker stack (PostgreSQL, REST API, Studio UI)
│   └── migrations/              # SQL migrations with Row Level Security (RLS) enabled
│
├── pnpm-workspace.yaml          # Workspace catalog definition
├── turbo.json                   # Turborepo task pipeline orchestration (dev, build, lint, test)
├── tsconfig.base.json           # Strict base TypeScript compiler options
├── .env.example                 # Root environment template
└── git-workflow.md              # Mandatory branch & PR workflow rules
```

### Architectural Reasoning
1. **Separation of Concerns**: `apps/web` is isolated from `apps/api`, communicating strictly over REST endpoints with shared contract types defined in `packages/types`.
2. **Shared Contracts (`packages/types`)**: Both client and server import the exact same data contracts (`ApiResponse`, `QualityService`, `CreateServiceDto`), eliminating schema drift.
3. **Shared Design Tokens (`packages/config`)**: The Tailwind preset and daisyUI theme are centralized, ensuring consistent branding and typography across web apps.
4. **Local Supabase with Docker**: Database migrations and schemas are tracked in version control, running locally with full Row Level Security (RLS) policies.

---

## Prerequisites

- **Node.js**: >= 20.0.0 (Node 24 recommended)
- **pnpm**: >= 9.0.0 (`npm install -g pnpm`)
- **Docker & Docker Compose**: For local database and Supabase services

---

## Getting Started

### 1. Install Dependencies
Run pnpm at the root of the monorepo:
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy the root `.env.example` file:
```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

### 3. Start Local Supabase (Docker)
Start the local PostgreSQL, PostgREST, and Studio containers:
```bash
docker compose -f supabase/docker-compose.yml up -d
```
- **Postgres Database**: `localhost:54322`
- **PostgREST API**: `http://localhost:54321`
- **Supabase Studio UI**: `http://localhost:54323`

To shut down the local Supabase containers:
```bash
docker compose -f supabase/docker-compose.yml down
```

---

## Development Mode

Run both the frontend and backend applications concurrently via Turborepo:
```bash
pnpm dev
```
Turborepo orchestrates parallel processes:
- **Web (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **API (Backend)**: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **API Health Check**: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

To run an individual application:
```bash
# Run only frontend
pnpm --filter @quality-services/web dev

# Run only backend
pnpm --filter @quality-services/api dev
```

---

## Building the Project

Build all packages and applications with caching:
```bash
pnpm build
```

This compiles:
1. `packages/types` via `tsup`
2. `packages/utils` via `tsup`
3. `apps/api` via NestJS CLI
4. `apps/web` via Vite + TypeScript compiler

---

## Linting & Type Checking

To typecheck and lint the entire monorepo:
```bash
pnpm lint
```

To clean all build artifacts and caches:
```bash
pnpm clean
```
