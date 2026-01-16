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
- [x] Update "Convert to Lead" button on signal detail page to open a form dialog
- [x] Create ConvertToLeadDialog component with name/role/company fields
- [x] Wire up convert flow: submit form → create lead → update signal → redirect to lead

## Phase 4: Leads Management

- [x] Create server action to fetch all leads from DB (include source signal)
- [x] Update `/leads` page to display leads from DB (table with name, role, company, createdAt)
- [x] Add empty state for leads page when no leads exist
- [x] Create lead detail view (`/leads/[id]`) with lead info
- [x] Add "Source Signal" section to lead detail (sourceUrl, excerpt, capturedAt)

## Phase 5: Message Drafting (Stub)

- [x] Add Draft model to Prisma schema (id, leadId, channel, subject, content, variantKey, createdAt, updatedAt)
- [x] Run Prisma migration for Draft model
- [x] Create template generator utility with 2 variants (short cold opener + value-first) for email and LinkedIn
- [x] Add server action to create draft for a lead (using template generator)
- [x] Add server action to list drafts for a lead
- [x] Add server action to update draft content
- [x] Add "Draft Message" button and dialog on lead detail page (choose channel + variant)
- [x] Display existing drafts list on lead detail page
- [x] Create draft detail/editor page at /drafts/[id] with editable textarea and save button
- [x] Add subject field to draft editor for email drafts
- [x] Add "Copy to clipboard" button on draft editor page
- [x] Add "Export for Dripify" button on lead page (CSV export for LinkedIn draft)

## Phase 6: BYO LLM Provider Support

- [x] Add OPENAI_API_KEY and ANTHROPIC_API_KEY to .env.example with instructions
- [x] Create LLM settings schema in Prisma (provider, model, temperature, maxTokens, dailyCostLimit)
- [x] Run Prisma migration for LlmSettings model
- [x] Create LLM types at src/lib/llm/types.ts (LlmConfig, LlmMessage, LlmResponse, DraftOutput)
- [x] Create OpenAI client at src/lib/llm/openai.ts (chat completions)
- [x] Create Anthropic client at src/lib/llm/anthropic.ts (messages API)
- [x] Create LLM router at src/lib/llm/index.ts (provider selection)
- [x] Create evidence-locked draft prompt generator at src/lib/llm/draft-prompt.ts
- [x] Add server actions for LLM settings (get, upsert) at src/app/settings/actions.ts
- [x] Create Settings page at /settings with provider/model/temperature/maxTokens/dailyCostLimit form
- [x] Add Settings link to navigation
- [x] Add server action to generate LLM draft at src/app/drafts/actions.ts
- [x] Update DraftMessageDialog with Template/LLM toggle and LLM draft generation (2 variants)
- [ ] Handle missing API key gracefully with clear error message in UI

## Phase 7: Polish & Cleanup

- [ ] Add loading states to all data-fetching pages
- [ ] Add error boundaries for failed data fetches
- [ ] Seed script for development data
