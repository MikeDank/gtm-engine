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
- [x] Handle missing API key gracefully with clear error message in UI

## Phase 7: Context Files (ICP/Tone/Signals)

- [x] Add ContextDoc model to Prisma schema (id, type, title, content, isActive, createdAt)
- [x] Run Prisma migration for ContextDoc model
- [x] Create server actions for context docs (create, list, getActive, setActive)
- [x] Create /context page with upload forms for signals/icp/tone
- [x] Display active doc preview (first ~30 lines) on /context page
- [x] Display history list with "Set Active" button for each doc type
- [x] Add YAML front matter parsing utility for markdown files
- [x] Implement scoreLeadWithIcp(lead, icpDocContent) deterministic scoring function
- [x] Show ICP score + reasons on /leads/[id] page
- [x] Wire tone.md into LLM draft prompt generator
- [x] Add Context link to navigation

## Phase 8: Signal Angle Mapping & Draft Variants

- [x] Create src/lib/angles.ts with ANGLES constant array and Angle type
- [x] Add Signal.angle field (nullable string) to Prisma schema
- [x] Add Draft.angle and Draft.hypothesis fields (nullable strings) to Prisma schema
- [x] Run Prisma migration for angle fields
- [x] Implement classifyAngleFromSignal(excerpt) at src/lib/angle-classifier.ts
- [x] Create AngleBadge component at src/components/ui/angle-badge.tsx
- [x] Update /signals list page to show angle badge for each signal
- [x] Update /signals/[id] detail page to show angle badge
- [x] Add angle dropdown selector to /signals/[id] for manual override
- [x] Create server action to update signal angle
- [x] Update template generator to accept angle and generate 2 framing variants (metric/risk)
- [x] Update template generator to generate hypothesis from signal excerpt
- [x] Update LLM draft prompt to include angle context
- [x] Update LLM draft generation to create 2 angle-based variants with hypothesis
- [x] Update DraftMessageDialog to show angle-based variant options

## Phase 9: Export Pipeline v1

- [x] Update exportDripifyCsv function to include all 10 columns (lead_name, company, role, linkedin_url, angle, icp_score, variant_key, hypothesis, message, source_url)
- [x] Pass ICP score and signal data to Dripify export function
- [x] Create CopyOutreachPackageButton client component that copies JSON to clipboard
- [x] Add CopyOutreachPackageButton to lead detail page with all required data
- [x] Add Touchpoint model to Prisma schema (id, leadId, channel, draftId, status, sentAt, createdAt)
- [x] Run Prisma migration for Touchpoint model
- [x] Create server actions for touchpoints (create, list by lead)
- [x] Create MarkAsSentButton client component for drafts
- [x] Add MarkAsSentButton to each draft in the drafts list on lead page
- [x] Create TouchpointsList component to display touchpoints on lead page
- [x] Add TouchpointsList to lead detail page

## Phase 9.5: Lead Enrichment (Apollo + Manual)

- [x] Add email, linkedinUrl, enrichedAt, enrichmentSource fields to Lead model
- [x] Run Prisma migration for Lead contact fields
- [x] Create Apollo enrichment service at src/lib/apollo.ts
- [x] Add server actions for manual contact update and Apollo enrichment
- [x] Create ContactInfoForm component with email/linkedin inputs and save button
- [x] Add "Enrich with Apollo" button to ContactInfoForm
- [x] Add Contact Info card to lead detail page
- [x] Create ContactBadge component for leads table
- [x] Add Contact column with ContactBadge to leads table
- [x] Update exportDripifyCsv to include linkedinUrl from lead
- [x] Update outreach package JSON to include lead.email and lead.linkedinUrl
- [x] Add APOLLO_API_KEY to .env.example

## Phase 9.6: Email Sending (Resend)

- [x] Add RESEND_API_KEY and EMAIL_FROM to .env.example with instructions
- [x] Create email sending service at src/lib/email/resend.ts with sendEmail function
- [x] Create in-memory rate limiter utility at src/lib/email/rate-limiter.ts (max 5 emails/minute)
- [x] Create sendEmailDraft server action at src/app/drafts/actions.ts
- [x] Create SendEmailButton client component with confirmation dialog
- [x] Add SendEmailButton to /drafts/[id] page for email channel drafts
- [x] Add toast notifications for send success/failure feedback
- [x] Verify end-to-end: send email draft → touchpoint logged with status "sent"

## Phase 9.7: Attio CRM Sync v1

- [x] Add ATTIO_API_KEY to .env.example with instructions
- [x] Add attioPersonId, attioCompanyId, attioSyncedAt fields to Lead model
- [x] Run Prisma migration for Attio sync fields
- [x] Create Attio client at src/lib/attio/client.ts with upsertCompany, upsertPerson, addNoteToPerson
- [x] Create syncLeadToAttio server action at src/app/leads/[id]/actions.ts
- [x] Create SyncToAttioButton client component with loading/success/error states
- [x] Add SyncToAttioButton and sync status display to lead detail page
- [x] Verify end-to-end: sync lead → records created in Attio with note

## Phase 10: Sequencing v1 (Planned Follow-ups)

- [x] Add plannedFor, subject, content fields to Touchpoint model in Prisma schema
- [x] Run Prisma migration for Touchpoint follow-up fields
- [x] Create follow-up template generator at src/lib/follow-up-templates.ts (deterministic fallback)
- [x] Create LLM follow-up prompt generator at src/lib/llm/follow-up-prompt.ts
- [x] Create generateFollowUps function at src/lib/llm/generate-follow-ups.ts (LLM with template fallback)
- [x] Add server action generateFollowUps at src/app/leads/[id]/actions.ts
- [x] Create GenerateFollowUpsButton client component with loading state
- [x] Add GenerateFollowUpsButton to lead detail page
- [x] Update TouchpointsList component to display planned vs sent with dates and content
- [x] Create SendPlannedTouchpointButton client component with confirmation dialog
- [x] Add server action sendPlannedTouchpoint at src/app/leads/[id]/actions.ts
- [x] Add SendPlannedTouchpointButton to planned touchpoints in TouchpointsList
- [x] Add Attio sync prompt after sending follow-up (if attioPersonId exists)

## Phase 11: Reply Tracking v1 (Manual)

- [x] Add pipelineStatus, lastContactedAt, lastRepliedAt fields to Lead model in Prisma schema
- [ ] Run Prisma migration for Lead pipeline fields
- [ ] Create updateLeadPipelineStatus server action at src/app/leads/[id]/actions.ts
- [ ] Auto-update pipeline on email send: set pipelineStatus="contacted" and lastContactedAt=now in sendEmailDraft
- [ ] Auto-update pipeline on touchpoint send: set pipelineStatus="contacted" and lastContactedAt=now in sendPlannedTouchpoint
- [ ] Create PipelineStatusBadge component at src/components/pipeline-status-badge.tsx
- [ ] Create PipelineControls component at src/components/pipeline-controls.tsx with status buttons
- [ ] Add Pipeline card with PipelineControls to lead detail page
- [ ] Add stop rule: disable GenerateFollowUpsButton when lead is paused
- [ ] Add stop rule: disable SendPlannedTouchpointButton when lead is paused
- [ ] Add "Follow-ups paused" banner to lead detail page when lead is paused
- [ ] Update TouchpointsList to show visual cue when lead is paused
- [ ] Update Attio note content to include pipeline status when syncing

## Phase 12: Polish & Cleanup

- [ ] Add loading states to all data-fetching pages
- [ ] Add error boundaries for failed data fetches
- [ ] Seed script for development data
