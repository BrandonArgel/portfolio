<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Guide for AI Agents

Personal portfolio + blog + admin dashboard. Trilingual (`en`, `es`, `fr`). Read this before changing code.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 (React Compiler enabled via `babel-plugin-react-compiler`) |
| Language | TypeScript (`strict`), path alias `@/*` → `src/*` |
| Runtime / PM | Bun (`bun install`, `bun run`, `bun test`) |
| DB | SQLite/Turso (`@libsql/client`) + Drizzle ORM (`src/db`, migrations in `src/db/migrations`) |
| Auth | better-auth (`src/lib/auth`), roles: `admin`, `editor`, `user`; `banned` flag |
| Validation | Zod 4 (`z.flattenError`, `z.url()`, `z.uuid()`) |
| i18n | `next-intl` (`src/i18n`, messages in `src/messages/{en,es,fr}.json`) |
| UI | Tailwind CSS 4, `@base-ui/react` + shadcn-style components (`src/components/ui`), `lucide-react`, toasts via `sileo` |
| Editor | Tiptap 3 (`src/features/editor`), MDX rendering via `next-mdx-remote` |
| State | Zustand (`persist` + IndexedDB via `idb-keyval` for blog drafts) |
| Server actions | Plain `'use server'` functions returning `Result` |
| Lint/format | Biome 2 (single quotes, no semicolons, 2 spaces, width 100, trailing commas) |

> Check `node_modules/next/dist/docs/` for any Next.js API you are unsure about (caching, `proxy.ts` instead of middleware, async `params`/`searchParams`, etc.).

## Commands

```bash
bun run dev            # next dev
bun run build          # production build
bun run lint           # biome check (must pass: 0 errors)
bun run format         # biome format --write && biome check --write
bun run i18n:check     # verifies key parity across en/es/fr (must pass)
bunx tsc --noEmit      # type check (must pass)
bun test               # unit tests (*.test.ts next to the code)
bun run db:generate    # drizzle-kit generate migration after schema changes
bun run db:migrate     # apply migrations
```

Before finishing any task: `bunx tsc --noEmit`, `bun run lint`, `bun run i18n:check` (if messages changed), `bun test`.

## Architecture

Feature-based layout. Each domain lives in `src/features/<feature>/`:

```
src/features/<feature>/
  actions/     'use server' entrypoints (auth check → validate → call service → revalidate)
  services/    DB/business logic; NEVER imports React/UI; returns Result
  schemas/     Zod schemas + inferred input types
  types/       Domain types and error unions (errors.ts)
  hooks/       Client hooks (e.g. use-*-errors.ts that map errors → translated toasts)
  components/  UI (admin/, public/ subfolders where useful)
  store/       Zustand stores
  utils/       Pure helpers (+ co-located tests)
```

- `src/app/[locale]/(public|auth|admin)/...` are routes only: fetch via services, render feature components. Keep pages thin.
- `src/components/ui` = generic primitives; `src/components/layout` = shell (header, footer, dashboard sidebar, shared `user-menu`); `src/components/shared`/`seo` = cross-feature (e.g. `admin-pagination.tsx`, `not-found-view.tsx`).
- Import from other features via their path (`@/features/blog/...`), not deep relative paths across feature boundaries. Use relative imports inside the same feature.
- Services are split by responsibility, e.g. blog: `posts-query-service.ts` (reads), `posts-mutation-service.ts` (writes), `posts-service.ts` (barrel re-export), `categories-service.ts`, `bookmarks-service.ts`, `comments-service.ts`.

## The `Result` Pattern (core convention)

`src/utils/result.ts`:

```ts
export type Result<S, E extends { reason: string }> = [E, null] | [null, S]
okay(data)                  // → [null, data]
error(err)                  // → [err, null]
assertNever(value)          // → compile-time exhaustiveness guard in switch default branches
tryCatchResult(fn, onThrow) // → wraps async Result-returning work and maps thrown errors
fromPromise(fn, onThrow)    // → wraps a Promise<S> into Promise<Result<S, E>>
```

Rules:

1. Expected failures are **values**, never thrown. Services and actions return `Promise<Result<T, XError>>`.
2. `XError` is a **discriminated union on `reason`** (UPPER_SNAKE_CASE), defined in `features/<feature>/types/errors.ts` (see `PostError`, `CategoryError`, `ImageUploadError`, `BlogError`, `CommentError`, `UserError`, `ContactError`, `SpotifyError`, auth `LoginError`/`RegisterError`/`SocialAuthError`). Attach only typed, useful payload (`slug`, `identifier`, `details`), never English UI copy.
3. Consume with tuple destructuring and early return:
   ```ts
   const [err, data] = await getPublishedPostBySlug(slug, locale)
   if (err) return handle(err)
   ```
