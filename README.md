<div align="center">

# Cita

**AI-powered SKD CPNS tryout platform with personalized tutor.**

A bilingual (Indonesian / English), anonymous-first practice environment for Indonesia's Civil Service Selection Test (SKD CPNS), featuring per-question AI tutoring backed by frontier LLMs.

[![Live](https://img.shields.io/badge/live-cita--nu.vercel.app-111?style=flat-square)](https://cita-nu.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-111?style=flat-square)](#license)
[![Next.js](https://img.shields.io/badge/Next.js-16-111?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-111?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-111?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-111?style=flat-square&logo=supabase)](https://supabase.com)

[Live demo](https://cita-nu.vercel.app) · [Report a bug](https://github.com/putramkti/cita/issues) · [Roadmap](#roadmap)

</div>

---

## Table of contents

- [Overview](#overview)
- [Why Cita](#why-cita)
- [Feature highlights](#feature-highlights)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local development](#local-development)
  - [Database setup](#database-setup)
  - [Seeding questions](#seeding-questions)
  - [Environment variables](#environment-variables)
- [Internationalization](#internationalization)
- [Theming](#theming)
- [Cita Tutor (AI chat)](#cita-tutor-ai-chat)
- [Data model](#data-model)
- [Security model](#security-model)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Quality and testing](#quality-and-testing)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Disclaimer](#disclaimer)

---

## Overview

Cita is a focused, low-friction practice platform for the Indonesian Civil Service Selection Test (Seleksi Kompetensi Dasar / SKD CPNS). Aspiring civil servants can run a 30-question timed tryout without registering, receive an instant score breakdown across the three official subtests, and then engage a built-in AI tutor to discuss each question in depth.

The product was designed around three constraints:

1. **Anonymous-first.** A user can complete a full tryout in under thirty seconds of clicks, with zero account creation.
2. **Bilingual.** All UI chrome and the AI tutor support Indonesian and English so international reviewers, foreign students of Indonesian civic studies, and Indonesian users abroad can all use the platform without friction.
3. **Server-side correctness.** Scoring, message rate-limiting, and AI proxying happen on the server. The client only renders state.

Cita is shipped as a single Next.js App Router application backed by Postgres on Supabase, deployed to Vercel with global edge routing.

## Why Cita

Existing CPNS preparation products either require registration walls, paywall the explanation step, or do not offer a conversational tutor. Cita pursues a different shape:

- **Anonymous baseline.** A cookie-scoped session is enough to run a tryout, see results, and chat with the tutor. Email magic-link auth is on the roadmap for opt-in history sync.
- **AI tutor as the killer feature.** The cached short explanation answers "what is correct"; the tutor answers "why, how, and what if". This unlocks deep practice, not surface-level review.
- **Separation of exam content and presentation.** Questions live in a dedicated content schema, the renderer is locale-aware, and the tutor receives the original Indonesian question regardless of UI locale and translates as needed.
- **Calm typography over decorative chrome.** The visual identity ("Wening", Javanese for "calm") leans on system fonts, neutral palettes, and predictable layout to reduce cognitive load during practice.

## Feature highlights

- **30-question timed tryout** — TWK (10), TIU (10), TKP (10), 30-minute timer, autosave per answer.
- **Result page with cached explanations** — instant per-question breakdown, with TKP weight visualization.
- **Cita Tutor** — split-pane study route (`/study/[attemptId]/[questionId]`) with a sticky question recap on the left and a streaming AI chat on the right. Five-question hard cap per question, persisted to Postgres.
- **Anonymous leaderboard** — top-ten attempts, hash-derived display names (no PII).
- **Bilingual UI** — Indonesian (default) and English, cookie-driven, server-side resolved, with `<html lang>` and `theme-color` switching.
- **Light and dark mode** — cookie-free `next-themes` preference, persisted in `localStorage`, accessible toggle in the header.
- **Locale-aware tutor** — the AI tutor speaks the user's chosen UI language, translating Indonesian-specific terms (TWK, Pancasila, BKN) when first introduced.
- **Server-side rate limiting** — five user messages per question per attempt, enforced in the API route, not just the client.
- **Streaming responses** — Server-Sent Events from a 9router-compatible OpenAI endpoint, surfaced in the UI as character-by-character markdown.
- **Markdown rendering** — `react-markdown` with GitHub-flavoured Markdown and Tailwind Typography for tutor output.

## Architecture

```
Browser (Client Component, "use client")
   |
   |  fetch /api/explain/[questionId]   (POST, SSE)
   v
Next.js Route Handler (Node runtime)
   |    - Cookie auth (cita_anon_id)
   |    - Locale detection (cita_locale)
   |    - 5-message rate limit
   |    - Persist user message
   |
   +--> Supabase Postgres (service role, server-only)
   |
   +--> 9router (OpenAI-compatible)
            kr/claude-haiku-4.5  (default tutor model)
            kr/claude-opus-4.7   (cached baseline explanations)
        SSE stream
   |
   v
Browser receives `data: {...}` events,
appends deltas, renders markdown.
```

Server Components (`page.tsx` files in the App Router) are the data-loading boundary. Client Components (`"use client"`) own only the interactive surface — chat input, theme toggle, locale toggle. Data crosses the boundary as plain serializable values; no functions, classes, or `Map` instances are passed as props (a class of bug worth a dedicated section in any RSC project).

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) | RSC, server actions, route handlers |
| Language | TypeScript 5 | Strict mode, `noUncheckedIndexedAccess` recommended |
| Styling | Tailwind CSS v4 | `@plugin "@tailwindcss/typography"` for tutor output |
| UI primitives | shadcn/ui (Radix) | Accessible buttons, dialogs, badges |
| Theme | `next-themes` 0.4 | `class` attribute strategy, no flash |
| Database | Postgres on Supabase | RLS active, service-role for server-only writes |
| ORM | Prisma 6 (schema only, REST runtime) | Schema authoring, migrations |
| Auth | Anonymous cookie (`cita_anon_id`) | Magic-link email is on the roadmap |
| LLM gateway | 9router (OpenAI-compatible) | Streamed SSE proxy |
| Markdown | `react-markdown` + `remark-gfm` | Rendered with `prose-invert` |
| Hosting | Vercel | App Router serverless functions |
| Package manager | pnpm 11 | `pnpm-lock.yaml` checked in |

## Repository structure

```
cita/
├── prisma/
│   ├── schema.prisma                    # Source of truth for the relational model
│   ├── migrations/
│   │   ├── 0001_init.sql                # Tables: users, questions, attempts, attempt_items
│   │   ├── 0002_rls_policies.sql        # RLS policies for anonymous read/write
│   │   └── 0003_explainer_messages.sql  # Tutor chat persistence
│   └── seed-data/
│       └── questions.json               # 30 SKD questions (TWK 10 + TIU 10 + TKP 10)
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout, theme + i18n bootstrap
│   │   ├── globals.css                  # Tailwind v4, design tokens, typography plugin
│   │   ├── page.tsx                     # Landing
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── tryout/
│   │   │   ├── page.tsx                 # Briefing
│   │   │   ├── actions.ts               # Server actions: start, submit, save answer
│   │   │   ├── [attemptId]/
│   │   │   │   ├── page.tsx             # Tryout flow (30 questions, timer)
│   │   │   │   ├── tryout-client.tsx
│   │   │   │   └── result/page.tsx      # Score + cached explanations
│   │   ├── study/
│   │   │   └── [attemptId]/[questionId]/
│   │   │       ├── page.tsx             # Study layout (server component)
│   │   │       └── tutor-chat.tsx       # Streaming chat (client component)
│   │   └── api/
│   │       └── explain/[questionId]/route.ts  # SSE proxy + persistence
│   ├── components/
│   │   ├── brand/logo.tsx
│   │   ├── layout/site-header.tsx       # Includes theme + locale toggles
│   │   ├── layout/site-footer.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── locale-toggle.tsx
│   │   └── ui/                          # shadcn primitives
│   ├── lib/
│   │   ├── i18n.ts                      # Server-side dictionary resolver
│   │   ├── tutor.ts                     # System prompt builder (id + en)
│   │   ├── tryout.ts                    # IDs, scoring helpers
│   │   ├── time.ts
│   │   ├── types.ts                     # Question, AttemptItem, Category
│   │   └── utils.ts
│   ├── middleware.ts                    # Anonymous-cookie issuance
│   └── utils/supabase/
│       ├── client.ts                    # Browser client
│       ├── server.ts                    # SSR client (cookie-bound)
│       ├── admin.ts                     # Service-role client (server-only)
│       └── middleware.ts
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 LTS
- pnpm 11
- A Supabase project (free tier is sufficient)
- An OpenAI-compatible LLM endpoint (we use 9router; any compatible gateway works)

### Local development

```bash
git clone https://github.com/putramkti/cita.git
cd cita
pnpm install
cp .env.example .env
# fill in the values described below
pnpm dev
```

The development server starts on [http://localhost:3000](http://localhost:3000).

### Database setup

Run the three migrations in order against your Supabase project. The fastest path is the SQL editor:

1. Open `https://supabase.com/dashboard/project/<ref>/sql/new`
2. Paste `prisma/migrations/0001_init.sql`, run.
3. Repeat for `0002_rls_policies.sql` and `0003_explainer_messages.sql`.

Alternatively, use `supabase db push` if you have the Supabase CLI configured.

### Seeding questions

The seed payload lives at `prisma/seed-data/questions.json` and contains thirty questions distributed across TWK (10), TIU (10), and TKP (10). Insert them via the Supabase REST API or the SQL editor. A small Node script for seeding may be added under `scripts/seed.ts` in future revisions.

### Environment variables

Copy `.env.example` to `.env` and populate:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable anon JWT>
SUPABASE_SERVICE_ROLE_KEY=<service role JWT — server only>

# 9router (OpenAI-compatible)
NINEROUTER_BASE_URL=https://your-9router.example.com/v1
NINEROUTER_API_KEY=<your key>
NINEROUTER_TUTOR_MODEL=kr/claude-haiku-4.5
```

The `SUPABASE_SERVICE_ROLE_KEY` is used only inside server-only modules (`src/utils/supabase/admin.ts`, route handlers, server components). It is never imported by anything that ships to the browser.

## Internationalization

Cita ships with two locales out of the box: Indonesian (`id`, default) and English (`en`).

- **Storage.** A long-lived `cita_locale` cookie persists the choice. Server components read it via `getDict()` in `src/lib/i18n.ts`.
- **Switching.** The `LocaleToggle` component in the header writes the cookie and triggers `router.refresh()`, which forces server components to re-render with the new dictionary.
- **Scope.** Only UI chrome is translated. Question content remains in Indonesian — it is the actual exam material — and the tutor translates inline when the locale is `en`.
- **Type safety.** `Dict` is derived from the dictionary record so missing keys fail at compile time.
- **HTML.** The root `<html>` element receives `lang="id"` or `lang="en"` accordingly, plus a locale-specific `<title>` and `<meta name="description">`.

To add a third locale, append a new key to the `dictionaries` record in `src/lib/i18n.ts`, extend the `LocaleToggle` button list, and translate the strings. No other code changes are required.

## Theming

Theme switching is implemented with `next-themes` using the `class` attribute strategy. The `ThemeProvider` is mounted in the root layout with `suppressHydrationWarning` to avoid the well-known initial-render flash.

- **Default.** Dark mode.
- **Toggle.** A sun/moon button in the header. The icon is animated with CSS rotation; only the active icon is visible.
- **Storage.** The theme value persists in `localStorage` under the `theme` key, set by `next-themes`.
- **Tokens.** Design tokens live in `src/app/globals.css` under the `wening` palette and are referenced via Tailwind's CSS variables.

A `theme-color` meta tag is emitted with both `light` and `dark` `prefers-color-scheme` media queries so the mobile chrome bar matches.

## Cita Tutor (AI chat)

The tutor is the centerpiece feature. It runs at `/study/[attemptId]/[questionId]` and is available only after a tryout has been submitted.

**Flow.**

1. The server component (`page.tsx`) fetches the attempt, the attempt item (the user's answer + scoring metadata), and the existing chat history. It enforces ownership via the `cita_anon_id` cookie.
2. The server component renders a sticky question recap on the left (immutable record) and the `TutorChat` client component on the right.
3. When the user sends a message, the client POSTs to `/api/explain/[questionId]` with the attempt id and prompt.
4. The route handler validates ownership, counts existing user messages (max 5), persists the user message, builds a fresh system prompt, and proxies a streaming chat completion to the LLM gateway.
5. As deltas arrive, the route handler relays them to the client as Server-Sent Events. The client appends each delta to the active assistant bubble and re-renders markdown.
6. Once the stream completes, the assistant message is persisted alongside its token counts.

**System prompt.** `src/lib/tutor.ts` builds a locale-aware prompt that includes the question text, all options, the correct answer, the user's answer, the difficulty, the cached baseline explanation, and explicit teaching constraints (use formal register, do not repeat the baseline, end with a reflective question).

**Rate limiting.** Five user messages per question per attempt. Enforced in the route handler before any LLM call.

**Persistence.** All messages live in `explainer_messages` with foreign keys to `attempts` (CASCADE on delete) and `questions` (RESTRICT — questions cannot be removed if any chat references them).

**Quick prompts.** A localized set of starter prompts ("Give a real-world analogy", "Explain it simply", "Why are the other options wrong", "Give a real case example") sits below the message stream and can be dismissed with an X button.

## Data model

```
users
  id              text PK
  email           text NULL                   -- nullable; magic-link path is roadmap
  display_name    text NULL
  created_at      timestamptz default now()

questions
  id              text PK                     -- e.g. q_twk_001
  category        text                        -- TWK | TIU | TKP
  subcategory     text
  question_text   text
  options         jsonb                       -- [{label, text}]
  correct_answer  text NULL                   -- letter; null for TKP
  option_weights  jsonb NULL                  -- TKP only
  difficulty      int                         -- 1..5
  explanation     text NULL                   -- cached baseline
  source          text NULL
  created_at      timestamptz default now()

attempts
  id              text PK                     -- e.g. at_xxx
  user_id         text references users.id
  status          text                        -- IN_PROGRESS | SUBMITTED
  score_total     int default 0
  started_at      timestamptz
  submitted_at    timestamptz NULL
  display_name    text NULL                   -- generated for leaderboard

attempt_items
  id              text PK                     -- e.g. ai_xxx
  attempt_id      text references attempts.id
  question_id     text references questions.id
  user_answer     text NULL
  is_correct      boolean NULL
  score_earned    int default 0
  answered_at     timestamptz NULL

explainer_messages
  id              text PK                     -- e.g. em_xxx
  attempt_item_id text references attempt_items.id ON DELETE CASCADE
  question_id     text references questions.id ON DELETE RESTRICT
  role            text                        -- user | assistant
  content         text
  prompt_tokens   int NULL
  completion_tokens int NULL
  created_at      timestamptz default now()
```

Indexes are placed on the foreign keys plus a compound index `(attempt_item_id, created_at)` for chat retrieval.

## Security model

- **Service-role key isolation.** `SUPABASE_SERVICE_ROLE_KEY` is referenced only inside server-only modules. Importing it from a client component triggers a build error via Next.js's server-only marker.
- **RLS posture.** Tables have permissive RLS (`USING true`) because the application enforces ownership server-side via the cookie. This pattern is acceptable for the anonymous-only flow; if email-bound auth is added, RLS predicates must tighten to `auth.uid() = user_id`.
- **Cookie scope.** The `cita_anon_id` cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, and 1-year max-age.
- **Input validation.** All user input to the tutor is sanitized (`sanitizeUserInput` in `src/lib/tutor.ts`): stripped control characters, normalized whitespace, length-capped to 500 characters.
- **Rate limit.** Five tutor messages per question per attempt. The check runs server-side before any LLM call, defending against bypassed UI controls.
- **Secret management.** No secrets are committed; `.env` is gitignored and `.env.example` ships sanitized placeholders only.
- **CORS.** The route handler does not enable cross-origin posting; only same-origin requests are accepted, which the cookie-based auth already requires.

## Deployment

Cita is deployed on Vercel.

```bash
# install Vercel CLI once
pnpm add -g vercel

# deploy to production
vercel --prod --yes
```

**Project settings.**

- Framework preset: Next.js
- Build command: `pnpm build`
- Output: `.next` (managed by Vercel)
- Node runtime: Node 20

**Environment variables (set in Vercel dashboard, scope: Production).**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NINEROUTER_BASE_URL`
- `NINEROUTER_API_KEY`
- `NINEROUTER_TUTOR_MODEL`

The deployed surface is `https://cita-nu.vercel.app`. Custom domains can be attached through the Vercel dashboard.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the dev server with Turbopack on port 3000 |
| `pnpm build` | Production build (Next.js + TypeScript check) |
| `pnpm start` | Start the production server locally after `pnpm build` |
| `pnpm lint` | ESLint with the Next.js plugin |
| `pnpm exec tsc --noEmit` | Standalone type-check (matches the build's TS step) |
| `vercel --prod --yes` | Promote a deployment to production |

## Quality and testing

- **Type checking.** `tsc --noEmit` runs as part of the production build. The repository targets zero application-level TypeScript errors. Library-shipped declaration noise from Next.js is filtered at the lint hook level.
- **Linting.** ESLint with the official Next.js config.
- **Build verification.** Every commit to `main` is followed by a manual or automated `pnpm build` to catch RSC-boundary errors that the type checker cannot detect.
- **Smoke tests.** Critical paths (`/`, `/tryout`, `/study/...`, `/api/explain/...`) are smoke-tested with `curl` after each production deploy to confirm a 200 response and expected content.
- **End-to-end testing.** Playwright suites are planned but not yet committed.

## Performance

- **Streaming-first tutor.** The chat endpoint streams tokens via SSE; the user sees the first character within roughly one second of submission, well below the perception threshold for "the system is responding".
- **No client-side data fetching for protected content.** Attempt and question data are loaded on the server, eliminating waterfall round trips and removing the need for client-side suspense states.
- **System fonts.** No webfont download; first paint is immediate.
- **Component-level dynamic imports.** The Markdown renderer is loaded only on the study route, keeping the landing and tryout flows lean.
- **Edge-friendly Postgres access.** All Supabase access uses HTTP REST (PostgREST), avoiding the IPv6-only direct-Postgres connection limitation in some serverless environments.

## Accessibility

- **Keyboard navigation.** All interactive elements (tryout option buttons, theme toggle, locale toggle, send button, quick-prompt close button) are reachable and operable via keyboard.
- **Color contrast.** Wening palette tokens were checked against WCAG AA at common foreground/background pairs.
- **Form semantics.** Tutor input is a `<textarea>` with `placeholder` text appropriate to state, plus an explicit `<button type="submit">` for screen readers.
- **Aria labels.** Toggles emit `aria-label` strings that change with locale.
- **Reduced motion.** Streaming animations rely on plain text appending rather than CSS keyframes, so users with `prefers-reduced-motion` see the same content without artifacts.

Full WCAG validation (with assistive technology testing) is part of the roadmap.

## Roadmap

- Magic-link email auth for opt-in attempt history sync across devices.
- Spaced-repetition review queue per category.
- Question bank expansion (target: 300+ across all subcategories).
- Public API surface for educators who want to embed practice into their own courses.
- Offline-capable PWA for areas with intermittent connectivity.
- Playwright end-to-end suite covering the full tryout-to-tutor flow.
- Telemetry: anonymous, opt-in usage analytics for question-difficulty calibration.
- Indonesian regional language support (Javanese, Sundanese) for accessibility.

## Contributing

Contributions are welcome.

1. Open an issue describing the bug or proposal.
2. Fork the repository, create a feature branch (`feat/...` or `fix/...`).
3. Run `pnpm lint && pnpm build` locally.
4. Open a pull request that explains the change and links the issue.

Conventional Commits is the preferred commit-message format. Squash-merge is the default merge strategy.

For larger architectural changes, please open an RFC issue first so the direction can be agreed before implementation begins.

## License

MIT — see [LICENSE](LICENSE) (to be added).

## Acknowledgements

- The shadcn/ui team for accessible Radix-based primitives.
- The Next.js team for the App Router and the streaming primitives that make the tutor experience possible.
- Supabase for a Postgres experience that scales from anonymous tryouts to authenticated history.
- The 9router maintainers for an OpenAI-compatible streaming gateway.
- The Indonesian civil-service exam community for openly published study material that informed the question taxonomy.

## Disclaimer

Cita is an independent practice platform. It is **not affiliated with, endorsed by, or operated on behalf of** Badan Kepegawaian Negara (BKN) or any official Indonesian government agency. Question content is derived from openly available study material and is intended for practice only; it is not an official representation of any current or upcoming SKD CPNS examination. Users should always consult primary BKN materials for authoritative test specifications and current schedules.
