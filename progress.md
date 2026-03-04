# Praksonar - Project Progress

> Last updated: 2026-03-04

## Architecture & Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Framework     | Next.js 14 (App Router, `use client` components)|
| Language      | TypeScript                                      |
| Styling       | Tailwind CSS 3.4 + CSS variable theming         |
| Auth & DB     | Supabase (Auth, Postgres, Storage, RLS)         |
| Scraper       | Python / Scrapy (separate `scraper/` directory) |
| Font          | League Spartan (Google Fonts, variable)          |
| Deployment    | Vercel (frontend), Supabase (backend)            |

### Key Architectural Decisions

- **App Router only** -- all pages under `src/app/`, no Pages Router.
- **Client components** -- pages that need interactivity use `'use client'`; the root `layout.tsx` is a server component that fetches session/profile and passes it down via `ClientShell`.
- **CSS variable theming** -- `PaletteProvider` sets CSS variables (`--color-sidebar`, `--color-accent`, etc.) on `:root`. Tailwind extends these via `tailwind.config.ts`. Users can switch between palettes (Teal Gold, Midnight Blue, Forest, etc.) from `/settings`, persisted in `localStorage`.
- **Supabase client pattern** -- `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (RSC). No global singleton; each call creates a scoped client.
- **Row Level Security** -- every table has RLS enabled. Users can only read/write their own rows. Internships are publicly readable but only writable by the service role (scraper).
- **No external UI libraries** -- no toast libraries, no component frameworks. All UI is hand-built with Tailwind.

---

## Database Schema

### `internships`
Core listing table populated by the Scrapy scraper.

| Column              | Type         | Notes                          |
| ------------------- | ------------ | ------------------------------ |
| id                  | uuid (PK)    | Auto-generated                 |
| title               | text         | NOT NULL                       |
| company             | text         | NOT NULL                       |
| description         | text         |                                |
| location            | text         |                                |
| is_international    | boolean      | Default false                  |
| field               | text         | Indexed                        |
| required_skills     | text[]       | Array of skill strings         |
| required_languages  | jsonb        | Array of `{lang, level}` objects|
| source_url          | text         | UNIQUE                         |
| source_name         | text         | e.g. "Infostud"               |
| deadline            | date         |                                |
| created_at          | timestamptz  | Indexed DESC                   |

### `user_profiles`
One row per user, linked to `auth.users`.

| Column              | Type         | Notes                          |
| ------------------- | ------------ | ------------------------------ |
| id                  | uuid (PK/FK) | References auth.users          |
| full_name           | text         |                                |
| university          | text         |                                |
| field_of_study      | text         |                                |
| study_level         | text         | CHECK: bachelor / master       |
| skills              | text[]       |                                |
| languages           | jsonb        | `[{lang, level}]`             |
| avatar_url          | text         | Supabase Storage public URL    |
| cv_url              | text         | Supabase Storage public URL    |
| subscription_tier   | text         | DEFAULT 'free'                 |
| email_notifications | boolean      | DEFAULT true                   |

### `saved_internships`
Join table: user bookmarks internships.

### `cv_generations`
Stores AI-generated CV outputs (future feature). Limited to 3/day via `check_daily_cv_limit()` function.

### Storage Buckets
- **avatars** -- public read, user-scoped write (`{user_id}/avatar.jpg`)
- **cvs** -- public read, user-scoped write (`{user_id}/cv.pdf`)

---

## Routing Map

| Route                   | Page                     | Status    |
| ----------------------- | -------------------------| --------- |
| `/`                     | Landing page             | Done      |
| `/auth/login`           | Email/password login     | Done      |
| `/auth/register`        | Registration + SonarLoader | Done    |
| `/auth/confirm-email`   | Email confirmation       | Done      |
| `/auth/callback`        | Supabase OAuth callback  | Done      |
| `/onboarding`           | 4-step profile setup     | Done      |
| `/internships`          | Main listing + detail    | Done      |
| `/profile`              | Full profile management  | Done      |
| `/settings`             | Theme/palette picker     | Done      |
| `/not-found`            | Custom 404               | Done      |

---

## Completed Features

### Core
- Internship listing with server-side Supabase filtering (field, location, language, text search)
- Paginated "load more" with SonarLoader
- Split pane layout: scrollable list on left, sticky detail panel on right
- Detail panel dynamically expands to full viewport height as user scrolls down
- Save/unsave internships (heart icon, persisted via `saved_internships`)
- "Show saved only" toggle
- Refresh button with 2.5s SonarLoader placeholder (scraper integration point)
- Skill gap analysis: compares user skills to internship requirements

### Auth & Onboarding
- Email/password registration with confirmation email flow
- Login with redirect handling
- 4-step onboarding wizard (basic info, skills, languages, done)
- SonarLoader animation during registration

### Profile Page (Phase 11)
- Profile picture upload/remove via Supabase Storage (`avatars` bucket)
- CV upload/download/remove via Supabase Storage (`cvs` bucket)
- Editable basic info (name, university, field, level)
- Tag-based skill management (add via Enter, remove via X)
- Language management with dual-dropdown form (language + CEFR level)

### UI System
- 6+ color palettes with live switching (Teal Gold, Midnight Blue, Forest, Lavender, etc.)
- CSS variable theming via `PaletteProvider`
- Responsive sidebar for logged-in users, top nav for logged-out
- Mobile hamburger menu with slide-in sidebar overlay
- Mobile internship detail: slide-up tray with touch swipe (expand/collapse/dismiss)
- Custom SonarLoader (canvas-based radar animation, 1 rotation/sec, theme-aware)
- InlineMessage component replaces all `alert()` calls
- Custom 404 page with Praksonar branding
- Ko-fi support link in sidebar and mobile header

### Scraper
- Scrapy spider for Infostud (`startuj.infostud.com/prakse`)
- Extracts: title, company, location, description, requirements, deadline
- Structured JSON-LD parsing for detailed descriptions
- Pagination support
- Dockerized with `docker-compose.yml`

---

## In Progress / Planned

| Feature                      | Status      | Notes                                           |
| ---------------------------- | ----------- | ----------------------------------------------- |
| CV Writer (AI)               | Planned     | Sidebar link exists (disabled, "uskoro" badge)   |
| Scraper integration          | Planned     | "Osvezi listu" button ready, needs API endpoint  |
| Additional scrapers          | Planned     | Only Infostud currently; more sources needed     |
| Email notifications          | Planned     | Column exists but no implementation yet          |
| Premium tier features        | Planned     | `subscription_tier` column ready                 |
| Public profile viewing       | Not started | Currently users can only see own profile         |

---

## Component Inventory

| Component            | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `ClientShell`        | Layout wrapper: sidebar + mobile header + main  |
| `Sidebar`            | Navigation for logged-in and logged-out users    |
| `PaletteProvider`    | CSS variable theming context + persistence       |
| `InternshipCard`     | Card in the listing grid                         |
| `InternshipDetail`   | Right-side detail panel + skill gap analysis     |
| `InlineMessage`      | Dismissible success/error/info banner            |
| `SonarLoader`        | Canvas-based radar animation (loading indicator) |
| `NavAuth`            | Auth-aware nav (unused in current layout)        |
| `ThemeSwitcher`      | Dark/light toggle (superseded by palettes)       |

---

## State Management

- No global state library (no Redux, Zustand, etc.)
- Page-level `useState` + `useEffect` for data fetching
- `useCallback` for memoized fetch functions with dependency-based re-fetching
- `PaletteProvider` context for theming (persisted in `localStorage`)
- URL search params for filter state on `/internships` (shareable URLs)
- Supabase client-side auth via `supabase.auth.getSession()`
