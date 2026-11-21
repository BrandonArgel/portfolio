---
name: i18n-workflow
description: >-
  Playbook for adding or updating trilingual (en, es, fr) translations, error
  toast messages, server/client next-intl hooks, and locale-aware navigation in
  this repository. Use whenever adding UI copy, modifying src/messages/*.json,
  or working with localized routes.
---

# Trilingual i18n Workflow Playbook (`en`, `es`, `fr`)

All user-facing text in this repository is localized across English (`en`), Spanish (`es`), and French (`fr`) via `next-intl`.

## 1. Source of Truth Files

- **Supported locales & routing**: `src/i18n/routing.ts` (`LOCALES = ['en', 'es', 'fr'] as const`, `localePrefix: 'always'`).
- **Locale display metadata**: `src/config/locale.ts` (`LOCALE_META`).
- **Request configuration & formats**: `src/i18n/request.ts` and `src/i18n/formats.ts`.
- **Locale-aware navigation**: `src/i18n/navigation.ts` (`Link`, `redirect`, `usePathname`, `useRouter`).
- **Message catalogs**:
  - `src/messages/en.json`
  - `src/messages/es.json`
  - `src/messages/fr.json`
- **Parity validator**: `src/scripts/check-locales.ts` (executed via `bun run i18n:check`).

## 2. Adding or Updating Translation Keys

1. **Choose the canonical namespace**:
   - Feature UI: `features.<feature>.<area>` (e.g. `features.blog.composer`, `features.blog.categories`, `features.editor.bubble_menu`).
   - Domain error toasts: `features.<feature>.<scope>.errors.<REASON>.{title,description}` (e.g. `features.blog.categories.errors.DUPLICATE_CATEGORY_SLUG.description` with `{slug}`).
   - Shared layout/components: `components.<area>` (e.g. `components.layout.dashboard`).
   - Global reusable labels: `common.*`.
2. **Update all three catalogs simultaneously**:
   - Add the exact same nested key path and ICU placeholders (`{name}`, `{slug}`, `{count}`) to `src/messages/en.json`, `src/messages/es.json`, and `src/messages/fr.json`.
   - Never leave untranslated English placeholders in `es.json` or `fr.json`.

## 3. Consuming Translations in Server vs. Client Components

- **Server Components & `generateMetadata`** (`src/app/[locale]/**/page.tsx`):
  Import `getTranslations` and `getFormatter` from `next-intl/server`. Parallelize them with `params` and data queries using `Promise.all` (reference: `src/app/[locale]/(admin)/dashboard/page.tsx`):
  ```tsx
  const [{ locale }, session] = await Promise.all([params, getOptionalSession()])
  const [t, format, [statsErr, stats]] = await Promise.all([
    getTranslations({ locale, namespace: 'features.dashboard' }),
    getFormatter({ locale }),
    getDashboardStats(session?.user.role === 'admin'),
  ])
  ```
- **Client Components & Hooks** (`'use client'`):
  Import `useTranslations` from `next-intl`:
  ```tsx
  const t = useTranslations('features.blog.categories')
  ```

## 4. Navigation & Cache Revalidation

- In UI components, always import `Link`, `useRouter`, `usePathname`, and `redirect` from `@/i18n/navigation` so active locale prefixes are preserved automatically.
- In Server Actions, call `revalidateLocalizedPaths(['/blog', '/dashboard/posts'])` (`src/lib/actions/revalidate-localized-paths.ts`) so Next.js revalidates both unprefixed and `/en/...`, `/es/...`, `/fr/...` paths.

## 5. Verification

Always run:

```bash
bun run i18n:check && bunx tsc --noEmit
```

`bun run i18n:check` scans `src/messages/{en,es,fr}.json` and fails with a list of missing keys if any locale drifts out of sync.
