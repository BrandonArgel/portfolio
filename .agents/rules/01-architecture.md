---
trigger: always_on
---

# Architecture, Boundaries & Result Invariants

- Keep `src/app/[locale]/(public|auth|admin)/**` routes thin: await `params`/`searchParams`, fetch data via `src/features/<feature>/services/*-service.ts`, and render feature components from `src/features/<feature>/components/`.
- Organize every domain under `src/features/<feature>/{actions,services,schemas,types,hooks,components,store,utils}`.
- Import across features via `@/features/<feature>/...` path aliases; use relative imports within the same feature; place generic Base UI primitives in `src/components/ui/` and cross-feature views in `src/components/{layout,shared,seo}/`.
- Default to Server Components; add `'use client'` only when using React state, effects, or browser APIs.
- Lazy-load heavy client-only modules (such as `@tanstack/charts` via `src/components/shared/dynamic-tanstack-chart-renderer.tsx`, modals, sheets, and live MDX preview) with `next/dynamic(..., { ssr: false })`.
- Gate persisted Zustand stores (such as `src/features/blog/store/use-blog-drafts-store.ts`) with `useStoreHydration` (`src/hooks/use-store-hydration.ts`) before reading hydrated values.
- Parallelize independent server queries and translations with `Promise.all`; deduplicate server-component session lookups within a request using `getOptionalSession` (`src/lib/auth/get-optional-session.ts`).
- Enforce authorization on the server in every action and protected route: check session, re-read `users.banned` and `users.role` from the database via `verifyAccess` (`src/lib/auth/verify-access.ts`), and enforce ownership (`post.authorId === actor.id` unless `actor.role === 'admin'`). Post deletion and user management require `'admin'`.
- Wrap standard authenticated and Zod-validated `'use server'` actions with `runAuthorizedAction` (`src/lib/actions/run-authorized-action.ts`) and revalidate affected paths across all locales with `revalidateLocalizedPaths` (`src/lib/actions/revalidate-localized-paths.ts`).
- Never import React or UI modules inside `src/features/**/services/**`. Accept `database: AppDatabase = db` (`src/db/index.ts`) in services so unit tests can inject an isolated database (`src/db/test-db.ts`).
- Wrap database operations in `withDatabaseError(context, async () => ...)` (`src/db/utils.ts`), use `likeContains(column, query)` for escaped SQLite/Turso `LIKE` queries, and use `.onConflictDoNothing()` for idempotent join-table writes.
- After modifying `src/db/schema/*`, generate migrations with `bun run db:generate` and apply with `bun run db:migrate`; never hand-edit files in `src/db/migrations/`.
- Return `Promise<Result<S, E>>` (`src/utils/result.ts`) from all services and server actions using `okay(data)` and `error(err)`. Never throw exceptions for expected domain, validation, auth, or database failures.
- Model every domain error `E` as a discriminated union on an `UPPER_SNAKE_CASE` `reason` field in `src/features/<feature>/types/errors.ts` carrying only structured metadata (`slug`, `name`, `identifier`, `details`), never hardcoded UI copy.
- Consume `Result` tuples via `const [err, data] = await fn()` with early return (`if (err) return error(err)`), or narrow exhaustively with `switch (err.reason)` ending in `default: return assertNever(err)` (`src/utils/result.ts`).
- Map errors to translated `sileo.error` toasts on the client via `src/features/<feature>/hooks/use-*-errors.ts` using `useDomainErrorToast` or `translateErrorReason` (`src/hooks/use-domain-error-toast.ts`); never expose raw `err.details` to users.
- Return HTTP responses in `src/app/api/**/route.ts` via `handleApiError(err)` (`src/utils/http-status.ts`), registering any new API error reason in `ApiErrorReason` and `HTTP_STATUS_BY_REASON`.
- Preserve dashboard editor scroll containment: mark composer roots with `data-slot="blog-composer"`, keep intermediate wrappers `flex-1 min-h-0 overflow-hidden` without nested `h-dvh`/`h-screen`, and restrict vertical scrolling to the Tiptap canvas and metadata panel/sheet body.
