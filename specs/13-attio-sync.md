# Attio Sync v1

## Overview

Enable syncing leads to Attio CRM with one click. Creates/updates Person + Company records and logs a note with all lead evidence, drafts, and touchpoints.

## Environment Variables

Add to `.env.example`:

```
ATTIO_API_KEY=                     # Attio API key for CRM sync
```

## Attio Client

Create `src/lib/attio/client.ts` with minimal functions:

### upsertCompany({ name })

- Search for existing company by name
- Create if not found, return existing if found
- Return `{ id: string }`

### upsertPerson({ name, email?, linkedinUrl?, companyName?, title? })

- Search for existing person by email or linkedin URL
- Create if not found with company association
- Return `{ id: string }`

### addNoteToPerson(personId, noteMarkdown)

- Add a note to the person record
- Return `{ id: string }`

Use Attio REST API with bearer auth. If token missing, throw clear error.

## Database Changes

Add to Lead model:

- `attioPersonId` (String, nullable) - Attio person record ID
- `attioCompanyId` (String, nullable) - Attio company record ID
- `attioSyncedAt` (DateTime, nullable) - Last sync timestamp

## Server Action

Create `syncLeadToAttio(leadId)` at `src/app/leads/[id]/actions.ts`:

1. Load lead with relations (source signal, drafts, touchpoints, ICP score)
2. Build markdown note containing:
   - Lead summary (name, role, company, email, linkedin)
   - ICP score + reasons
   - Source Signal (excerpt, sourceUrl, capturedAt, angle)
   - Drafts (angle, variantKey, hypothesis, content)
   - Touchpoints (channel, status, sentAt)
3. Upsert company if lead has company name
4. Upsert person with lead data
5. Add note to person
6. Update lead with attioPersonId, attioCompanyId, attioSyncedAt
7. Return `{ success: boolean, personId?: string, companyId?: string, error?: string }`

## UI Components

### SyncToAttioButton

- Client component on `/leads/[id]` page
- Shows "Sync to Attio" button
- On click: calls server action, shows loading state
- On success: shows ✅ synced with timestamp
- On error: shows error message

### Lead Detail Page Updates

- Display sync status (synced at timestamp or "Not synced")
- Show Attio person/company IDs when synced

## Behavior

- **Idempotent**: Repeated syncs update existing records or add new "Sync snapshot" note
- **Safe**: Never send API keys or secrets to Attio
- **Graceful errors**: Missing ATTIO_API_KEY shows clear user-facing error

## API Reference

Attio REST API:

- Base URL: `https://api.attio.com/v2`
- Auth: `Authorization: Bearer <api_key>`
- Docs: https://developers.attio.com/reference
