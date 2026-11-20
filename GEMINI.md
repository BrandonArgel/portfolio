@AGENTS.md

# Gemini-specific notes

- The full project guide (stack, `Result` pattern, i18n, DB, layout rules, commands) lives in `AGENTS.md` and is imported above — keep it as the single source of truth; do not duplicate content here.
- Next.js here has breaking changes vs. your training data: consult `node_modules/next/dist/docs/` before using any Next.js API.
- Prefer `Result` tuples (`const [err, data] = await ...`) over exceptions for expected failures; map `reason` → translated toast with the feature's `use-*-errors` hook.
- Package manager is **Bun**; verify with `bunx tsc --noEmit`, `bun run lint`, `bun run i18n:check`, `bun test` before reporting a task as done.

