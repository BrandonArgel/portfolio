---
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript, React Compiler & Biome Style Rules

- Adhere to `tsconfig.json` (`"strict": true`, path alias `@/*` → `./src/*`): do not introduce `any`, `@ts-ignore`, `@ts-expect-error`, or non-null assertions (`!`) to bypass type narrowing.
- Define validation schemas with Zod 4 in `src/features/<feature>/schemas/*-schema.ts` (`z.url()`, `z.uuid()`, `z.flattenError`), derive input types via `z.infer<typeof schema>`, and export explicit result interfaces from services.
- Enforce compile-time exhaustiveness with `satisfies Record<Union, Value>` on lookup objects (see `HTTP_STATUS_BY_REASON` in `src/utils/http-status.ts`) and `assertNever` (`src/utils/result.ts`) in `switch` `default` branches.
- Name all files and directories in strict hyphenated `kebab-case` (`*-service.ts`, `*-action.ts`/`*-actions.ts`, `*-schema.ts`, `use-*.ts`, and co-located `*.test.ts`); never use `PascalCase` filenames or dot-separated suffixes outside `*.test.ts` and Next.js App Router special files.
- Use `PascalCase` for React components, type aliases, and interfaces; `camelCase` for functions, hooks, and variables; and `UPPER_SNAKE_CASE` for error `reason` literals and module-level constants.
- Respect the active React Compiler (`babel-plugin-react-compiler` in `next.config.ts`): do not add manual `useMemo` or `useCallback` unless required for referential stability in effect dependencies, timers, or external store selectors.
- Never mutate props, state, or hook arguments, and never mutate refs during render (synchronize callback refs inside `useEffect`, as in `src/features/editor/hooks/use-editor.ts`).
- Derive state during render (or use `useOptimistic` inside `startTransition` for server mutations, as in `src/features/blog/components/admin/categories-manager.tsx`) instead of synchronizing props to local state with `useEffect`.
- Compose `@base-ui/react` triggers (`TooltipTrigger`, `PopoverTrigger`, `DropdownMenuTrigger`, `AlertDialogTrigger`, `Badge`) using the `render={<Element />}` prop, never `asChild`.
- Merge class names with `cn()` (`src/lib/utils.ts`) and use Tailwind CSS v4 canonical utilities (`size-*`, `min-w-50`, `w-(--css-var)`, `has-data-[...]`).
- Use `useCopyToClipboard` (`src/hooks/use-copy-to-clipboard.ts`) for clipboard interactions instead of calling `navigator.clipboard` directly, and `useIsMobile` (`src/hooks/use-is-mobile.ts`) for `< 768px` viewport branching when CSS `md:` breakpoints are insufficient.
- Let Biome 2 (`biome.json`) enforce formatting and import sorting: 2-space indentation, 100-column line width, single quotes, no semicolons, trailing commas, `import type` for type-only imports, `@/*` imports across features, and relative imports within the same feature.
- Enforce acyclic module graphs and zero dead exports/types (`bunx fallow dead-code --no-cache`), and extract shared helpers instead of duplicating structural blocks (`bunx fallow dupes`).
- Write comments in English explaining *why* a decision or constraint exists rather than *what* the code does, and place unit tests in co-located `*.test.ts` files executed via `bun test`.
