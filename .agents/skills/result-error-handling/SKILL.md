---
name: result-error-handling
description: >-
  End-to-end playbook for implementing domain error unions, Result-returning
  services, authorized server actions, HTTP API error responses, and translated
  client toast hooks in this repository. Use whenever creating or modifying
  services, server actions, error types, API routes, or error-handling hooks.
---

# Result & Domain Error-Handling Playbook

This repository treats expected failures as typed values using `Result<S, E>` (`src/utils/result.ts`). Follow these steps when adding or modifying operations across `types/`, `services/`, `actions/`, `hooks/`, or `src/app/api/`.

## 1. Define the Domain Error Union (`src/features/<feature>/types/errors.ts`)

Model every expected failure as a discriminated union on `reason` (`UPPER_SNAKE_CASE`). Attach only structured data needed for translation interpolation or server logging (`slug`, `name`, `identifier`, `details`), never UI strings.

Reference implementation: `src/features/blog/types/errors.ts` (`CategoryError`, `PostError`).

```ts
export type CategoryError =
  | { reason: 'CATEGORY_NOT_FOUND'; identifier?: string }
  | { reason: 'TARGET_CATEGORY_NOT_FOUND'; identifier?: string }
  | { reason: 'DUPLICATE_CATEGORY_NAME'; name: string }
  | { reason: 'DUPLICATE_CATEGORY_SLUG'; slug: string }
  | { reason: 'SAME_CATEGORY_MERGE' }
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'VALIDATION_ERROR' }
  | { reason: 'DATABASE_ERROR'; details?: unknown }
```

Use `Extract<XError, { reason: ... }>` to derive narrower error unions for read-only queries (e.g. `DatabaseError`, `PostQueryError` in `src/features/blog/types/errors.ts`).

## 2. Implement the Service (`src/features/<feature>/services/*-service.ts`)

- Never import React, Next.js navigation, or UI modules in a service.
- Accept `database: AppDatabase = db` (`src/db/index.ts`) so tests in `*.test.ts` can inject a test DB (`src/db/test-db.ts`) or mock transport.
- Wrap Drizzle queries in `withDatabaseError(context, async () => ...)` (`src/db/utils.ts`), or use `tryCatchResult` / `fromPromise` (`src/utils/result.ts`) when mapping driver errors to domain reasons (e.g. `mapDatabasePostError` in `src/features/blog/services/posts-mutation-service.ts`).
- Return `okay(data)` on success and `error({ reason: '...' })` on expected failure.

Reference implementation: `src/features/blog/services/categories-service.ts`.

```ts
import { type AppDatabase, db } from '@/db'
import { categories } from '@/db/schema'
import { withDatabaseError } from '@/db/utils'
import { error, okay, type Result } from '@/utils/result'
import type { CreateCategoryInput } from '../schemas/category-schema'
import type { AdminCategoryItem, CategoryError } from '../types'

export function createCategory(
  input: CreateCategoryInput,
  database: AppDatabase = db,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  return withDatabaseError<AdminCategoryItem, CategoryError>(
    'Error creating category',
    async () => {
      const [inserted] = await database.insert(categories).values(input).returning()
      if (!inserted) return error({ reason: 'DATABASE_ERROR' })
      return okay({ ...inserted, description: inserted.description ?? '', totalPosts: 0, publishedPosts: 0, draftPosts: 0 })
    },
  )
}
```

## 3. Expose the Server Action (`src/features/<feature>/actions/*-actions.ts`)

Use `runAuthorizedAction` (`src/lib/actions/run-authorized-action.ts`) to run `verifyAccess(role)` (`src/lib/auth/verify-access.ts`), validate input against a Zod 4 schema (`src/features/<feature>/schemas/*-schema.ts`), invoke the service, and trigger `revalidateLocalizedPaths` (`src/lib/actions/revalidate-localized-paths.ts`).

Reference implementation: `src/features/blog/actions/category-actions.ts`.

```ts
'use server'

import { revalidateLocalizedPaths } from '@/lib/actions/revalidate-localized-paths'
import { runAuthorizedAction } from '@/lib/actions/run-authorized-action'
import type { Result } from '@/utils/result'
import { type CreateCategoryInput, createCategorySchema } from '../schemas/category-schema'
import { createCategory } from '../services/categories-service'
import type { AdminCategoryItem, CategoryError } from '../types'

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  return runAuthorizedAction({
    role: 'editor',
    schema: createCategorySchema,
    input,
    handler: (data) => createCategory(data),
    onSuccess: () => revalidateLocalizedPaths(['/blog', '/dashboard/posts', '/dashboard/categories']),
  })
}
```

Keep non-standard actions direct only when required (e.g. `FormData` in `src/features/blog/actions/upload-image-action.ts`, dual draft/publish schemas in `src/features/blog/actions/save-post-action.ts`, or unauthenticated actions in `src/features/contact/actions/send-contact-message-action.ts`).

## 4. Map Errors to Translated Client Toasts (`src/features/<feature>/hooks/use-*-errors.ts`)

Add `<REASON>.{title,description}` keys to `src/messages/{en,es,fr}.json` under `features.<feature>.<scope>.errors`, then create a client hook:

- **Case A — 1:1 reasons without ICU parameters**: Use `useDomainErrorToast<XError>(t)` from `src/hooks/use-domain-error-toast.ts` (reference: `src/features/contact/hooks/use-contact-errors.ts`).
  ```ts
  'use client'

  import { useTranslations } from 'next-intl'
  import { useDomainErrorToast } from '@/hooks/use-domain-error-toast'
  import type { ContactError } from '../types/errors'

  export function useContactErrors() {
    const t = useTranslations('features.contact.errors')
    const { handleError: handleContactError } = useDomainErrorToast<ContactError>(t)
    return { handleContactError }
  }
  ```

- **Case B — Unions with ICU parameters (`{name}`, `{slug}`, `{title}`)**: Use an exhaustive `switch (err.reason)` combining `translateErrorReason(t, err.reason)` for plain reasons, explicit interpolation cases, and `default: return assertNever(err)` (reference: `src/features/blog/hooks/use-category-errors.ts` and `src/features/blog/hooks/use-post-errors.ts`).

## 5. HTTP Route Handlers (`src/app/api/**/route.ts`)

When returning a `Result` error from a Route Handler, register any new reason in `ApiErrorReason` and `HTTP_STATUS_BY_REASON` (`src/utils/http-status.ts`) and return `handleApiError(err)`.

## 6. Verification

Run `bunx tsc --noEmit && bun run i18n:check && bun test` to verify exhaustiveness, locale parity, and unit tests.
