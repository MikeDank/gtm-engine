# AGENTS.md

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Production build
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - TypeScript type checking
- `pnpm format` - Format code with Prettier
- No test framework configured yet

## Architecture

Next.js 16 app with React 19, TypeScript, Tailwind CSS v4, and Radix UI primitives.

- `src/app/` - App Router pages (campaigns, signals, leads, drafts)
- `src/components/` - React components; `ui/` contains shadcn/ui primitives
- `src/lib/` - Utilities (e.g., `cn()` for className merging)
- Path alias: `@/*` maps to `src/*`

## Code Style

- Strict TypeScript (`strict: true`)
- Prettier: double quotes, semicolons, 2-space tabs, trailing commas (es5)
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Client components require `"use client"` directive
- ESLint: next/core-web-vitals + next/typescript configs
