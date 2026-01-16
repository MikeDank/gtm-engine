# Sequencing v1 (Planned Follow-ups)

Human-approved follow-up sequence generation for leads.

## Overview

For a Lead, generate a simple outreach sequence:

- initial message (already exists via Draft/Touchpoint)
- follow-up #1 scheduled +2 days
- follow-up #2 scheduled +5 days

Operator can send follow-ups from the UI and they get logged as sent.

## Schema Changes

### Touchpoint Model Updates

Add new fields to the existing Touchpoint model:

```prisma
model Touchpoint {
  // ... existing fields
  plannedFor DateTime?  // When follow-up is scheduled
  subject    String?    // Email subject (for email channel)
  content    String?    // Message content for planned touchpoints
}
```

## Sequence Generator

### Function: generateFollowUps(leadId)

Evidence-locked LLM-enabled function that generates 2 follow-up messages.

**Inputs:**

- Lead + contact info
- Source signal excerpt + url + angle
- Active tone.md context doc
- ICP score + reasons
- Previous sent messages (touchpoints with status="sent")

**Outputs:**
2 follow-up messages:

1. **Short bump** (<= 50 words) - brief check-in, reference previous message
2. **Value-add bump** (<= 80 words) - provide additional value/insight

**Constraints:**

- Must not invent facts (evidence-locked)
- Uses existing LLM infrastructure (OpenAI/Anthropic)
- Falls back to deterministic templates if no LLM keys configured

### Fallback Templates

If no LLM API keys are configured, use deterministic templates:

**Follow-up #1 (Short bump):**

```
Hi {firstName},

Wanted to quickly follow up on my previous message about {angle}.
Would love to hear your thoughts when you have a moment.

Best,
{senderName}
```

**Follow-up #2 (Value-add):**

```
Hi {firstName},

Following up on my earlier outreach regarding {signal_excerpt_short}.
{company} seems like a great fit for what we're building.

Happy to share more specifics if helpful. Let me know if you'd like to connect.

Best,
{senderName}
```

## UI Changes

### Lead Detail Page (/leads/[id])

**Generate Follow-ups Button:**

- Add "Generate Follow-ups" button below existing drafts section
- On click: calls generateFollowUps(leadId)
- Creates 2 planned touchpoints:
  - channel = "email"
  - status = "planned"
  - plannedFor = now + 2 days (follow-up #1), now + 5 days (follow-up #2)
  - content = generated follow-up message
  - subject = appropriate follow-up subject line

**Touchpoints List Enhancement:**

- Show planned vs sent touchpoints with different styling
- Display plannedFor date for planned touchpoints
- Display sentAt date for sent touchpoints

### Planned Touchpoint Actions

**Send Now Button:**

- For planned email touchpoints with content
- Confirmation dialog before sending
- Uses existing Resend email service
- On success:
  - status → "sent"
  - sentAt → current timestamp
- If lead.email is missing, disable button with tooltip: "Lead email required"

## Server Actions

### generateFollowUps

```typescript
async function generateFollowUps(leadId: string): Promise<{
  followUp1: { subject: string; content: string };
  followUp2: { subject: string; content: string };
}>;
```

### sendPlannedTouchpoint

```typescript
async function sendPlannedTouchpoint(touchpointId: string): Promise<{
  success: boolean;
  error?: string;
}>;
```

## Integration with Attio

After successfully sending a follow-up:

- If lead.attioPersonId exists, offer "Sync to Attio" quick action
- OR auto-sync the touchpoint as a note

## Constraints

- Human approval required (confirmation dialog before sending)
- No background scheduler (manual send only for v1)
- Graceful handling of missing LLM keys (fallback to templates)
- All follow-ups are planned, never auto-sent
