<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Guide & Agent Router

Trilingual (`en`, `es`, `fr`) personal portfolio, blog, and admin dashboard.

## Tech Stack

| Layer | Implementation |
| --- | --- |
| Framework | Next.js 16 (App Router, `src/proxy.ts`), React 19 (`babel-plugin-react-compiler` active) |
| Language & Runtime | TypeScript 5 (`strict: true`, `@/*` → `./src/*`), Bun (`bun run`, `bun test`) |
| Database | SQLite / Turso (`@libsql/client`) + Drizzle ORM (`src/db/schema/*`, `src/db/migrations/*`) |
| Auth | `better-auth` (`src/lib/auth/auth.ts`, `verifyAccess`, `getOptionalSession`), roles: `admin`, `editor`, `user` + `banned` |
| Validation & Error Flow | Zod 4 (`z.infer`, `z.flattenError`, `z.url()`, `z.uuid()`) + tuple `Result<S, E>` (`src/utils/result.ts`) |
| i18n | `next-intl` (`src/i18n/*`, `src/messages/{en,es,fr}.json`, `src/config/locale.ts`) |
| UI & Styling | Tailwind CSS 4, `@base-ui/react`, `src/components/ui/*`, `lucide-react`, `sileo` toasts |
| Editor & Content | Tiptap 3 (`src/features/editor/*`), MDX (`next-mdx-remote`), KaTeX, `@tanstack/charts`, `@tanstack/highlight` |
| Client State | Zustand 5 (`persist` + IndexedDB via `idb-keyval` in `src/features/blog/store/use-blog-drafts-store.ts`) |
| Formatter & Linter | Biome 2 (`biome.json`: 2 spaces, width 100, single quotes, no semicolons, trailing commas) |

## Repository Map

```text
src/
  app/
    [locale]/(public|auth|admin)/  # Thin App Router pages & layouts (fetch via services → render feature UI)
    api/(auth|og|posts|spotify)/   # HTTP route handlers using handleApiError (src/utils/http-status.ts)
  components/
    ui/                            # Base UI + Tailwind v4 primitives
    layout/                        # Header, footer, dashboard sidebar, command palette, user menu
    shared/ & seo/                 # Cross-feature views (charts, pagination, JSON-LD, error states)
  config/                          # Site, nav, theme, locale (LOCALE_META), OAuth, image-upload constants
  db/                              # Drizzle client, schema/{auth,blog,common,relations}.ts, migrations, utils.ts
  features/<feature>/              # Domain modules: blog, editor, auth, users, contact, spotify, hero, about, services, testimonials, account, shared
    actions/                       # 'use server' entrypoints (runAuthorizedAction + revalidateLocalizedPaths)
    services/                      # Framework-agnostic business/DB logic returning Promise<Result<T, XError>>
    schemas/                       # Zod 4 schemas and z.infer input types
    types/                         # Domain models and discriminated error unions (errors.ts)
    hooks/                         # Client hooks (use-*-errors.ts mapping Result errors to sileo toasts)
    components/                    # Feature UI (admin/ and public/ subfolders where applicable)
    store/ & utils/                # Zustand stores and pure helpers with co-located *.test.ts
  hooks/                           # Shared client hooks (use-domain-error-toast, use-store-hydration, use-copy-to-clipboard, use-is-mobile)
  i18n/                            # routing.ts (LOCALES), navigation.ts (Link, useRouter, redirect), request.ts, formats.ts
  lib/                             # auth/, actions/ (run-authorized-action, revalidate-localized-paths), analytics/, seo.ts, utils.ts
  messages/                        # Trilingual catalogs: en.json, es.json, fr.json
  scripts/check-locales.ts         # Parity checker powering bun run i18n:check
  utils/                           # result.ts, http-status.ts, string-utils.ts, get-initials.ts (+ *.test.ts)
```

## Commands

```bash
bun run dev                        # Start Next.js development server
bun run build                      # Production build verification
bun run format                     # biome format --write && biome check --write
bunx tsc --noEmit                  # TypeScript strict typecheck (must pass)
bun run lint                       # biome check (must pass with 0 errors)
bun run i18n:check                 # Verify structural key parity across src/messages/{en,es,fr}.json
bun test                           # Run co-located Bun unit test suite (*.test.ts)
bunx fallow dead-code --no-cache   # Detect unused files/exports/types & circular dependencies (must pass)
bunx fallow dupes                  # Check for duplicated code blocks & clone families
bun run check                      # Full gate: bunx tsc --noEmit && bun run lint && bun run i18n:check && bun test
bun run db:generate                # Generate Drizzle SQL migration after editing src/db/schema/*
bun run db:migrate                 # Apply pending Drizzle migrations
```

## Rules, Skills & Workflows Routing Table

| Task / Context | Load / Follow |
| --- | --- |
| Always-on architecture, boundaries, auth, DB & `Result` invariants | `.agents/rules/01-architecture.md` |
| TypeScript, naming, React Compiler & Biome rules (`*.ts`, `*.tsx`) | `.agents/rules/02-typescript-style.md` |
| Translation keys, `next-intl` usage & locale navigation | `.agents/rules/03-i18n.md` |
| React 19 / Next.js 16 performance, RSC boundaries, `next/dynamic`, waterfalls | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Creating/updating services, server actions, error unions, API routes or error hooks | `.agents/skills/result-error-handling/SKILL.md` |
| Adding/editing UI strings, error toasts, or localized routes across `en`/`es`/`fr` | `.agents/skills/i18n-workflow/SKILL.md` |
| End-to-end feature execution (Plan → Approval → Implement → Independent Review) | `.agents/workflows/build-feature.md` |
| Independent diff audit for regressions, `Result` violations, i18n parity & React rules | `.agents/workflows/review-diff.md` |

## Domain & Layout Invariants

- **Blog post states & slugs**: Posts track `published`, `draft`, `content` (live), and `draftContent` (unpublished edits overlay). Slugs are unique per `(locale, slug)` and must match `POST_SLUG_REGEX`. Editing an existing post title must not silently change its slug; when a slug changes on save, `router.replace('/dashboard/posts/<newSlug>/edit')` prevents 404s.
- **Dashboard composer scroll lock**: The dashboard shell is `h-dvh max-h-dvh flex flex-col overflow-hidden`. Composer pages mark their root with `data-slot="blog-composer"` and every intermediate wrapper uses `flex-1 min-h-0 overflow-hidden` (no nested `h-dvh`/`h-screen`); only the Tiptap canvas and metadata panel/sheet body may scroll vertically.