4. Wrap DB calls in `withDatabaseError(context, async () => ...)` (`src/db/utils.ts`), or `tryCatchResult` when mapping DB errors to domain variants (e.g. unique constraint on `idx_posts_locale_slug` → `DUPLICATE_POST_SLUG` via `mapDatabasePostError`), and return `error({ reason: 'DATABASE_ERROR', details })` on generic failures. Use `tryCatchResult` / `fromPromise` for non-DB async boundaries.
5. Never throw exceptions for expected domain failures.
6. Pass `Result` through layers unchanged (`if (err) return error(err)`) or narrow explicitly via exhaustive `switch` + `assertNever` (`assertNever(err.reason)` for single-variant error types such as `DatabaseError`).
7. Never leak `details` to the client UI; map `reason` → i18n message.
8. HTTP routes: use `handleApiError(err)` (`src/utils/http-status.ts`, backed by `satisfies Record<ApiErrorReason, number>`) and add new reasons to `ApiErrorReason` and `HTTP_STATUS_BY_REASON`.

### Error → UI mapping

For each error union create `hooks/use-<x>-errors.ts` (`'use client'`):

- Use `useTranslations('features.<feature>.<scope>.errors')` and `common.errors` for fallback.
- For 1:1 error namespaces (`<REASON>.{title,description}` with no ICU params), use `useDomainErrorToast<XError>(t)` from `src/hooks/use-domain-error-toast.ts` (preserves strict key exhaustiveness via `next-intl` types with zero casts).
- For hooks with ICU params (`{slug}`, `{name}`) or `common.errors` fallbacks, write an exhaustive `switch (err.reason)` using `translateErrorReason(t, err.reason)` for plain reasons and explicit cases for interpolated ones, ending with `default: return assertNever(err)`.
- Expose `handleXError(err)` → `sileo.error({ title, description })`.
- Message shape in JSON: `errors.<REASON>.{title,description}` with ICU params (`{slug}`, `{name}`).

### Server action template

For standard authenticated + Zod-validated actions, use `runAuthorizedAction` (`src/lib/actions/run-authorized-action.ts`) and `revalidateLocalizedPaths` (`src/lib/actions/revalidate-localized-paths.ts`):

```ts
'use server'
export async function doThingAction(input: Input): Promise<Result<Out, XError>> {
  return runAuthorizedAction({
    role: 'editor', // session + banned + role via verifyAccess
    schema,
    input,
    handler: (data, actor) => doThing(data, actor),
    onSuccess: (out) => revalidateLocalizedPaths([`/dashboard/.../${out.slug}`]),
  })
}
```

Keep specialized actions with non-standard auth/inputs direct (`uploadImageAction` for `FormData`, `savePostAction` for dual draft/publish validation, `translatePostAction`, unauthenticated `sendContactMessageAction`, and `setCookieConsent`).
Client calls actions directly (`startTransition(async () => { const [err, res] = await action(...) })`) and uses `handleXError`.

## Blog domain notes

- Posts have `published`, `draft`, `content` (live) and `draftContent` (overlay for edits on a published post). States: Draft, Published, Published + unpublished changes.
- Slug uniqueness is per `(locale, slug)`. Slugs must be kebab-case (`POST_SLUG_REGEX`). Publishing requires title, valid slug and non-empty content (`publishPostSchema`); drafts allow empty content.
- Editing the title of an **existing** post must not silently change its slug. When a save changes the slug, `savePost` returns `{ post, previousSlug, slugChanged }` and the composer calls `router.replace('/dashboard/posts/<newSlug>/edit')` to avoid a 404.
- Drafts auto-save every 15s (intent `auto_save`, no revalidation) and are persisted locally in IndexedDB (`use-blog-drafts-store`).
- Revalidate both unprefixed and `/${locale}/...` paths (see `revalidatePostPaths`).

## i18n

- All user-facing strings go through `next-intl`; never hardcode UI text (including toasts and aria-labels where feasible).
- Add keys to **all three** `src/messages/{en,es,fr}.json` with identical structure; run `bun run i18n:check`.
- Namespaces follow `features.<feature>.<area>` (e.g. `features.blog.composer`, `features.blog.posts.errors`). Common strings in `common.*`.
- Use `Link`, `useRouter`, `redirect` from `@/i18n/navigation` (locale-aware), not from `next/navigation`, in UI code. Server `notFound()`/`redirect` with an explicit locale path from `next/navigation` is acceptable in server pages.
- Server: `getTranslations({ locale, namespace })`; client: `useTranslations`.
- Locales and metadata: `src/i18n/routing.ts` (`LOCALES`), `src/config/locale.ts` (`LOCALE_META`).

