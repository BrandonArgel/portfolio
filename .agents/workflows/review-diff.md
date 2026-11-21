---
description: Standalone fresh-context audit of git diff and git status against project rules, i18n parity, Result invariants, and React 19 best practices
---

# Independent Diff Review Workflow

Execute this workflow in a fresh session using a reasoning-focused Gemini model (or via a dedicated review sub-agent) to audit uncommitted or branch changes without implementation bias.

## Step 1: Load Rules, Skills & Inspect Changes (Read-Only)
1. Read `AGENTS.md` and all rule files in `.agents/rules/` (`01-architecture.md`, `02-typescript-style.md`, `03-i18n.md`).
2. Load the project skills from `.agents/skills/`:
   - `vercel-react-best-practices` (`.agents/skills/vercel-react-best-practices/SKILL.md`)
   - `result-error-handling` (`.agents/skills/result-error-handling/SKILL.md`)
   - `i18n-workflow` (`.agents/skills/i18n-workflow/SKILL.md`)
// turbo
3. Inspect the current workspace changes:
   ```bash
   git status --short && git diff
   ```

## Step 2: Audit Checklist
Evaluate every changed file against these four gates:

1. **Architecture & `Result` Invariants (`.agents/rules/01-architecture.md` & `result-error-handling`)**
   - Do all services and server actions return `Promise<Result<S, E>>` (`src/utils/result.ts`) without throwing for expected failures?
   - Are DB calls wrapped in `withDatabaseError` (`src/db/utils.ts`) and authorized via `verifyAccess` / `runAuthorizedAction`?
   - Are error unions exhaustively handled via `switch (err.reason)` + `assertNever` or `useDomainErrorToast`, with zero `err.details` leaked to the UI?
   - Does any dashboard composer change violate `data-slot="blog-composer"` or `flex-1 min-h-0 overflow-hidden` scroll containment?

2. **React 19 & Next.js 16 Performance (`vercel-react-best-practices`)**
   - Are Server Components kept on the server, and heavy client-only modules split with `next/dynamic`?
   - Are server `await` calls parallelized with `Promise.all` and session lookups deduplicated via `getOptionalSession` (`src/lib/auth/get-optional-session.ts`)?
   - Are there unnecessary `useEffect` state-syncing chains that should be derived during render or handled via `useOptimistic`?
   - Were any unnecessary manual `useMemo`/`useCallback` wrappers added where the React Compiler already handles memoization, or were refs mutated during render?

3. **TypeScript & Code Style (`.agents/rules/02-typescript-style.md`)**
   - Are there any `any` casts, non-null assertions (`!`), or non-`kebab-case` filenames?
   - Do all Base UI triggers use the `render={<Element />}` prop instead of `asChild`?
   - Are there any circular dependencies, unused exports/types (`bunx fallow dead-code --no-cache`), or newly introduced code clones (`bunx fallow dupes`)?

4. **i18n Completeness (`.agents/rules/03-i18n.md` & `i18n-workflow`)**
   - Are any user-facing strings, `aria-label` attributes, or toast messages hardcoded?
   - Are all new keys present with identical structure and ICU placeholders across `src/messages/{en,es,fr}.json`?
   - Are `Link`, `useRouter`, `usePathname`, and `redirect` imported from `@/i18n/navigation`?

## Step 3: Run Automated Verification Suite
// turbo
1. Execute the verification gate (`bunx tsc --noEmit`, `bun run lint`, `bun run i18n:check`, `bun test`, `bunx fallow dead-code --no-cache`, `bunx fallow dupes`):
   ```bash
   bunx tsc --noEmit && bun run lint && bun run i18n:check && bun test && bunx fallow dead-code --no-cache && bunx fallow dupes
   ```

## Step 4: Output Findings Report
Report findings grouped by severity (**Critical**, **High**, **Medium**, **Low**) with exact `file:line` references and concrete fixes, or confirm a clean pass if zero violations and zero test/check errors are found.
