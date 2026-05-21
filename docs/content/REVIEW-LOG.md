# Review Log — Cita CPNS Bank v1

Tracker untuk batch authoring SKD CPNS. Semua entri **draft only** sampai schema migration & admin UI siap.

## Konvensi

| Status | Arti |
|---|---|
| draft | Belum direview, masih di `drafts/` |
| reviewing | Sedang direview |
| accepted | Diterima full, siap consolidate |
| edit-needed | Reviewer minta edit |
| rejected | Ditolak, perlu replace |
| consolidated | Sudah dipindah ke `approved/*.json` |

## Target Phase 1 — STATUS: ✅ 200/200 DONE (draft)

| Kategori | Target | Done draft | Approved |
|---|---|---|---|
| TWK Pancasila | 18 | 18 | 0 |
| TWK UUD 1945 | 18 | 18 | 0 |
| TWK NKRI | 14 | 14 | 0 |
| TWK Bhinneka | 12 | 12 | 0 |
| TWK Sejarah | 8 | 8 | 0 |
| TIU Verbal | 24 | 24 | 0 |
| TIU Numerik | 28 | 28 | 0 |
| TIU Figural | 18 | 18 | 0 |
| TKP Pelayanan | 12 | 12 | 0 |
| TKP Jejaring | 12 | 12 | 0 |
| TKP Sosbud | 12 | 12 | 0 |
| TKP Profesionalisme | 12 | 12 | 0 |
| TKP TIK | 12 | 12 | 0 |
| **Total** | **200** | **200** | **0** |

> Catatan distribusi TWK: batch 001-005 = 64 soal (15+15+14+12+8). Batch 016 top-up 6 soal (3 Pancasila + 3 UUD) genapin Pancasila ke 18 dan UUD ke 18 sesuai target. Total TWK = 70.
> Catatan TKP: distribusi original "Antikorupsi" diganti jadi "TIK" sesuai pembagian Permenpan-RB resmi (5 sub-aspek: Pelayanan, Jejaring, Sosbud, Profesionalisme, TIK).

## Batches

| # | Topik | File | Soal | Status | Reviewed at |
|---|---|---|---|---|---|
| 001 | TWK Pancasila | `drafts/batch-001-twk-pancasila.md` | 15 | draft | - |
| 002 | TWK UUD 1945 | `drafts/batch-002-twk-uud1945.md` | 15 | draft | - |
| 003 | TWK NKRI | `drafts/batch-003-twk-nkri.md` | 14 | draft | - |
| 004 | TWK Bhinneka | `drafts/batch-004-twk-bhinneka.md` | 12 | draft | - |
| 005 | TWK Sejarah | `drafts/batch-005-twk-sejarah.md` | 8 | draft | - |
| 006 | TIU Verbal Part 1 | `drafts/batch-006-tiu-verbal-1.md` | 12 | draft | - |
| 007 | TIU Verbal Part 2 | `drafts/batch-007-tiu-verbal-2.md` | 12 | draft | - |
| 008 | TIU Numerik Part 1 | `drafts/batch-008-tiu-numerik-1.md` | 14 | draft | - |
| 009 | TIU Numerik Part 2 | `drafts/batch-009-tiu-numerik-2.md` | 14 | draft | - |
| 010 | TIU Figural | `drafts/batch-010-tiu-figural.md` | 18 | draft | - |
| 011 | TKP Pelayanan | `drafts/batch-011-tkp-pelayanan.md` | 12 | draft | - |
| 012 | TKP Jejaring | `drafts/batch-012-tkp-jejaring.md` | 12 | draft | - |
| 013 | TKP Sosbud | `drafts/batch-013-tkp-sosbud.md` | 12 | draft | - |
| 014 | TKP Profesionalisme | `drafts/batch-014-tkp-profesionalisme.md` | 12 | draft | - |
| 015 | TKP TIK | `drafts/batch-015-tkp-tik.md` | 12 | draft | - |
| 016 | TWK Top-up | `drafts/batch-016-twk-topup.md` | 6 | draft | - |

## Cadence

- Marathon authoring done in single session (2026-05-21)
- Reviewer (Dymux) review borongan di waktu yang lo pilih
- Tidak ada deadline keras — ritme follow lo

## Review workflow

1. Lo buka file batch satu per satu
2. Tiap soal ada checkbox `**[ ] Accept** / **[ ] Edit** / **[ ] Reject**`
3. Ubah `[ ]` jadi `[x]` untuk pilihan lo
4. Edit langsung di tempat untuk soal yang perlu revisi
5. Tag `<!-- REJECTED -->` di atas soal yang di-reject + alasan singkat
6. Setelah semua review: gw consolidate ke approved + bikin converter script

## Pending issues

Lihat `DEFERRED.md` — termasuk:
- Batch 009 soal 9 dan 11: ada opsi duplikat, perlu salah satu diganti

## Constraint mode brainstorm/draft

- ❌ NO production touch
- ❌ NO database touch
- ❌ NO Vercel deploy
- ❌ NO merge ke `main` atau `redesign/v2`
- ✅ File-only di branch `content/cpns-bank-v1`