## Database (Drizzle)

- Schema in `src/db/schema/*` (`blog.ts`, `auth.ts`, `relations.ts`, `common.ts` → `baseColumns`). After editing: `bun run db:generate`, review SQL, `bun run db:migrate`. Never edit generated migrations by hand.
- Prefer `db.query.*` with `with:` relations for reads; `db.select()` for aggregates.
- Use `likeContains(column, query)` from `@/db/utils` (`src/db/utils.ts`) for SQLite/Turso `LIKE` filters (it handles both `escapeLikePattern` and SQLite's `ESCAPE '\'` clause), and wrap DB blocks with `withDatabaseError`. Check ownership (`authorId`) unless `role === 'admin'`.
- Keep multi-step writes ordered and idempotent (`onConflictDoNothing`).

## Auth & Authorization

- Server-side checks always: session → `banned` (re-read from DB) → role. Admin pages live under `(admin)/dashboard` and are guarded in `dashboard/layout.tsx`.
- `verifyAccess` (`src/lib/auth/verify-access.ts`) is the shared helper for all server actions (`verifyAccess('user' | 'editor' | 'admin')`).
- Editors can only modify their own posts; deleting posts and managing users is admin-only.

## React / Next.js conventions

- Server Components by default; add `'use client'` only when needed (state, effects, browser APIs).
- `params` and `searchParams` are Promises — `await` them.
- React Compiler is on: avoid manual `useMemo`/`useCallback` unless required for stable identities in effects/timers; don't mutate props/state.
- Keep effects minimal; derive state during render. Avoid `any` (the one existing `any` in `use-store-hydration.ts` is a known warning).
- Zustand persisted stores must be gated with `useStoreHydration` before reading.
- Use `cn()` from `@/lib/utils` for class merging. Tailwind v4 syntax (`size-4`, `min-w-50`, `has-data-[...]`, `w-(--css-var)`).
- Prefer `useIsMobile()` (`< 768px`) for JS layout branching; prefer responsive classes (`md:`) when CSS suffices.

## Layout / Scroll rules (dashboard editor)

- The dashboard shell is `h-dvh max-h-dvh flex flex-col overflow-hidden`; every intermediate wrapper down to the editor uses `flex-1 min-h-0 overflow-hidden`. Do **not** add nested `h-dvh`/`h-screen`/`calc(100dvh - …)`.
- Only these may scroll on the editor screen: the Tiptap canvas (`overflow-y-auto flex-1 min-h-0`) and the metadata panel/sheet body. The `window`/`body` must never scroll vertically there.
- Editor pages mark their root with `data-slot="blog-composer"`; `SidebarInset` uses `has-data-[slot=blog-composer]:overflow-hidden`.
- Editor header: mobile stacks into two rows (title input `w-full min-w-0`, then badge + actions); `md:` goes horizontal with title `min-w-[180px] flex-1`.

## Code style

- Biome is the source of truth: single quotes, no semicolons, 2 spaces, 100 cols, trailing commas, sorted imports (`biome check --write` fixes). No Prettier/ESLint.
- Naming: all files and folders use strict hyphenated `kebab-case` (no PascalCase component filenames, no dot-separated suffixes — use `*-service.ts`, `*-action.ts`/`*-actions.ts`, `*-schema.ts`, `use-*.ts`, keeping `*.test.ts` for Bun tests and App Router special files); components use `PascalCase` exports; error reasons `UPPER_SNAKE_CASE`; types/interfaces `PascalCase`.
- Strong typing: derive types from Zod (`z.infer`), export result interfaces from services, use `satisfies` for exhaustive maps. No non-null assertions to bypass checks.
- Comments explain *why*, not *what*; write new ones in English.
- Tests: Bun test, co-located `*.test.ts`, focus on pure logic and services with injected transports (see `image-upload-service.test.ts`).

## Do / Don't

**Do**: reuse existing patterns (`categories-service.ts` + `category-actions.ts` + `use-category-errors.ts` is the reference trio), update all 3 locale files, run the verification commands, keep pages thin, return `Result`.

**Don't**: throw for expected failures, hardcode UI strings, put DB logic in components/pages, introduce new UI/state/validation libraries without need, use global installs (use `bun add`), commit secrets (`.env.local` is local only; env is validated with `@t3-oss/env-nextjs`), edit `node_modules` or generated Drizzle meta.
