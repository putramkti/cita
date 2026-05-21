# Item Families — Cita CPNS Bank v1

Daftar pusat family-group untuk soal template-based (clone). **WAJIB cek file ini sebelum bikin family baru.**

## Format

```
ID                       | parent template       | first batch | members
PANCASILA_LAMBANG_FAMILY | "Lambang sila ke-N?"  | batch-001   | 2
```

## Registry

| ID | Parent template | First batch | Members count |
|---|---|---|---|
| PANCASILA_LAMBANG_FAMILY | "Lambang sila ke-N Pancasila adalah..." | batch-001 | 2 |

## Aturan family

1. Family dipakai untuk soal yang **template-based** (variasi parameter, struktur sama).
2. Generator nanti **maximum 1 anggota family per attempt** — anti-clone strict.
3. Soal hafalan tunggal (e.g. "Bunyi sila ke-3") TIDAK perlu family — cukup enemy-group.
4. Soal TIU numerik dengan parent yang sama (e.g. "deret aritmatika beda 3") wajib `family_id`.
5. Soal TIU figural dengan template rotasi yang sama wajib `family_id`.

## Tipe family

- `template-based` — soal generated dari template parameterized
- `manual-clone` — soal yang ditulis manual tapi pola sama (rare)
- `imported` — dari sumber eksternal yang punya keluarga
