# Email Sending via Resend

## Overview

Enable sending email drafts directly from the app using Resend, with human approval and automatic touchpoint logging.

## Environment Variables

```env
RESEND_API_KEY=       # Required for email sending
EMAIL_FROM=           # e.g. "Mike <mike@yourdomain.com>"
```

## Email Service

Create `src/lib/email/resend.ts`:

```typescript
interface SendEmailInput {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
}

interface SendEmailResult {
  id: string;
  status: "sent" | "error";
  error?: string;
}

function sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
```

- Handle missing RESEND_API_KEY with clear error
- Handle missing EMAIL_FROM with clear error

## UI Flow

On `/drafts/[id]` page for email drafts:

1. Add "Send Email" button
2. If `lead.email` is missing: disable button, show "Add email on lead first"
3. On click: show confirmation dialog
   - "Send this email to {lead.email} from {EMAIL_FROM}?"
   - Confirm/Cancel buttons

## Server Action

Create `sendEmailDraft(draftId)` server action:

1. Load draft with lead
2. Validate:
   - subject not empty
   - content not empty
   - lead.email exists
3. Rate limit check (max 5 emails per minute, in-memory)
4. Send via Resend
5. Create Touchpoint:
   - leadId = lead.id
   - channel = "email"
   - draftId = draft.id
   - status = "sent"
   - sentAt = now
6. Return success/failure with message id

## Safety Guardrails

- Require explicit confirmation before sending
- Rate limit: max 5 emails per minute (simple in-memory counter)
- Never send if subject or content is empty

## Status Feedback

- Show toast or inline status on success: "Sent" with message id
- Show readable error on failure
- Touchpoints list updates automatically

## Constraints

- No inbox/reply sync
- No email sequencing
- Keep it minimal and reliable
