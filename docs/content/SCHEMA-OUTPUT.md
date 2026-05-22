# Schema Output — Markdown → JSON Converter

Dokumentasi format JSON yang dihasilkan converter dari markdown drafts. JSON ini adalah **intermediate format** sebelum di-import ke DB.

## Pipeline

```
docs/content/drafts/batch-XXX.md
  ↓
scripts/content-to-json.ts
  ↓
docs/content/approved/batch-XXX.json   (atau /tmp/cita-content-build/)
  ↓
[future] scripts/seed-questions.ts → DB
```

## File output

Per batch markdown menghasilkan 1 JSON file dengan structure:

```jsonc
{
  "batch_id": "batch-001",
  "topic": "TWK Pancasila",
  "source_file": "docs/content/drafts/batch-001-twk-pancasila.md",
  "generated_at": "2026-05-21T10:00:00Z",
  "stats": {
    "total_soal": 15,
    "by_difficulty": { "1": 0, "2": 5, "3": 7, "4": 3, "5": 0 }
  },
  "questions": [
    {
      "id": "PANCASILA_BUNYI_SILA1_001",
      "category": "TWK",
      "subcategory": "Pancasila",
      "topic": "Sila ke-1",
      "questionText": "Bunyi sila pertama Pancasila adalah...",
      "options": [
        { "label": "A", "text": "Kemanusiaan yang adil dan beradab" },
        { "label": "B", "text": "Ketuhanan Yang Maha Esa" },
        { "label": "C", "text": "Persatuan Indonesia" },
        { "label": "D", "text": "Kerakyatan yang dipimpin..." },
        { "label": "E", "text": "Keadilan sosial..." }
      ],
      "correctAnswer": "B",
      "optionWeights": null,
      "difficulty": 2,
      "tags": ["twk", "pancasila", "sila-1", "bunyi"],
      "familyId": null,
      "enemyGroupId": "PANCASILA_BUNYI_SILA1",
      "imagePrompt": null,
      "explanation": "Sila pertama berbunyi 'Ketuhanan Yang Maha Esa'...",
      "explanationLong": "Sila pertama Pancasila yang berbunyi 'Ketuhanan Yang Maha Esa'...",
      "source": "Pancasila — bunyi resmi Tap MPRS XX/MPRS/1966"
    }
  ]
}
```

## TKP-specific (optionWeights present)

Untuk TKP, field berbeda:

```jsonc
{
  "id": "TKP_PELAYANAN_LANSIA_001",
  "category": "TKP",
  "subcategory": "Pelayanan Publik",
  "topic": "Pelayanan / Lansia",
  "correctAnswer": null,
  "optionWeights": {
    "A": 3, "B": 5, "C": 2, "D": 1, "E": 4
  },
  "difficulty": 2,
  ...
}
```

## TIU Figural-specific (imagePrompt present)

```jsonc
{
  "id": "TIU_FIGURAL_ROTASI_001",
  "category": "TIU",
  "subcategory": "Figural",
  "topic": "Analogi / Rotasi",
  "imagePrompt": "Layout: row of 4 cells with arrow A:B = C:?\nCell 1 (A): equilateral triangle pointing up...",
  ...
}
```

## Markdown parsing rules

Converter mendeteksi field dengan regex pattern berikut (case-sensitive):

| Markdown line | JSON field | Notes |
|---|---|---|
| `**Kategori:** TWK / Pancasila / Sila ke-1` | `category`, `subcategory`, `topic` | split by ` / ` |
| `**Difficulty:** ② medium` | `difficulty` (int 1-5) | parse ① ② ③ ④ ⑤ |
| `**Tag:** \`twk\`, \`pancasila\`` | `tags[]` | strip backticks, comma-split |
| `**Family:** TIU_NUM_FAMILY` | `familyId` | `-` artinya null |
| `**Enemy group candidate:** X` | `enemyGroupId` | `-` artinya null |
| Heading `## Soal N` + `### Stem` | `questionText` | full block sampai `### Opsi` |
| `### Opsi` block | `options[]` + `correctAnswer` (atau `optionWeights` untuk TKP) | parse `- A. text ✅` untuk correct |
| `### Penjelasan singkat` block | `explanation` | sampai `### Penjelasan panjang` |
| `### Penjelasan panjang` block | `explanationLong` | sampai `### Sumber` |
| `### Sumber` block | `source` | string |
| ` ```image_prompt` block | `imagePrompt` | TIU Figural only |
| `*(skor 5)*` di opsi | `optionWeights[label]` | TKP only |

## Detection: TKP vs TWK/TIU

Converter mendeteksi tipe soal dari kategori:
- `category=TKP` → expect `*(skor N)*` annotations di tiap opsi → output `optionWeights`
- `category=TWK|TIU` → expect `✅` marker di salah satu opsi → output `correctAnswer`

## ID generation

Kalau soal udah punya enemy group candidate → ID = `<ENEMY_GROUP>_<SEQ>` (e.g. `PANCASILA_BUNYI_SILA1_001`).
Kalau gak ada enemy group → fallback ID = `<CATEGORY>_<SUBCATEGORY>_<BATCH_NUM>_<SOAL_NUM>` (e.g. `TWK_PANCASILA_001_005`).

## Validation rules (converter MUST enforce)

- ✅ exactly 5 options per soal (A, B, C, D, E)
- ✅ TWK/TIU: exactly 1 ✅ marker
- ✅ TKP: tiap opsi punya `*(skor N)*` dengan N ∈ [1, 5], dan distribusi 5 weights unik (sum = 15)
- ✅ difficulty ∈ [1, 5]
- ✅ ID unik di-batch (cross-batch dedup di consolidator)
- ⚠️ Warn: opsi text duplikat di-batch (kasus batch-009 soal 9 & 11)

## Run

```bash
# Single batch
pnpm tsx scripts/content-to-json.ts docs/content/drafts/batch-001-twk-pancasila.md

# All batches
pnpm tsx scripts/content-to-json.ts docs/content/drafts/

# Output ke stdout (default) atau --out path
pnpm tsx scripts/content-to-json.ts <input> --out docs/content/approved/
```

## Status

⚠️ **Phase 2 prep** — converter ini akan diuji terhadap batch existing tapi BELUM dipakai untuk seed DB. Aktivasi seeding nunggu MIMO redesign clear + admin UI built.
