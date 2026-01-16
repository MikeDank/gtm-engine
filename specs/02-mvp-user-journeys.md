# MVP User Journeys

## Journey 1: Signal Inbox

**Goal:** Review and process incoming signals

### Steps

1. User navigates to `/signals`
2. Sees a list of signals grouped by status (pending first)
3. Each signal shows:
   - Source (with link if URL)
   - Excerpt (truncated)
   - Captured date
   - Status badge
4. User can:
   - View full signal details
   - Mark as "reviewed"
   - Convert to lead
   - Discard

### Acceptance Criteria

- [ ] Signals page shows all signals from DB
- [ ] Signals are sorted by capturedAt desc
- [ ] Status filter works (all, pending, reviewed, converted, discarded)
- [ ] Can change signal status

---

## Journey 2: Convert Signal to Lead

**Goal:** Extract a lead from a signal

### Steps

1. User views a signal
2. Clicks "Convert to Lead"
3. Form appears with:
   - Name (required)
   - Role (optional)
   - Company (optional)
4. User fills in fields based on signal content
5. Submits → Lead created, signal marked "converted"

### Acceptance Criteria

- [ ] Convert button appears on pending/reviewed signals
- [ ] Form validates name is required
- [ ] Lead is created in DB
- [ ] Signal status updates to "converted"
- [ ] User redirected to lead detail or leads list

---

## Journey 3: View Leads

**Goal:** See all qualified leads

### Steps

1. User navigates to `/leads`
2. Sees a table/list of leads
3. Each lead shows:
   - Name
   - Role
   - Company
   - Created date
4. User can click to view lead details

### Acceptance Criteria

- [ ] Leads page shows all leads from DB
- [ ] Leads sorted by createdAt desc
- [ ] Can click through to lead detail

---

## Journey 4: Draft Outreach Message

**Goal:** Generate a personalized outreach draft

### Steps

1. User views a lead
2. Clicks "Draft Message"
3. System generates a draft based on:
   - Lead info (name, role, company)
   - Source signals (evidence)
4. User can edit the draft
5. User copies or exports the draft

### MVP Scope

- Generate a **template-based** draft (no LLM yet)
- Show placeholders for evidence
- Allow manual editing

### Acceptance Criteria

- [ ] Draft button appears on lead detail
- [ ] Template draft is generated
- [ ] User can edit draft text
- [ ] Can copy draft to clipboard

---

## Out of Scope (MVP)

- Auto-send emails
- CRM sync
- Multi-campaign filtering on leads
- Lead scoring beyond basic rules
