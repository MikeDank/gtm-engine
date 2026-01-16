# Implementation Plan

This file tracks the ordered list of tasks for building GTM Engine MVP.

**Format:** `- [ ]` = todo, `- [x]` = done

**Goal:** First 10-15 tasks produce a visible vertical slice: RSS → DB → /signals page shows real rows.

---

## Phase 0: Local Runner + RSS Ingestion

- [x] Create `runner/` directory with CLI skeleton (using Commander or similar)
- [x] Add `pnpm runner` script to package.json
- [x] Implement `runner ingest:rss <url>` command (fetch + parse RSS feed)
- [x] Insert parsed RSS items as Signals into DB (source=feed URL, excerpt=title+description)
- [x] Add `pnpm db:seed` script that inserts demo Signals for development
- [x] Add sample RSS feed URLs to README for testing
- [x] Verify end-to-end: run `pnpm runner ingest:rss <url>` → signals appear in DB

## Phase 1: Signal Inbox (DB-Backed UI)

- [x] Create server action to fetch all signals from DB
- [x] Update `/signals` page to display signals from DB (table/list)
- [x] Add status badge component for signal status (pending, reviewed, converted, discarded)
- [x] Implement signal status filter (tabs or dropdown)
- [x] Create signal detail view (`/signals/[id]`)
- [x] Add server action to update signal status
- [x] Wire up status change buttons on signal detail page

## Phase 1.5: GitHub Ingestion Connector

- [x] Add GITHUB_TOKEN to .env.example with instructions
- [x] Implement `runner ingest:github <owner/repo>` command skeleton
- [x] Fetch recent merged PRs from GitHub API using GITHUB_TOKEN
- [x] Insert GitHub PRs as Signals into DB (source=github, sourceUrl=PR URL)
- [x] Update README with GitHub ingestion instructions
- [x] Verify end-to-end: run `pnpm runner ingest:github <repo>` → signals appear in DB

## Phase 2: Signal Management

- [ ] Create "Add Signal" form (manual signal input)
- [ ] Add server action to create new signal
- [ ] Add delete signal functionality (with confirmation)
- [ ] Add empty state for signals page when no signals exist

## Phase 3: Convert Signal to Lead

- [x] Add signalId field to Lead model in Prisma schema (FK to Signal)
- [x] Run Prisma migration to add signalId to leads table
- [x] Add server action to create lead from signal (creates Lead, sets signalId, updates signal status to "converted")
- [ ] Update "Convert to Lead" button on signal detail page to open a form dialog
- [ ] Create ConvertToLeadDialog component with name/role/company fields
- [ ] Wire up convert flow: submit form → create lead → update signal → redirect to lead

## Phase 4: Leads Management

- [ ] Create server action to fetch all leads from DB (include source signal)
- [ ] Update `/leads` page to display leads from DB (table with name, role, company, createdAt)
- [ ] Add empty state for leads page when no leads exist
- [ ] Create lead detail view (`/leads/[id]`) with lead info
- [ ] Add "Source Signal" section to lead detail (sourceUrl, excerpt, capturedAt)

## Phase 5: Message Drafting (Stub)

- [ ] Add Draft model to Prisma schema (id, leadId, content, createdAt)
- [ ] Create "Draft Message" button on lead detail
- [ ] Create template-based draft generator (no LLM)
- [ ] Create draft editor view with copy-to-clipboard
- [ ] Add server action to save/update draft

## Phase 6: Polish & Cleanup

- [ ] Add loading states to all data-fetching pages
- [ ] Add error boundaries for failed data fetches
- [ ] Seed script for development data
