# BACKLOG — Future Polish & Deferred Items

Sumber tunggal kebenaran untuk item yang sengaja di-defer dari fase aktif.
Aturan: setiap item harus punya alasan kenapa di-defer + tanda kapan harus
diangkat lagi (trigger). Hapus dari sini saat sudah ship.

Last updated: 2026-05-22

---

## A. Share feature follow-ups

| # | Item | Alasan defer | Trigger angkat |
|---|------|--------------|----------------|
| A1 | Revoke share link button di `/akun/history` per row | Nice-to-have. User bisa kontak admin manual untuk revoke. | Saat ada user request konkret atau ≥3 share dilaporkan abuse |
| A2 | PNG download untuk Instagram story (1080x1920) | Butuh canvas client-side render +1.5 jam. Lazy share via URL sudah cukup untuk launch. | Saat traffic IG share terbukti tinggi (analytics Phase 11) |
| A3 | Sitemap exclude rule untuk `/r/*` | `noindex, nofollow` sudah cukup buat Google. | Saat kita lihat `/r/*` muncul di Search Console |
| A4 | Track share-click analytics (event berapa kali link diklik) | Butuh PostHog/Plausible setup di Phase 11. | Setelah analytics tooling Phase 11 live |
| A5 | Multiple template card style (gradient bold, illustrated) | Spec lock minimalist Cita dulu. | User feedback minta variasi visual |
| A6 | "Top X% pengguna minggu ini" badge di share card | Butuh leaderboard query + percentile compute infra. | Saat leaderboard scoring stabil |

---

## B. Report feature follow-ups

| # | Item | Alasan defer | Trigger angkat |
|---|------|--------------|----------------|
| B1 | Server-side report endpoint via Resend (bukan mailto) | Butuh domain custom + Resend setup (Phase 9.3). | Saat domain live + Resend onboarded |
| B2 | DB persistence laporan + admin panel widget | Butuh schema `Report` + admin UI. Bukan blocker launch. | Saat volume report mailto >10/minggu |
| B3 | Auto-flag soal yang frequently reported | Butuh data dari B2 dulu. | Setelah B2 ship + data 1 bulan |

---

## C. Tutor follow-ups

| # | Item | Alasan defer | Trigger angkat |
|---|------|--------------|----------------|
| C1 | Client-side refetch quota di TutorChat untuk multi-tab consistency | Edge case (user buka 2 tab tutor sekaligus). | Saat ada laporan stale counter |

---

## D. Phase 9.2 — pre-launch prep (BELUM dieksekusi, masih queued)

Stream A & C dari diskusi roadmap, sengaja di-pause karena user pivot ke
report + share feature. Wajib selesai sebelum launch Juli 2026.

| # | Item | Estimasi | Status |
|---|------|----------|--------|
| D1 | PROD migration prep — `prisma migrate diff` SQL + rollback playbook di `docs/db-migrations.md` | 60 min | Queued |
| D2 | Branded `error.tsx` global + `not-found.tsx` polish | 60 min | Queued |

---

## E. Phase 9.3 — Email & Domain (BLOCKED)

Blocked menunggu user beli domain custom. Sebelum domain ready, ini
nggak bisa di-progress.

| # | Item | Status |
|---|------|--------|
| E1 | Beli domain (e.g. cita.id) | BLOCKED — user action |
| E2 | DNS setup Vercel | Blocked by E1 |
| E3 | Resend setup + verified sender | Blocked by E1 |

---

## F. Phase 9.4 — Auth polish

| # | Item | Estimasi |
|---|------|----------|
| F1 | Forgot password flow (Supabase magic link) | 90 min |
| F2 | Email verification on signup | 60 min |

---

## G. Phase 9.5 — Landing/SEO polish

| # | Item | Estimasi |
|---|------|----------|
| G1 | Landing hero rewrite + social proof | 60 min |
| G2 | SEO foundation (structured data, sitemap.xml dynamic, robots.txt) | 90 min |
| G3 | `/persyaratan` content fill | 30 min |

---

## H. Phase 11+ — Post-launch

| # | Item | Why post-launch |
|---|------|-----------------|
| H1 | Targeted drill (R) — biggest Premium upsell | Need real attempt data first |
| H2 | Analytics (PostHog/Plausible) | Need actual traffic |
| H3 | Email marketing automation | Need user base + verified domain |
| H4 | Mobile app native (PWA → wrapper) | Need PMF signal |

---

## Convention

- Item mature ke active phase saat trigger terpenuhi.
- Item completed dipindah ke `docs/SHIPPED.md` (TODO: create).
- Setiap defer butuh trigger eksplisit, jangan vague "nanti".
