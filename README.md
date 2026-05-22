<div align="center">

# Cita

**SKD CPNS practice platform with personalised AI tutoring, premium subscriptions, and a focused, anonymous-first experience.**

A bilingual (Indonesian / English) practice environment for Indonesia's *Seleksi Kompetensi Dasar* (SKD CPNS), featuring per-question AI tutoring, personalised AI insight reports, voucher-driven premium subscriptions, share cards with dynamic OG images, and a built-in admin panel.

[![Live](https://img.shields.io/badge/live-cita--cpns.vercel.app-111?style=flat-square)](https://cita-cpns.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-111?style=flat-square)](#license)
[![Next.js](https://img.shields.io/badge/Next.js-16-111?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-111?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-111?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-111?style=flat-square&logo=supabase)](https://supabase.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-111?style=flat-square&logo=prisma)](https://prisma.io)

[Live](https://cita-cpns.vercel.app) · [Report a bug](https://github.com/putramkti/cita/issues) · [Roadmap](#roadmap)

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
  - [Environment variables](#environment-variables)
- [Authentication](#authentication)
- [Billing and subscriptions](#billing-and-subscriptions)
- [Voucher system](#voucher-system)
- [Cita Tutor (AI chat)](#cita-tutor-ai-chat)
- [Personalised insight](#personalised-insight)
- [Result share with dynamic OG](#result-share-with-dynamic-og)
- [Admin panel](#admin-panel)
- [Internationalisation](#internationalisation)
- [Theming](#theming)
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

Cita is a focused, low-friction practice platform for the Indonesian Civil Service Selection Test (*Seleksi Kompetensi Dasar* / SKD CPNS). Aspiring civil servants can run a timed tryout (mini or full), receive an instant score breakdown across the three official subtests (TWK, TIU, TKP), and engage a built-in AI tutor to discuss any question in depth. Premium subscribers receive an additional personalised insight report after each tryout and an expanded daily tutor quota.

The product was designed around four constraints:

1. **Anonymous-first.** A user can complete a full tryout in seconds, with zero account creation. Email magic-link auth is opt-in and unlocks history sync, premium upgrades, and the personalised insight.
2. **Bilingual.** All UI chrome and the AI tutor support Indonesian and English. International reviewers, foreign students of Indonesian civic studies, and Indonesian users abroad can all use the platform without friction.
3. **Server-side correctness.** Scoring, message rate-limiting, plan-aware quotas, voucher validation, payment webhook handling, and AI proxying happen on the server. The client only renders state.
4. **Region-pinned latency.** The Vercel function region is pinned to `sin1` to co-locate compute with the Singapore-hosted Supabase project, eliminating the 10-60× latency penalty observed when functions ran in `iad1`.

Cita is shipped as a single Next.js App Router application backed by Postgres on Supabase, deployed to Vercel.

## Why Cita

Existing CPNS preparation products either require registration walls, paywall the explanation step, or do not offer a conversational tutor. Cita pursues a different shape:

- **Anonymous baseline.** A cookie-scoped session is enough to run a tryout, see results, and chat with the tutor. Email magic-link auth is opt-in for those who want history sync, premium features, and personalised analysis.
- **AI tutor as the killer feature.** The cached short explanation answers *what* is correct; the tutor answers *why, how, and what if*. This unlocks deep practice, not surface-level review.
- **Personalised AI insight.** A premium-only post-tryout report identifies which subcategories need drilling, where the user's strengths are, and concrete next steps — generated from the actual answer pattern, not generic templates.
- **Calm typography over decorative chrome.** The visual identity (*Wening*, Javanese for "calm") leans on system fonts, neutral palettes, and predictable layout to reduce cognitive load during practice.
- **Plan-aware everything.** Free, Premium, and Anonymous tiers each get distinct daily tutor quotas, insight access, history retention, and result share permissions, all gated server-side.

## Feature highlights

**Practice and learning**
- **Two tryout modes** — Mini (30 questions, 30-minute timer) and Full (110 questions, full SKD format). Topic distribution mirrors the current BKN guideline.
- **Cita Tutor** — split-pane study route (`/study/[attemptId]/[questionId]`) with a sticky question recap on the left and a streaming AI chat on the right. Free users get 5 tutor questions per day; Premium subscribers get 50.
- **Cached baseline explanations** — every question ships with an answer-key paragraph; the tutor goes beyond it.
- **Personalised AI insight** — premium-only post-tryout report generated by `kr/claude-haiku-4.5`, identifying weak subcategories, strong areas, and concrete next-step drills.
- **Tryout history** — `/akun/history` page with filters, stat cards, and per-attempt CTAs.
- **Per-question report** — flag a question as unclear, with an incorrect key, or with a faulty tutor reply; opens a pre-filled `mailto:` to the maintainer.

**Result and share**
- **Result page with item analysis** — instant per-question breakdown, filter pills (all / correct / incorrect / skipped), CSV download.
- **Public share page** — `/r/[shareId]` renders a read-only score card with optional display name and a CTA to try Cita.
- **Dynamic OG image** — `/api/og/result/[shareId]` produces a 1200×630 social card via `next/og` so shared links preview rich on WhatsApp, X, and other platforms.

**Account and billing**
- **Magic-link auth** — Supabase email magic links with the redirect host derived from `NEXT_PUBLIC_SITE_URL` (per-environment).
- **Premium subscriptions** — Midtrans-driven monthly billing, immediate plan activation on webhook receipt, server-side grace period handling.
- **Voucher system** — admin-CRUD-managed voucher codes with optional 100%-off bypass that activates a subscription without going through Midtrans, real-time validation, one-redemption-per-user enforcement.
- **Account dashboard** — `/akun`, `/akun/billing`, `/akun/history`.

**Operations and admin**
- **Admin panel** — `/admin` with five modules: users, attempts (questions), subscriptions, orders, vouchers. Role-gated by the `Role` enum on `User`.
- **Region pin** — `vercel.json` pins compute to `sin1` for co-location with the Singapore Supabase project.
- **Loading skeletons everywhere** — every account, admin, and result route ships a `loading.tsx` that mirrors the final layout for sub-100ms perceived response.

**Polish**
- **Bilingual UI** — Indonesian (default) and English, cookie-driven, server-side resolved, with `<html lang>` and `theme-color` switching.
- **Light and dark mode** — `next-themes` preference, persisted in `localStorage`, accessible toggle in the header.
- **Streaming responses** — Server-Sent Events from a 9router-compatible OpenAI endpoint, surfaced in the tutor UI as character-by-character markdown.
- **Markdown rendering** — `react-markdown` with GitHub-flavoured Markdown and Tailwind Typography for tutor output.
- **Server-side rate limiting** — five user messages per question per attempt; daily tutor cap by plan; voucher quota integrity.

## Architecture

```
Browser (Server Components do data, Client Components do interactions)
   |
   |  POST /api/explain/[questionId]   (SSE)
   |  POST /api/insight/[attemptId]    (background)
   |  POST /api/billing/checkout
   |  POST /api/share/result
   |  POST /api/billing/webhook         (Midtrans -> us)
   v
Next.js Route Handler (Node runtime, region=sin1)
   |    - Supabase auth (user OR cita_anon_id cookie)
   |    - Locale detection (cita_locale)
   |    - Plan resolution + per-plan quota check
   |    - Voucher validation
   |    - Tutor: 5-message per-attempt + plan daily cap
   |    - Persist user message
   |
   +--> Supabase Postgres (Prisma client, service-role server-only)
   |
   +--> 9router (OpenAI-compatible)
   |       kr/claude-haiku-4.5  (default tutor + insight model)
   |    SSE stream
   |
   +--> Midtrans Snap (sandbox) — checkout + webhook
```

Server Components (`page.tsx` files in the App Router) are the data-loading boundary. Client Components (`"use client"`) own only the interactive surface — chat input, theme toggle, locale toggle, share modal, voucher input, snap loader. Data crosses the boundary as plain serialisable values; no functions, classes, or `Map` instances are passed as props (a class of bug worth a dedicated section in any RSC project).

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) | RSC, server actions, route handlers |
| Language | TypeScript 5 | Strict mode |
| Styling | Tailwind CSS v4 | `@plugin "@tailwindcss/typography"` for tutor output |
| UI primitives | shadcn/ui (Radix) | Accessible buttons, dialogs, badges |
| Theme | `next-themes` 0.4 | `class` attribute strategy, no flash |
| Database | Postgres on Supabase | RLS active for user-scoped reads |
| ORM | Prisma 6 | Schema, migrations, Prisma client at runtime |
| Auth | Supabase magic-link OR `cita_anon_id` cookie | Dual-auth across all owner-bound routes |
| LLM gateway | 9router (OpenAI-compatible) | Streamed SSE proxy |
| Billing | Midtrans (sandbox) | Snap checkout + signature-validated webhook |
| OG image | `next/og` (Satori) | 1200×630 dynamic share cards |
| Markdown | `react-markdown` + `remark-gfm` | Rendered with `prose-invert` |
| Hosting | Vercel | Region pinned to `sin1` via `vercel.json` |
| Package manager | pnpm 11 | `pnpm-lock.yaml` checked in |

## Repository structure

```
cita/
├── prisma/
│   ├── schema.prisma                       # Source of truth — 14 models
│   ├── migrations/
│   │   ├── 0001_init.sql                   # Initial users / questions / attempts / attempt_items
│   │   ├── 0002_rls_policies.sql           # RLS policies
│   │   └── 0003_explainer_messages.sql     # Tutor chat persistence
│   └── seed-data/
│       └── questions.json                  # Seed payload
├── public/                                 # Logo, favicons, assets
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout + theme + i18n bootstrap
│   │   ├── globals.css                     # Tailwind v4 + design tokens
│   │   ├── page.tsx                        # Landing
│   │   ├── about/                          # About page (maker section)
│   │   ├── pricing/                        # Pricing tiers + roadmap
│   │   ├── checkout/                       # Midtrans Snap initiation
│   │   ├── persyaratan/                    # Document and eligibility info
│   │   ├── privacy/  terms/                # Legal
│   │   ├── leaderboard/                    # Anonymous top-ten
│   │   ├── auth/login/  auth/check-email/  # Magic-link flow
│   │   ├── akun/                           # Account home
│   │   ├── akun/history/                   # Tryout history with filters
│   │   ├── akun/billing/                   # Plan, orders, voucher status
│   │   ├── admin/                          # Admin panel (5 modules)
│   │   │   ├── analytics/  users/  vouchers/
│   │   │   ├── subscriptions/  orders/
│   │   ├── tryout/
│   │   │   ├── page.tsx                    # Briefing
│   │   │   ├── actions.ts                  # start, submit, save answer
│   │   │   ├── [attemptId]/                # Tryout flow
│   │   │   │   ├── tryout-client.tsx       # Client interaction surface
│   │   │   │   └── result/                 # Score + filter + CSV + share
│   │   │   │       └── result-item-list.tsx
│   │   ├── study/[attemptId]/[questionId]/ # Tutor split-pane
│   │   ├── r/[shareId]/                    # Public share page
│   │   └── api/
│   │       ├── explain/[questionId]/       # Tutor SSE proxy
│   │       ├── insight/[attemptId]/        # Insight generation
│   │       ├── billing/checkout/           # Midtrans Snap initiation
│   │       ├── billing/webhook/            # Midtrans signature-validated webhook
│   │       ├── billing/cancel/             # Cancel subscription
│   │       ├── billing/voucher/check/      # Real-time voucher validation
│   │       ├── share/result/               # Create / update / revoke share
│   │       ├── og/                         # Static OG generator (root)
│   │       ├── og/result/[shareId]/        # Dynamic OG for share card
│   │       ├── health/db/                  # DB health probe
│   │       └── debug/auth/                 # Auth state probe
│   ├── components/
│   │   ├── brand/  layout/  ui/            # Logo, header, footer, shadcn primitives
│   │   ├── billing/                        # Pricing section, snap loader, voucher input
│   │   ├── share/share-modal.tsx           # Lazy-create share + Web Share API
│   │   ├── report/report-button.tsx        # Per-question mailto trigger
│   │   └── theme-provider.tsx  theme-toggle.tsx  locale-toggle.tsx
│   ├── lib/
│   │   ├── i18n.ts                         # id + en dictionaries
│   │   ├── tutor.ts                        # System prompt builder
│   │   ├── insight/generate.ts             # Personalised insight pipeline
│   │   ├── billing/                        # plans, entitlements, midtrans, vouchers, usage
│   │   ├── share/result-share.ts           # Share id mint + lookup
│   │   ├── auth/get-user.ts  actions.ts    # Dual-auth helper + magic-link actions
│   │   ├── tryout/config.ts                # Mode config (MINI / FULL totals + duration)
│   │   ├── db/prisma.ts                    # Prisma singleton
│   │   └── utils.ts
│   ├── proxy.ts                            # Anonymous-cookie issuance + Supabase session refresh
│   └── utils/supabase/                     # client / server / admin / middleware
├── docs/
│   └── BACKLOG.md                          # Defer log with explicit re-trigger conditions
├── vercel.json                             # Region pin: sin1
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 LTS or later
- pnpm 11
- A Supabase project (free tier is sufficient)
- An OpenAI-compatible LLM endpoint (we use 9router; any compatible gateway works)
- A Midtrans sandbox account if you intend to exercise billing flows

### Local development

```bash
git clone https://github.com/putramkti/cita.git
cd cita
pnpm install
cp .env.example .env.local
# fill in the values described under "Environment variables" below
pnpm dev
```

The development server starts on [http://localhost:3000](http://localhost:3000).

### Database setup

Run the three SQL migrations in order against your Supabase project. The fastest path is the SQL editor:

1. Open `https://supabase.com/dashboard/project/<ref>/sql/new`.
2. Paste `prisma/migrations/0001_init.sql`, run.
3. Repeat for `0002_rls_policies.sql` and `0003_explainer_messages.sql`.

Then sync the Prisma-managed schema additions (subscriptions, vouchers, share, insight columns, etc.):

```bash
pnpm exec prisma db push
```

This applies the post-init schema to your project without producing additional migration files. For a fresh project, `prisma db push` alone is sufficient.

### Environment variables

Populate `.env.local` with the following keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable anon JWT>
SUPABASE_SERVICE_ROLE_KEY=<service role JWT — server only>

# Postgres (use the Supavisor pooler — the direct port 5432 endpoint is IPv6-only and fails from many serverless edges)
DATABASE_URL=postgres://...:6543/postgres?...
DIRECT_URL=postgres://...:6543/postgres?...

# LLM gateway (OpenAI-compatible)
EXPLAINER_API_BASE=https://your-9router.example.com/v1
EXPLAINER_API_KEY=<key>
EXPLAINER_MODEL=kr/claude-haiku-4.5

# Optional separate model for insight; defaults to EXPLAINER_MODEL
INSIGHT_MODEL=kr/claude-haiku-4.5

# Midtrans (sandbox by default)
MIDTRANS_SERVER_KEY=<sandbox server key>
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<sandbox client key>
MIDTRANS_IS_PRODUCTION=false

# Site origin for magic-link callbacks, OG image absolute URLs, and Midtrans return URL
# Required in production; localhost is inferred in development
NEXT_PUBLIC_SITE_URL=https://cita-cpns.vercel.app
NEXT_PUBLIC_APP_URL=https://cita-cpns.vercel.app
```

`SUPABASE_SERVICE_ROLE_KEY` is referenced only inside server-only modules (`src/utils/supabase/admin.ts`, route handlers, server components). It is never imported by anything that ships to the browser.

## Authentication

Cita has two simultaneous auth modes:

- **Authenticated user.** Supabase magic link delivered by email. Signing in promotes the existing anonymous session to a Supabase user record so prior attempts are preserved.
- **Anonymous viewer.** A long-lived `cita_anon_id` cookie issued by `src/proxy.ts` (Next.js middleware). Sufficient to run tryouts, save results, chat with the tutor (subject to the anonymous daily quota), and create a share link.

Every owner-bound route checks both, accepting either a logged-in user OR the matching anon cookie. Mixed flows (start anon, sign up later) are explicitly supported — the `User` row is created on the first authenticated request and adopts the existing anonymous attempts.

The magic-link redirect host is derived per request from `x-forwarded-host` to support multi-environment deployments (production + preview branches) sharing a single Supabase project. Configure your Supabase **Site URL** and **Redirect URLs** in the auth dashboard to allow each environment's hostname.

## Billing and subscriptions

Two plans are exposed: `FREE` (default for any signed-in user) and `PREMIUM`. The `Subscription` model holds the user's plan, status (`ACTIVE` / `CANCELLED` / `EXPIRED`), and validity window. All quotas are resolved through `src/lib/billing/plans.ts → quota(plan, key)` so a single change updates every gate.

**Checkout flow.**

1. Authenticated user posts to `POST /api/billing/checkout` with an optional voucher code.
2. Server resolves the price (`Rp 50,000` for monthly Premium), validates the voucher if provided, and either:
   - **100%-off voucher path** — bypasses Midtrans, immediately activates the subscription, returns `{ free: true, redirectUrl: "/akun/billing?status=success" }`.
   - **Standard path** — calls Midtrans Snap to mint a transaction token, persists an `Order` row, returns the token to the client.
3. The client mounts the Snap iframe (loaded once globally from `src/components/billing/midtrans-snap-script.tsx`) and the user completes payment.
4. Midtrans calls `POST /api/billing/webhook` with the result. The handler validates the SHA-512 signature, reconciles the order, activates the subscription on `settlement` / `capture`, marks failed orders, and is idempotent against retries.

**Cancel flow.** `POST /api/billing/cancel` flips the subscription to `CANCELLED` while preserving the validity window — the user retains Premium access until the period ends, then transitions to `EXPIRED` on the next plan resolution.

The Midtrans server key is sandbox-only by default. Switch `MIDTRANS_IS_PRODUCTION=true` in production once a Midtrans production account is provisioned.

## Voucher system

Vouchers are administered from `/admin/vouchers` and applied at checkout. Each `Voucher` has:

- `code` (unique, immutable post-creation)
- `discountPercent` (1–100; 100 = bypass Midtrans)
- `maxRedemptions` (cap across all users) and `maxPerUser` (default 1)
- Optional `validFrom` / `validUntil` window
- `status` (`ACTIVE` / `DISABLED`)

`POST /api/billing/voucher/check` validates a code in real time during checkout. Each successful redemption writes a `VoucherRedemption` row with the actual amount discounted. Slot reservation policy is *quota integrity over UX convenience* — concurrent attempts to redeem the last available slot will fail one of them rather than oversell.

## Cita Tutor (AI chat)

The tutor is the centrepiece feature. It runs at `/study/[attemptId]/[questionId]` and is available immediately after submitting a tryout (or any time the user wants to revisit a question post-submit).

**Flow.**

1. The server component fetches the attempt, attempt item, existing chat history, and the user's plan + remaining tutor quota for the day.
2. The server component renders a sticky question recap on the left and the `TutorChat` client component on the right with `initialUserMsgCount` and `maxUserMsgs` derived from the plan-aware quota check (`src/lib/billing/usage.ts → checkTutorQuota`).
3. When the user sends a message, the client posts to `POST /api/explain/[questionId]`.
4. The route handler validates ownership, checks per-plan daily quota, persists the user message, builds a fresh system prompt (`src/lib/tutor.ts`), and proxies a streaming chat completion via SSE.
5. As deltas arrive, they are relayed to the client. The client appends each delta to the active assistant bubble and re-renders markdown.
6. On completion the assistant message is persisted alongside its token counts and the daily usage counter (`TutorUsage` row keyed by user + day) is incremented.

**Plan-aware quotas.**

| Plan | Daily tutor messages |
| --- | --- |
| Anonymous | 5 |
| Free | 5 |
| Premium | 50 |

**Persistence.** All messages live in `ExplainerMessage` with a foreign key to the `AttemptItem` and a CASCADE delete relationship.

## Personalised insight

Premium subscribers receive a personalised insight report immediately after submitting a tryout. The report is generated server-side and persisted on the `Attempt` row (`aiInsight`, `insightStatus`, `insightAt`).

**Pipeline.**

1. The result page detects the user is Premium and the insight has not been generated yet.
2. A background `POST /api/insight/[attemptId]` is fired.
3. `src/lib/insight/generate.ts` builds a structured prompt that includes per-subcategory hit/miss counts, difficulty distribution of misses, and the user's overall score percentile, then calls `INSIGHT_MODEL` (default `kr/claude-haiku-4.5`) for a structured JSON response.
4. The response is validated, persisted, and surfaced on the result page in a card with strengths, areas to drill, and concrete next-step actions.

Anonymous and Free users see a blurred preview of the insight section with a CTA to upgrade — the data path is correctly gated server-side; the blur is purely a UX surface, not a security boundary.

## Result share with dynamic OG

Every submitted attempt can be made public via a short, opaque share id (8 characters, ambiguous-character-stripped alphabet). The flow is lazy: nothing is created until the user opens the share modal.

- **Share modal** — `src/components/share/share-modal.tsx` lazily POSTs to `/api/share/result` on first open, exposes a privacy toggle (`showName`, default off), the live URL, copy/clipboard, and three quick targets (Web Share API, WhatsApp, X / Twitter).
- **Public page** — `/r/[shareId]` is a read-only RSC. `noindex, nofollow` to keep the data out of search engines, but rich OG metadata so direct shares preview properly.
- **Dynamic OG** — `/api/og/result/[shareId]` produces a 1200×630 image via `next/og` with cream gradient, score, breakdown per subtest, optional display name, mode, date, and a passing-status chip when applicable. CDN-cached for five minutes.
- **Soft revoke** — share rows have a `revokedAt` column. Revoked shares 404 publicly while preserving the underlying record for audit.

## Admin panel

The `/admin/*` routes are gated by the `Role` enum on `User` (`REGISTERED` / `ADMIN`). Only admins can read or mutate. Five modules:

- **Users** — list, view, edit role, view linked attempts.
- **Questions** — list, search, view full content with options and weights.
- **Attempts** — list with filters, view detail.
- **Subscriptions** — list with plan + status filters, view history per user.
- **Orders** — list with payment status, view raw Midtrans payload.
- **Vouchers** — full CRUD with redemption telemetry.

## Internationalisation

Cita ships with two locales: Indonesian (`id`, default) and English (`en`).

- **Storage.** A long-lived `cita_locale` cookie persists the choice. Server components read it via `getDict()` in `src/lib/i18n.ts`.
- **Switching.** The `LocaleToggle` component writes the cookie and triggers `router.refresh()`.
- **Scope.** Only UI chrome is translated. Question content remains in Indonesian — it is the actual exam material — and the tutor translates inline when the locale is `en`.
- **Tone convention.** Product copy and user-facing UI use the formal "Anda" register. Marketing-adjacent surfaces such as the maker section use a personable register. Public-facing artefacts (privacy, terms, disclaimers) use neutral professional tone with no decorative emoji.
- **Type safety.** `Dict` is derived from the dictionary record so missing keys fail at compile time.

## Theming

Theme switching uses `next-themes` with the `class` attribute strategy. The provider is mounted in the root layout with `suppressHydrationWarning`.

- **Default.** Light mode.
- **Toggle.** Sun/moon button in the header.
- **Storage.** `localStorage`, key `theme`.
- **Tokens.** Design tokens live in `src/app/globals.css` and are referenced via Tailwind CSS variables.

A `theme-color` meta tag is emitted with both `light` and `dark` `prefers-color-scheme` media queries so the mobile chrome bar matches.

## Data model

Fourteen models. Highlights:

- **`User`** — promoted from anonymous on first auth; carries `displayName`, `role` (`REGISTERED` / `ADMIN`), and links to `Subscription`, `Attempt`, `Order`, `VoucherRedemption`.
- **`ItemFamily` / `EnemyGroup`** — question groupings used for hit-set diversity (rotate questions across attempts) and similarity-based item selection.
- **`Question`** — human-readable id (`PANCASILA_BUNYI_SILA1_001`), with `category`, `subcategory`, `topic`, `tags`, `difficulty`, optional `imagePrompt`, and a `status` enum (`DRAFT` / `READY`).
- **`QuestionImage`** — generated illustration assets with provider attribution.
- **`Attempt`** — `mode` (`MINI` / `FULL`), per-subtest scores (`scoreTWK`, `scoreTIU`, `scoreTKP`), `passingStatus`, `aiInsight` (JSON), `insightStatus`, `insightAt`.
- **`AttemptItem`** — links a `Question` to an `Attempt` with `userAnswer`, `isCorrect`, `scoreEarned`.
- **`ExplainerMessage`** — tutor chat persistence with token counts.
- **`Subscription`** — plan, status, validity window.
- **`Order`** — Midtrans transactions with idempotent webhook reconciliation; carries `voucherCode`, `voucherDiscount`, `originalAmount` for redemption traceability.
- **`TutorUsage`** — daily usage counter keyed by user + day.
- **`Voucher` / `VoucherRedemption`** — voucher definitions and redemption log with `amountDiscounted`.
- **`ResultShare`** — public share id, `showName` flag, `revokedAt` for soft-delete.

Indexes are placed on every foreign key plus compound indexes for the high-frequency lookups (`attempt_id + created_at` on chat retrieval; `user_id + day` on tutor usage; `share_id` unique on share lookup).

## Security model

- **Service-role key isolation.** `SUPABASE_SERVICE_ROLE_KEY` is referenced only inside server-only modules. Importing it from a client component triggers a build error via Next.js's server-only marker.
- **Dual auth on every owner-bound route.** Either a Supabase user OR the matching `cita_anon_id` cookie. Anonymous users can't impersonate authed users (and vice versa) because the lookup keys differ.
- **Plan-aware server-side gates.** Tutor quota, insight access, and share permissions are all resolved server-side. The blur overlay on insight is a UX hint, not a boundary.
- **Voucher integrity.** Redemption is transactional (Postgres-level) so concurrent users cannot oversell a voucher's `maxRedemptions`. Code is immutable post-creation.
- **Webhook signature.** Midtrans signature is validated using the SHA-512 scheme (`order_id + status_code + gross_amount + server_key`) before any state mutation.
- **RLS posture.** Tables have permissive RLS for routes that go via the service role; user-scoped reads (e.g. share lookup, account history) tighten predicates to `auth.uid() = user_id` or anon-cookie equivalence.
- **Cookie scope.** The `cita_anon_id` cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, 1-year max-age.
- **Input validation.** Tutor input is sanitised (`sanitizeUserInput`): stripped control characters, normalised whitespace, length-capped to 500 characters.
- **Rate limit.** Five tutor messages per question per attempt **and** the per-day plan cap. Both run before any LLM call.
- **CORS.** The route handlers do not enable cross-origin posting; same-origin only, which the cookie-based auth already requires.
- **Secret management.** No secrets are committed; `.env.local` is gitignored, `.env.example` ships sanitised placeholders only.
- **Public share posture.** The `/r/[shareId]` page is `noindex, nofollow`. No personally identifiable data is rendered unless the user explicitly opts in via `showName`.

## Deployment

Cita is deployed on Vercel. The production project is named `cita`; the staging/preview project (matching git branches) is `cita-lab`.

```bash
# Install Vercel CLI once
pnpm add -g vercel

# Link the working tree to a Vercel project
vercel link --project=cita

# Deploy to production
vercel --prod --yes
```

**Project settings.**

- Framework preset: Next.js
- Build command: `pnpm build` (runs `prisma generate && next build`)
- Region: `sin1` (set in `vercel.json` so it survives a project re-link)
- Node runtime: 24.x

**Environment variables.** Set every variable from the [Environment variables](#environment-variables) section in the Vercel dashboard. `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` should point at the deployed origin (e.g. `https://cita-cpns.vercel.app`).

**Webhook configuration.** In the Midtrans dashboard, set the **Payment Notification URL** to `https://<your-domain>/api/billing/webhook`. The handler is signature-validated and idempotent.

**Custom domain.** Bind a custom domain in the Vercel dashboard and update `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` accordingly. Update Supabase **Site URL** and **Redirect URLs** so magic-link emails point at the right origin.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the dev server with Turbopack on port 3000 |
| `pnpm build` | Production build (`prisma generate && next build`) |
| `pnpm start` | Start the production server locally after `pnpm build` |
| `pnpm lint` | ESLint with the Next.js plugin |
| `pnpm exec tsc --noEmit` | Standalone type-check |
| `pnpm exec prisma db push` | Sync schema to the database without a migration file |
| `pnpm exec prisma generate` | Regenerate the Prisma client |
| `pnpm exec prisma studio` | Browse the DB through Prisma Studio |
| `vercel --prod --yes` | Promote a deployment to production |

## Quality and testing

- **Type checking.** `tsc --noEmit` runs as part of the production build.
- **Linting.** ESLint with the official Next.js config.
- **Build verification.** Every commit to a deploy branch is followed by a `pnpm build` to catch RSC-boundary errors that the type checker cannot detect.
- **Smoke tests.** Critical paths (`/`, `/tryout`, `/study/...`, `/checkout`, `/admin`, `/api/share/result`, `/r/<id>`) are smoke-tested with `curl` after each production deploy to confirm a 200 response and expected content.
- **End-to-end testing.** Playwright suites are planned (see `docs/BACKLOG.md`).

## Performance

- **Region pin.** `sin1` co-locates compute with the Singapore Supabase project. The pre-pin baseline (`iad1`) measured 2,500–7,000ms warm latency on chained Postgres reads; the post-pin baseline measures 80–540ms across the same routes — a 10–60× speedup with no application code change.
- **Streaming-first tutor.** The chat endpoint streams tokens via SSE; the user sees the first character within roughly one second of submission.
- **No client-side data fetching for protected content.** Attempt and question data are loaded on the server, eliminating waterfall round trips.
- **System fonts.** No webfont download; first paint is immediate.
- **Loading skeletons that mirror real layout.** Account, admin, and result routes ship a `loading.tsx` so perceived response stays well under 100ms even on cold lambdas.
- **OG image CDN cache.** The dynamic share OG carries `s-maxage=300` so re-shared links don't repeatedly hit the DB.

## Accessibility

- **Keyboard navigation.** All interactive elements are reachable and operable via keyboard.
- **Color contrast.** Wening palette tokens were checked against WCAG AA at common foreground/background pairs.
- **Form semantics.** Tutor input is a `<textarea>` with `placeholder` text appropriate to state, plus an explicit `<button type="submit">` for screen readers.
- **Aria labels.** Toggles emit `aria-label` strings that change with locale.
- **Reduced motion.** Streaming animations rely on plain text appending rather than CSS keyframes, so users with `prefers-reduced-motion` see the same content without artefacts.

Full WCAG validation (with assistive technology testing) is part of the roadmap.

## Roadmap

A dedicated [`docs/BACKLOG.md`](docs/BACKLOG.md) tracks every deferred item with an explicit re-trigger condition. Highlights:

- **Pre-launch (in progress).** PROD migration prep, branded error pages, custom domain provisioning, transactional email via Resend, forgot-password flow, email verification.
- **Polish.** Landing hero rewrite, structured data and dynamic sitemap, `persyaratan` content fill.
- **Post-launch.** Targeted-drill subscription upsell, anonymous opt-in analytics, mobile PWA wrapper, public API surface for educators, Indonesian regional language support.

## Contributing

Contributions are welcome.

1. Open an issue describing the bug or proposal.
2. Fork the repository, create a feature branch (`feat/...` or `fix/...`).
3. Run `pnpm lint && pnpm build` locally.
4. Open a pull request that explains the change and links the issue.

Conventional Commits is the preferred commit-message format. Merge commits are preferred over squash for multi-stream features so the per-stream history stays bisectable; squash is fine for one- or two-commit fixes.

For larger architectural changes, please open an RFC issue first.

## License

MIT — see [LICENSE](LICENSE) (to be added).

## Acknowledgements

- The shadcn/ui team for accessible Radix-based primitives.
- The Next.js team for the App Router, the streaming primitives, and `next/og`.
- Supabase for a Postgres experience that scales from anonymous tryouts to authenticated history.
- The 9router maintainers for an OpenAI-compatible streaming gateway.
- Midtrans for a sandbox that genuinely behaves like production.
- The Indonesian civil-service exam community for openly published study material that informed the question taxonomy.

## Disclaimer

Cita is an independent practice platform. It is **not affiliated with, endorsed by, or operated on behalf of** Badan Kepegawaian Negara (BKN), Kementerian PANRB, or any official Indonesian government agency. Question content is derived from openly available study material and is intended for practice only; it is not an official representation of any current or upcoming SKD CPNS examination. Users should always consult primary BKN materials for authoritative test specifications and current schedules.
