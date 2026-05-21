# DEFERRED — Topik / Soal yang di-skip selama autonomous run

Saat marathon authoring, ada topik atau soal yang gw skip karena:
- Fact ambigu / butuh sumber primer yang gak gw akses
- Butuh keputusan editorial dari lo (Dymux)
- Butuh asset eksternal (gambar, image generation)

## Format

```
[YYYY-MM-DD HH:MM WIB] [batch] [kategori] — alasan
```

## Entries

- [2026-05-21 16:26 WIB] [batch-009] [TIU Numerik] — Soal 9 punya 2 opsi sama (A & B = 0). Perlu salah satu diganti saat review.
- [2026-05-21 16:26 WIB] [batch-009] [TIU Numerik] — Soal 11 punya 2 opsi sama (B & C = 13/28). Perlu salah satu diganti saat review (suggest B → 11/28).

## Aksi pasca review

Saat lo review borongan 200 soal:
1. Buka file ini
2. Putuskan per item: tackle sekarang, defer permanent, atau ganti pendekatan
3. Gw eksekusi keputusan lo

## Konteks bonus

Topik yang **expected** akan masuk DEFERRED (gw antisipasi):
- TIU Figural — visual yang butuh image generation prompt
- TKP yang konteksnya kontroversial (politik tertentu, agama tertentu) — biar lo pilih sendiri
- Fact yang berubah cepat (misal nama menteri, kebijakan baru pasca 2024)
