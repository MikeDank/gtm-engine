# AGENTS.md

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Production build
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - TypeScript type checking
- `pnpm format` - Format code with Prettier
- No test framework configured yet

## Database

- `pnpm db:up` - Start Postgres container
- `pnpm db:down` - Stop Postgres container
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm db:studio` - Open Prisma Studio

## Ingestion Connectors

```bash
# RSS ingestion
pnpm runner ingest:rss <url>

# GitHub ingestion (requires GITHUB_TOKEN in .env)
pnpm runner ingest:github <owner/repo>
```

## Ralph Loop

The Ralph autonomous loop runs in two modes:

```bash
# Planning mode - updates IMPLEMENTATION_PLAN.md from specs
./loop.sh plan

# Build mode - implements one task per iteration
./loop.sh build 10    # Run up to 10 iterations

# Stop gracefully
touch STOP
```

Key files:

- `loop.sh` - Main loop script
- `PROMPT_plan.md` - Instructions for planning mode
- `PROMPT_build.md` - Instructions for build mode
- `IMPLEMENTATION_PLAN.md` - Ordered task list with checkboxes
- `specs/` - Product specifications

## Architecture

Next.js 16 app with React 19, TypeScript, Tailwind CSS v4, and Radix UI primitives.

- `src/app/` - App Router pages (campaigns, signals, leads, drafts)
- `src/components/` - React components; `ui/` contains shadcn/ui primitives
- `src/lib/` - Utilities (e.g., `cn()` for className merging, `db` for Prisma)
- Path alias: `@/*` maps to `src/*`

## Code Style

- Strict TypeScript (`strict: true`)
- Prettier: double quotes, semicolons, 2-space tabs, trailing commas (es5)
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Client components require `"use client"` directive
- ESLint: next/core-web-vitals + next/typescript configs
