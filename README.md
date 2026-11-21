# Personal Portfolio, Blog & Admin Dashboard

Trilingual (`en`, `es`, `fr`) personal portfolio, MDX blog, and content management dashboard built with Next.js 16, React 19, and TypeScript.

## Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19 (with React Compiler enabled)
- **Language & Runtime:** TypeScript (`strict`), Bun
- **Database & ORM:** SQLite / Turso (`@libsql/client`) + Drizzle ORM
- **Authentication:** `better-auth` with role-based access control (`admin`, `editor`, `user`)
- **Internationalization:** `next-intl` (`en`, `es`, `fr`)
- **Styling & UI:** Tailwind CSS v4, Base UI (`@base-ui/react`), Lucide Icons, Sileo toasts
- **Rich Text & Content:** Tiptap 3 editor, `next-mdx-remote`, Zod 4 validation
- **State Management:** Zustand (with `idb-keyval` IndexedDB persistence for blog drafts)
- **Linting & Formatting:** Biome 2

## Project Structure

```text
src/
├── app/[locale]/         # Localized route entrypoints: (public), (auth), (admin)
├── components/           # Shared UI primitives (ui/), layout shells, and SEO components
├── config/               # Locale metadata and app configuration
├── db/                   # Drizzle schemas, database utilities, and migrations
├── features/             # Domain-driven modules (blog, editor, auth, contact, etc.)
│   └── <feature>/
│       ├── actions/      # 'use server' entrypoints
│       ├── components/   # Feature-scoped UI (admin/, public/)
│       ├── hooks/        # Client hooks and domain error toast mappers
│       ├── schemas/      # Zod validation schemas
│       ├── services/     # Business logic and database queries returning Result
│       ├── store/        # Feature Zustand stores
│       ├── types/        # Domain types and discriminated error unions
│       └── utils/        # Pure helpers and co-located unit tests
├── hooks/                # Cross-feature client hooks
├── i18n/                 # Routing and locale-aware navigation helpers
├── lib/                  # Auth helpers, server action wrappers, and general utilities
├── messages/             # Translation dictionaries (en.json, es.json, fr.json)
└── utils/                # Core utilities including the Result tuple pattern

## Getting Started

### Prerequisites

- Bun installed locally
- A local SQLite file or Turso database credentials

Installation

    Clone the repository and install dependencies:
    Bash

    bun install

    Configure environment variables:
    Bash

    cp .env.example .env.local

    Apply database migrations:
    Bash

    bun run db:migrate

    Start the development server:
    Bash

    bun run dev

Open http://localhost:3000 to view the application.

## Available Scripts

Command,Description
bun run dev,Start the Next.js development server
bun run build,Build the application for production
bun run lint,Run Biome checks across the codebase
bun run format,Format and apply safe Biome fixes
bun run i18n:check,"Verify translation key parity across en, es, and fr"
bunx tsc --noEmit,Run TypeScript type checking
bun test,Run unit tests with Bun's test runner
bun run db:generate,Generate Drizzle SQL migrations after schema updates
bun run db:migrate,Apply pending database migrations