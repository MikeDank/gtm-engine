# Data Model

## Core Entities

### Campaign

A campaign groups related signals and leads for a specific outreach effort.

| Field     | Type     | Description               |
| --------- | -------- | ------------------------- |
| id        | string   | CUID primary key          |
| name      | string   | Campaign name             |
| createdAt | datetime | When campaign was created |

### Signal

A signal is a piece of public information that indicates buying intent or relevance.

| Field      | Type     | Description                                |
| ---------- | -------- | ------------------------------------------ |
| id         | string   | CUID primary key                           |
| campaignId | string   | FK to Campaign                             |
| source     | string   | Where the signal came from (URL, platform) |
| excerpt    | string   | The relevant text/content                  |
| status     | string   | pending, reviewed, converted, discarded    |
| capturedAt | datetime | When the signal was captured               |
| createdAt  | datetime | When record was created                    |

**Signal Sources (examples):**

- Twitter/X post
- LinkedIn post (manually pasted)
- Blog article
- GitHub activity
- Conference attendee list
- Product Hunt launch

### Lead

A lead is a person extracted from one or more signals.

| Field     | Type     | Description             |
| --------- | -------- | ----------------------- |
| id        | string   | CUID primary key        |
| name      | string   | Full name               |
| role      | string?  | Job title (optional)    |
| company   | string?  | Company name (optional) |
| createdAt | datetime | When lead was created   |

## Evidence Rules

1. **Every lead fact must have a source**
   - Name → linked to signal
   - Role → linked to signal or marked "unverified"
   - Company → linked to signal or marked "unverified"

2. **No invented data**
   - If a field isn't in the signal, leave it null
   - Don't guess or infer unstated facts

3. **Signal-Lead relationship**
   - A lead can be created from multiple signals
   - Track which signals contributed to each lead field

## Future Entities (Not MVP)

- Draft: Outreach message drafts
- Evidence: Links between lead fields and source signals
- User: Multi-user support
