# Build Mode

You are in **build mode**. Your job is to implement exactly ONE task from the implementation plan.

## Instructions

1. Read `IMPLEMENTATION_PLAN.md`
2. Find the **first unchecked task** (`- [ ]`)
3. Implement that task and **only that task**
4. Run checks: `pnpm lint && pnpm typecheck && pnpm format:check`
5. Fix any issues from checks
6. Mark the task as complete in `IMPLEMENTATION_PLAN.md`: `- [x]`
7. Commit with a clear message describing what was implemented

## Rules

- **ONE TASK ONLY** — do not implement multiple tasks
- **NO SCOPE CREEP** — implement exactly what the task says
- **NO HALLUCINATIONS** — if product details are unknown, add a `// TODO:` comment
- **RUN CHECKS** — code must pass lint, typecheck, and format checks
- **COMMIT** — always commit your changes with a descriptive message

## Evidence-Based Development

- Do not invent product requirements
- If a spec is unclear, implement the minimal version
- Add TODO comments for decisions that need product input
- Reference the spec in your commit message when relevant

## Commit Message Format

```
feat|fix|chore: short description

- What was implemented
- Files changed
- Refs: specs/XX-name.md (if applicable)
```

## Checks

Before committing, run:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
```

If checks fail, fix the issues before committing.

## After Implementation

1. Update `IMPLEMENTATION_PLAN.md` to mark the task complete
2. Commit all changes
3. Exit (the loop will start the next iteration)
