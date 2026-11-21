---
description: Structured workflow: Architecture & Plan -> Approval -> Implementation -> Independent Review
---

# Phase 1: Architecture & Plan (Read-Only — DO NOT edit files)
1. Read `AGENTS.md` and check `.agents/rules/` (`01-architecture.md`, `02-typescript-style.md`, `03-i18n.md`).
2. Load the matching skills from `.agents/skills/`:
   - `vercel-react-best-practices` (`.agents/skills/vercel-react-best-practices/SKILL.md`) for React 19 / Next.js 16 components, routes, bundle boundaries, or state.
   - `result-error-handling` (`.agents/skills/result-error-handling/SKILL.md`) for services, server actions, error unions, API routes, or error-to-toast hooks.
   - `i18n-workflow` (`.agents/skills/i18n-workflow/SKILL.md`) for user-facing copy, toast messages, or localized navigation changes.
3. Inspect the affected files in `src/` (read-only).
4. Output a concrete implementation plan covering:
   - Exact files to create or modify.
   - Server vs. Client Component boundaries and `next/dynamic` splits.
   - `Result<S, E>` error unions, service signatures, `runAuthorizedAction` usage, and client error hooks.
   - Query parallelization (`Promise.all`, `getOptionalSession`) and cache revalidation (`revalidateLocalizedPaths`).
   - Required translation keys across `src/messages/{en,es,fr}.json`.
5. **STOP HERE** and wait for explicit user approval before creating or modifying any files.

# Phase 2: Implementation & Verification (After user approval)
1. Execute the approved changes in ordered blocks following `AGENTS.md` and `.agents/rules/`.
// turbo
2. Run formatting and the full verification suite (`bunx tsc --noEmit`, `bun run lint`, `bun run i18n:check`, `bun test`):
   ```bash
   bun run format && bunx tsc --noEmit && bun run lint && bun run i18n:check && bun test
   ```
3. Fix any type, lint, i18n parity, or unit test failures before proceeding to Phase 3.

# Phase 3: Independent Review
1. Do **not** self-audit in the same implementation context.
2. Either spawn a clean review sub-agent to execute `.agents/workflows/review-diff.md`, or instruct the user to run `/review-diff` in a fresh session using a reasoning-focused Gemini model to audit `git diff` against `AGENTS.md`, `.agents/rules/`, and `vercel-react-best-practices`.
