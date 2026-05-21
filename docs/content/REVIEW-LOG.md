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

## Target Phase 1

| Kategori | Target | Done draft | Approved |
|---|---|---|---|
| TWK Pancasila | 18 | 15 | 0 |
| TWK UUD 1945 | 18 | 0 | 0 |
| TWK NKRI | 14 | 0 | 0 |
| TWK Bhinneka | 12 | 0 | 0 |
| TWK Sejarah | 8 | 0 | 0 |
| TIU Verbal | 24 | 0 | 0 |
| TIU Numerik | 28 | 0 | 0 |
| TIU Figural | 18 | 0 | 0 |
| TKP Pelayanan | 12 | 0 | 0 |
| TKP Profesi | 12 | 0 | 0 |
| TKP Jejaring | 12 | 0 | 0 |
| TKP Sosbud | 12 | 0 | 0 |
| TKP Antikorupsi | 12 | 0 | 0 |
| **Total** | **200** | **15** | **0** |

## Batches

| # | Topik | File | Status | Reviewed at |
|---|---|---|---|---|
| 001 | TWK Pancasila | `drafts/batch-001-twk-pancasila.md` | draft | - |

## Cadence

- Target reviewer: 15 soal/batch
- Frekuensi: lo review saat sempat, gw queue batch berikutnya saat lo bilang lanjut
- Tidak ada deadline keras — ritme follow lo

## Catatan workflow

1. gw riset → tulis di `research/<topik>.md`
2. gw generate batch → tulis di `drafts/batch-XXX-<topik>.md`
3. lo review markdown → tandai accept/edit/reject per soal
4. gw apply edit → batch siap
5. saat schema + admin UI siap → consolidate ke `approved/<topik>.json`
6. import ke DB → published

## Constraint mode brainstorm/draft

- ❌ NO production touch
- ❌ NO database touch
- ❌ NO Vercel deploy
- ❌ NO merge ke `main` atau `redesign/v2`
- ✅ File-only di branch `content/cpns-bank-v1`
