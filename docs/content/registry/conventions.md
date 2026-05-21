# ID Conventions — Cita CPNS Bank v1

_Registry untuk lock format ID enemy-group dan family. Semua batch baru WAJIB pakai konvensi di sini, gak boleh bikin ID acak._

## Format

```
TWK Pancasila:    PANCASILA_<ASPEK>_SILA<n>
                  contoh: PANCASILA_BUNYI_SILA1, PANCASILA_LAMBANG_SILA3, PANCASILA_BUTIR_SILA2

TWK UUD:          UUD_PASAL<n>_<ASPEK>
                  contoh: UUD_PASAL27_HAK_KEWAJIBAN, UUD_AMANDEMEN1_PERUBAHAN

TWK NKRI:         NKRI_<ASPEK>
                  contoh: NKRI_OTONOMI, NKRI_KEDAULATAN

TWK Bhinneka:     BHINNEKA_<ASPEK>
                  contoh: BHINNEKA_FRASA, BHINNEKA_TOLERANSI

TWK Sejarah:      SEJARAH_<PERIODE>_<ASPEK>
                  contoh: SEJARAH_KEMERDEKAAN_PROKLAMASI, SEJARAH_BPUPKI_SIDANG

TIU Verbal:       TIU_VERBAL_<TIPE>_<KATA-KUNCI>
                  contoh: TIU_VERBAL_SINONIM_PROAKTIF, TIU_VERBAL_ANALOGI_PROFESI_ALAT

TIU Numerik:      TIU_NUM_<TIPE>_<NUM>
                  contoh: TIU_NUM_DERETLINEAR_001, TIU_NUM_USIA_001

TIU Figural:      TIU_FIGURAL_<TIPE>_<NUM>
                  contoh: TIU_FIGURAL_ROTASI_001, TIU_FIGURAL_KETIDAKSAMAAN_001

TKP Pelayanan:    TKP_PELAYANAN_<SKEN>_<NUM>
                  contoh: TKP_PELAYANAN_KOMPLAIN_001, TKP_PELAYANAN_LINTASBUDAYA_001

TKP Profesi:      TKP_PROFESI_<SKEN>_<NUM>
                  contoh: TKP_PROFESI_ETIKA_001, TKP_PROFESI_KORUPSI_001

TKP Jejaring:     TKP_JEJARING_<SKEN>_<NUM>
                  contoh: TKP_JEJARING_KONFLIK_001, TKP_JEJARING_KOLABORASI_001

TKP Sosbud:       TKP_SOSBUD_<SKEN>_<NUM>
                  contoh: TKP_SOSBUD_KEBERAGAMAN_001

TKP Antikorupsi:  TKP_ANTIKORUPSI_<SKEN>_<NUM>
                  contoh: TKP_ANTIKORUPSI_HADIAH_001
```

## Aturan kerja

1. **Sebelum bikin enemy-group baru**, cek `enemy-groups.md` dulu. Kalau topik mirip udah ada → reuse ID, gak bikin baru.
2. **Family ID** dipakai untuk soal yang **template-based** (mostly TIU numerik dan figural). Soal hafalan TWK biasanya tidak punya family.
3. **Enemy group** dipakai untuk soal yang **mirip topiknya** dan **tidak boleh keluar bareng** dalam 1 paket.
4. Format `<ASPEK>` menggunakan SCREAMING_SNAKE_CASE (huruf besar + underscore).
5. Format `<NUM>` dimulai dari 001, increment per batch baru di topik yang sama.

## Tipe relasi soal

```
enemy-group  : "Soal A dan B SECARA TOPIK serupa, jangan keluar bareng"
               (anti-cluster di 1 paket)

family       : "Soal A dan B itu CLONE / template-based"
               (anti-clone — generated from same parent)

cooldown     : "Soal A udah dilihat user X dalam attempt terakhir"
               (anti-repeat per user, tidak butuh tag)
```

## Migration mapping ke DB

Saat schema migration jalan nanti, ID di markdown akan di-resolve sebagai berikut:

| Markdown field | DB field | Mapping |
|---|---|---|
| `Kategori: TWK / Pancasila / Sila ke-1` | `category`, `subcategory`, `topic` | parsed split by `/` |
| `Difficulty: ② medium` | `difficulty` (int 1-5) | parsed dari ① ② ③ ④ ⑤ |
| `Tag: pancasila, sila-1` | `tags[]` | comma-split |
| `Family: PANCASILA_LAMBANG_FAMILY` | `familyId` | FK ke `ItemFamily.id` |
| `Enemy group candidate: X` | `enemyGroupId` | FK ke `EnemyGroup.id` |
| `Source: X` | `sourceReference` | string |
| `Penjelasan singkat` | `explanation` | text (cached short version) |
| `Penjelasan panjang` | `explanationLong` | text (full for tutor) |
