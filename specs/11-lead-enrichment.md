# Lead Contact Enrichment (Apollo + Manual Fallback)

## Goal

Leads become executable by adding email/linkedin fields and an enrichment flow.
Exports should include these fields when available.

## Requirements

### 1. Prisma Lead Model Updates

Add the following fields to the `Lead` model:

- `email` - nullable String
- `linkedinUrl` - nullable String
- `enrichedAt` - nullable DateTime
- `enrichmentSource` - nullable String ("manual" | "apollo")

### 2. UI Updates

#### Lead Detail Page (`/leads/[id]`)

Add a "Contact Info" section:

- Email field (editable text input)
- LinkedIn URL field (editable text input)
- Save button to persist changes
- Set `enrichmentSource = "manual"` when saved manually

#### Leads Table (`/leads`)

- Show a badge indicating whether contact info is present
- Green badge: has email or linkedin
- Gray badge: no contact info

### 3. Enrichment Action

#### "Enrich with Apollo" Button

- Add button on lead detail page
- Uses `APOLLO_API_KEY` from environment variables (never stored in DB)
- If `APOLLO_API_KEY` is missing, show clear error message and suggest manual entry

#### Apollo Lookup Strategy

1. Primary: Search by company name + person name (if name exists on lead)
2. Fallback: Search by company name + role keywords (from title/role field)

#### On Success

- Populate `email` and `linkedinUrl` from Apollo response
- Set `enrichedAt` to current timestamp
- Set `enrichmentSource = "apollo"`

#### On Failure/No Results

- Show user-friendly message
- Suggest manual entry as fallback
- Do not throw errors

### 4. Export Updates

#### Dripify CSV Export

- Include `linkedin_url` column from `lead.linkedinUrl` if present

#### Outreach Package JSON

- Include `lead.email` field
- Include `lead.linkedinUrl` field

## Constraints

- Local-first architecture
- No actual email sending
- No authentication required
- Must not commit secrets (APOLLO_API_KEY stays in .env)
- Graceful failure if Apollo returns nothing or API key missing

## API Reference

Apollo People Search API:

- Endpoint: `POST https://api.apollo.io/v1/people/match`
- Headers: `x-api-key: <APOLLO_API_KEY>`
- Body: `{ first_name, last_name, organization_name }`
- Response includes: `person.email`, `person.linkedin_url`
