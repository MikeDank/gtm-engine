# Implementation Plan

This file tracks the ordered list of tasks for building GTM Engine MVP.

**Format:** `- [ ]` = todo, `- [x]` = done

---

## Phase 1: Signal Inbox (Core Infrastructure)

- [ ] Create server action to fetch all signals from DB
- [ ] Update `/signals` page to display signals from DB (table/list)
- [ ] Add status badge component for signal status (pending, reviewed, converted, discarded)
- [ ] Implement signal status filter (tabs or dropdown)
- [ ] Create signal detail view (`/signals/[id]`)
- [ ] Add server action to update signal status
- [ ] Wire up status change buttons on signal detail page

## Phase 2: Signal Management

- [ ] Create "Add Signal" form (manual signal input)
- [ ] Add server action to create new signal
- [ ] Add delete signal functionality (with confirmation)
- [ ] Add empty state for signals page when no signals exist

## Phase 3: Convert Signal to Lead

- [ ] Create "Convert to Lead" modal/form component
- [ ] Add server action to create lead from signal
- [ ] Wire up convert flow: create lead + update signal status to "converted"
- [ ] Add success feedback after conversion

## Phase 4: Leads Management

- [ ] Create server action to fetch all leads from DB
- [ ] Update `/leads` page to display leads from DB
- [ ] Create lead detail view (`/leads/[id]`)
- [ ] Add empty state for leads page when no leads exist
- [ ] Show source signal reference on lead detail (if available)

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
