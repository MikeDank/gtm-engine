# gtm-engine

**Signal → Qualified Lead → Personalized Outreach → CRM**

A go-to-market automation engine focused on quality, not spam.

## What It Does

- Ingest public signals (posts, blogs, events, GitHub activity)
- Extract evidence-based facts (no hallucinations)
- Score and qualify leads
- Generate safe, non-creepy personalized outreach drafts
- Human-in-the-loop approvals before sending
- Export/sync to CRMs like Attio

## Principles

- **Quality > quantity** — fewer, better leads
- **No creepy personalization** — respect boundaries
- **Evidence required** — no invented claims about prospects
- **Compliance / ToS-first** — play by the rules

## Tech Stack

Next.js · TypeScript · Tailwind · Prisma · Postgres

## Local Development

```bash
pnpm install
pnpm db:up          # Start Postgres
pnpm db:migrate     # Run migrations
pnpm db:seed        # Insert demo data
pnpm dev            # Start dev server
```

## RSS Ingestion

Ingest signals from any RSS feed:

```bash
pnpm runner ingest:rss <url>
```

### Sample RSS Feeds for Testing

```bash
# Hacker News (100+ points)
pnpm runner ingest:rss "https://hnrss.org/newest?points=100"

# TechCrunch
pnpm runner ingest:rss "https://techcrunch.com/feed/"

# Product Hunt
pnpm runner ingest:rss "https://www.producthunt.com/feed"

# Dev.to
pnpm runner ingest:rss "https://dev.to/feed"
```

## Status

🚧 **Work in progress** — building in public.

<!-- TODO: Add link to blog series -->
