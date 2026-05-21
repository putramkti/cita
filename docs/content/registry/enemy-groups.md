# Enemy Groups — Cita CPNS Bank v1

Daftar pusat enemy-group yang sudah dipakai. **WAJIB cek file ini sebelum bikin enemy-group baru** (jangan bikin duplikat ID).

## Format entry

```
ID                              | reason  | first batch | members
PANCASILA_BUNYI_SILA1           | overlap | batch-001   | soal-1
```

## Registry

| ID | Reason | First batch | Members count |
|---|---|---|---|
| PANCASILA_BUNYI_SILA1 | overlap (same fact: bunyi sila ke-1) | batch-001 | 1 |
| PANCASILA_BUNYI_SILA3 | overlap (same fact: bunyi sila ke-3) | batch-001 | 1 |
| PANCASILA_BUNYI_SILA5 | overlap (same fact: bunyi sila ke-5) | batch-001 | 1 |
| PANCASILA_LAMBANG_SILA2 | overlap (same fact: lambang sila ke-2) | batch-001 | 1 |
| PANCASILA_LAMBANG_SILA4 | overlap (same fact: lambang sila ke-4) | batch-001 | 1 |
| PANCASILA_PIDATO_SOEKARNO | overlap (tanggal pidato 1 Juni 1945) | batch-001 | 1 |
| PANCASILA_PENGESAH | overlap (PPKI sebagai pengesah) | batch-001 | 1 |
| PANCASILA_PIAGAM_JAKARTA_TANGGAL | overlap (22 Juni 1945) | batch-001 | 1 |
| PANCASILA_PERUBAHAN_SILA1 | overlap (frasa yang dihapus) | batch-001 | 1 |
| PANITIA_SEMBILAN_ANGGOTA | overlap (anggota Panitia Sembilan) | batch-001 | 1 |
| YAMIN_RUMUSAN | overlap (rumusan Yamin 5 asas) | batch-001 | 1 |
| SOEKARNO_TRISILA | overlap (Trisila/Ekasila gotong royong) | batch-001 | 1 |
| KEPPRES_HARI_LAHIR | overlap (Keppres 24/2016) | batch-001 | 1 |
| PANCASILA_NILAI_TIPE | overlap (nilai dasar/instrumental/praksis) | batch-001 | 1 |
| PANCASILA_SUMBER_HUKUM | overlap (TAP MPR III/2000) | batch-001 | 1 |

## Aturan join

- Saat menulis soal baru di topik yang ada di registry, **reuse** ID, jangan bikin baru.
- Kalau soal baru beda fokus tapi topik sama, bisa reuse atau bikin sub-ID (e.g. `PANCASILA_BUNYI_SILA1` vs `PANCASILA_LAMBANG_SILA1`).
- Saat 1 enemy-group sudah punya 5+ members, pertimbangkan split ke sub-grup yang lebih spesifik.

## Reason types

- `overlap` — informasi/fakta yang sama
- `cueing` — soal A berisi clue untuk soal B
- `clone` — soal cuma ganti angka/kata
- `topic` — topik sama tapi aspek beda
