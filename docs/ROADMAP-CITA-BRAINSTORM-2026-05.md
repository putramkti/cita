# Roadmap Brainstorm — Cita

_Last updated: 2026-05-21_

## Context

Cita is currently a redesigned SKD CPNS tryout web app with:
- Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui
- Prisma 6 + Supabase + Vercel
- Anonymous-first tryout flow
- AI tutor per question (Claude Haiku 4.5 via 9router)
- Public landing, result analysis, bilingual chrome, CPNS timeline section

This document captures product brainstorming only — not approved scope.
Anything here may affect schema, auth, pricing, or production architecture,
but is still in exploration mode.

---

## Current brainstorming seeds from owner

1. Expand question bank to 1000+ items
2. Add question taxonomy (TWK / TIU / TKP + type)
3. Randomized but regulation-constrained tryout assembly
4. Avoid near-duplicate questions in one tryout
5. Build full SKD learning modules like an e-learning product
6. Add login (especially to gate chatbot)
7. Explore pricing based on AI tutor limits

---

## Product principles (proposed)

1. **Anonymous-first stays** for low-friction top-of-funnel
2. **AI tutor is premium-lever**, not the whole product
3. **Question quality beats quantity** — 200 strong items > 1000 weak items
4. **Structured learning + diagnostics** create retention
5. **CPNS cycle monetization** likely fits better than generic SaaS framing

---

## Recommended roadmap by phase

## Phase 1 — Assessment engine foundation

### Goal
Turn Cita from a static tryout demo into a replayable exam simulator.

### Features
1. Expand bank from 30 -> 200+ first, then 1000+
2. Add metadata per question:
   - category: TWK / TIU / TKP
   - subcategory
   - question_type
   - difficulty (1-5)
   - tags[]
   - source_quality
   - review_status
   - similarity_group / embedding
3. Build blueprint-based tryout generator:
   - example: 30 TWK, 30 TIU, 30 TKP
   - subcategory coverage constraints
   - no over-clustering by type
4. Add near-duplicate suppression:
   - exact duplicate prevention
   - same-attempt similarity suppression
   - recent-attempt similarity suppression per user
5. Add tryout history + progress tracking
6. Add weakness tracker by category/subcategory

### Why this matters
- raises replay value
- improves fairness and perceived intelligence
- creates foundation for premium analysis later

### Architecture ideas
- store question embeddings for semantic similarity checks
- maintain "selection recipe" snapshot on each attempt for auditability
- separate authoring status from publish status

---

## Phase 2 — Learning product expansion

### Goal
Move from exam simulator into guided preparation platform.

### Features
1. Learning modules by category:
   - TWK: Pancasila, UUD 1945, NKRI, Bhinneka, sejarah
   - TIU: verbal, numerik, figural, logika
   - TKP: pelayanan, profesionalisme, sosial budaya, jejaring kerja, dll.
2. Nested content structure:
   - module -> lesson -> micro quiz -> recap
3. AI tutor inside lesson pages
4. Lesson progress tracking
5. Bookmark / revisit difficult lessons
6. Daily challenge / streak

### Why this matters
- increases session frequency
- reduces dependence on pure tryout usage
- makes login and premium plans more justified

---

## Phase 3 — Monetization & identity

### Goal
Convert usage into revenue without killing top-of-funnel.

### Auth proposal
Hybrid model:
- anon users:
  - tryout
  - basic result page
  - limited tutor usage
- signed-in users:
  - chat history
  - cross-device progress
  - learning module progress
  - premium entitlements

### Login options
Preferred:
1. Google OAuth
2. email login fallback

### Pricing proposal
#### Free
- tryout access
- limited AI tutor
- limited learning module access
- basic analysis

#### Pro
- higher AI tutor quota
- full modules
- detailed item analysis
- PDF report
- priority / deeper tutor mode

### Pricing shape to test
1. Monthly subscription
2. CPNS-cycle pass (likely more attractive psychologically)
3. Bundle: monthly + one-time cycle pass

---

## Cross-cutting feature ideas

### High priority candidates
1. Adaptive difficulty / weakness targeting
2. Daily 5-question challenge
3. Shareable result card
4. PDF export
5. Telegram reminder / bot drip
6. Push notifications

### Medium priority candidates
1. Discussion per question
2. Bookmark hard questions
3. Public aggregate insight (e.g. many users miss this item)
4. Live leaderboard event / tournament
5. Voice tutor

### Later / experimental
1. SKB prep for top roles
2. Referral system
3. B2B / institutional licensing
4. Admin review workflow for question generation

---

## Question bank strategy

## Short version
Do **not** jump straight to 1000+ blindly.

### Recommended sequence
1. reach 200 high-quality reviewed questions
2. build taxonomy + generator + dedup logic
3. validate user experience
4. then scale to 1000+

### Content sourcing options
1. manual curation only
   - highest trust
   - slowest
2. LLM-assisted draft + human review
   - best balance
3. community submission
   - scalable but noisy
4. licensing / partner content
   - fastest if available, but requires budget and rights

### Recommended sourcing approach
LLM-assisted draft + strict review queue.

---

## Data model thoughts (brainstorm only)

Potential new fields / tables:

### questions
- category
- subcategory
- questionType
- difficulty
- tags
- explanationLong
- sourceReference
- reviewStatus
- publishedAt
- embedding
- similarityGroup

### attempts
- blueprintVersion
- generatorSeed
- questionSelectionMeta

### user_progress
- weakestCategories
- lessonProgress
- streakCount
- lastActiveAt

### subscriptions / entitlements
- plan
- tutorQuota
- expiresAt

### lessons / modules
- module
- lesson
- order
- contentMarkdown
- quizRefs

---

## Risks to watch

1. **Low-quality question scale**
   - bad bank destroys trust fast
2. **Tutor cost explosion**
   - pricing must map to quota carefully
3. **Auth friction too early**
   - can hurt growth if everything is locked
4. **Content maintenance burden**
   - modules need editorial consistency
5. **Overbuilding before demand validation**
   - avoid shipping 10 systems before confirming core retention

---

## Suggested execution order

### Option A — product-first
1. question bank to 200+
2. smart generator
3. progress tracking
4. login
5. pricing
6. learning modules

### Option B — content-first
1. learning modules
2. lesson tutor
3. login
4. pricing
5. question bank scale
6. adaptive generator

### My recommendation
Choose **Option A**.
Reason: replayable tryout engine is stronger foundation than content library at current stage.

---

## Strong recommendations

1. **Do 200 strong questions before 1000+**
2. **Design taxonomy before scaling content**
3. **Keep anon-first for tryout**
4. **Use login as upgrade path, not hard gate at first**
5. **Monetize on tutor depth + progress features + modules**
6. **Ship history/progress before advanced pricing**

---

## Open decisions for next session

1. Should login be soft-gated or hard-gated for tutor?
2. Which pricing model fits CPNS users best: monthly or cycle pass?
3. Is question sourcing manual, LLM-assisted, or hybrid?
4. Which should be built first after redesign review:
   - question engine
   - modules
   - login + pricing
5. How much reviewer bandwidth is available for content QA?

---

## Suggested next deep-dive topics

1. Question-bank schema + generator algorithm
2. Learning-module IA + UI flow
3. Auth + entitlement architecture
4. Pricing experiments + quota design
5. Admin workflow for question authoring / review
