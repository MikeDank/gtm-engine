# Export Pipeline v1

## Goal

From a Lead page, users can export everything needed to execute outreach and track what was sent.

## Requirements

### 1. Improved Dripify Export

Update the existing "Export for Dripify" button so the CSV includes these columns:

- `lead_name`
- `company`
- `role`
- `linkedin_url` (blank for now)
- `angle`
- `icp_score`
- `variant_key`
- `hypothesis`
- `message`
- `source_url`

Behavior:

- Use the most recent LinkedIn draft for the message
- If multiple LinkedIn drafts exist, choose the newest OR let user pick (simple dropdown ok)

### 2. Copy Outreach Package Button

Add "Copy Outreach Package" button on `/leads/[id]` that copies a JSON object to clipboard:

```json
{
  "lead": { "id": "...", "name": "...", "role": "...", "company": "..." },
  "icp": { "score": 75, "reasons": ["..."] },
  "signal": {
    "id": "...",
    "angle": "...",
    "excerpt": "...",
    "sourceUrl": "...",
    "capturedAt": "..."
  },
  "drafts": [
    {
      "id": "...",
      "channel": "...",
      "subject": "...",
      "content": "...",
      "angle": "...",
      "variantKey": "...",
      "hypothesis": "...",
      "createdAt": "..."
    }
  ]
}
```

Requirements:

- Must not include any secrets or API keys
- Should work even if some fields are missing (nulls are ok)

### 3. Minimal Sent Logging

Add Prisma model `Touchpoint`:

- `id` - cuid
- `leadId` - FK to Lead
- `channel` - "email" | "linkedin"
- `draftId` - nullable FK to Draft
- `status` - "planned" | "sent"
- `sentAt` - nullable datetime
- `createdAt` - datetime

On lead page:

- Add a "Mark as Sent" action for each draft
- Creates a Touchpoint with status=sent, channel=draft.channel, draftId set, sentAt=now
- Show a small Touchpoints list on the lead page

## Constraints

- No real sending yet (no Gmail/SMTP integration)
- No external CRM integration yet (export only)
- Keep UI minimal and reliable
