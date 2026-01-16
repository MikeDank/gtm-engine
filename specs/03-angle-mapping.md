# Signal Angle Mapping & Experiment-Ready Draft Variants

## Overview

For each Signal and Lead, the system suggests a message "angle" based on the signal text.
Drafts are tagged with angle + hypothesis to enable A/B testing.

## Angles (V1)

A small enum/constant list of messaging angles:

| Angle Key               | Description                           |
| ----------------------- | ------------------------------------- |
| speed_vs_safety         | Speed vs safety trade-offs            |
| policy_enforcement      | Policy and enforcement concerns       |
| migration_risk          | Migration and modernization risks     |
| incident_reduction      | Incident prevention and reduction     |
| developer_experience    | Developer productivity and experience |
| compliance_auditability | Compliance and audit requirements     |

## Schema Changes

### Signal

Add nullable angle field:

```
Signal.angle: string?  // one of the angle keys, or null
```

### Draft

Add angle and hypothesis fields:

```
Draft.angle: string?      // one of the angle keys
Draft.hypothesis: string? // e.g., "Angle=incident_reduction will resonate because the signal mentions recent outages"
```

## Angle Classifier

Deterministic V1 classifier (no LLM required):

```typescript
classifyAngleFromSignal(excerpt: string) -> { angle: string | null, reasons: string[] }
```

### Classification Rules

1. **incident_reduction** / **speed_vs_safety**:
   - Keywords: "incident", "rollback", "outage", "downtime", "failure", "crash"
2. **policy_enforcement**:
   - Keywords: "policy", "enforce", "review", "approval", "gate"
3. **migration_risk**:
   - Keywords: "migrate", "microservices", "auth", "legacy", "modernize", "rewrite"
4. **developer_experience**:
   - Keywords: "developer experience", "devex", "productivity", "friction", "onboarding"
5. **compliance_auditability**:
   - Keywords: "compliance", "audit", "regulation", "soc2", "gdpr", "hipaa"

If multiple angles match, prefer incident_reduction > policy_enforcement > migration_risk > developer_experience > compliance_auditability > speed_vs_safety.

Store the chosen angle on Signal.angle when ingesting or when manually changed.

## UI Changes

### /signals List

- Show angle badge next to each signal (if angle is set)
- Badge should be styled by angle type

### /signals/[id] Detail

- Display angle badge prominently
- Allow manually changing the angle via dropdown/select
- Save button to persist angle change

## Draft Generation Wiring

When creating drafts (template or LLM):

1. Pass Signal.angle into generation context
2. Auto-tag Draft.angle from Signal.angle
3. Generate hypothesis based on signal excerpt and ICP scoring reasons:
   - Format: "Angle=<angle> will resonate because <one sentence>"
4. Create 2 variants per draft run:
   - Variant A: metric framing (variantKey: `<angle>_metric_v1`)
   - Variant B: risk framing (variantKey: `<angle>_risk_v1`)

### Hypothesis Generation

The hypothesis must be grounded in:

- Signal excerpt text
- ICP scoring reasons

No invented claims allowed.

Example:

- Signal excerpt: "We had 3 major outages this quarter..."
- ICP reasons: ["Role contains 'platform' (+30)"]
- Hypothesis: "Angle=incident_reduction will resonate because the signal mentions recent outages and the lead is in a platform role"

## Safety Rules

1. Hypothesis must reference actual signal content or ICP scoring results
2. No hallucinated benefits or claims
3. Angle can be null if no classification matches
