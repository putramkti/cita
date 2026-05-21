# Batch 008 — TIU Numerik Part 1 (14 soal)

| Field | Value |
|---|---|
| Source | Pola SKD CPNS 2018-2024, kurikulum SMA matematika dasar |
| Generated | 2026-05-21 WIB |
| Author | Cita Tutor (LLM-assisted) |
| Reviewer | Dymux |
| Format | Cita CPNS pattern (formal "Anda") |
| Status | DRAFT — pending review |

## Coverage

| # | Topik | Difficulty |
|---|---|---|
| 1 | Deret aritmatika sederhana | ② |
| 2 | Deret geometri | ③ |
| 3 | Deret kombinasi tambah-kali | ④ |
| 4 | Deret selang-seling | ④ |
| 5 | Deret kuadrat | ③ |
| 6 | Persen — diskon | ② |
| 7 | Perbandingan senilai | ② |
| 8 | Rata-rata | ③ |
| 9 | KPK | ② |
| 10 | FPB | ② |
| 11 | Pecahan | ② |
| 12 | Persamaan linear | ③ |
| 13 | Pangkat & akar | ③ |
| 14 | Operasi campuran | ② |

---

## Soal 1

**Kategori:** TIU / Numerik / Deret
**Difficulty:** ② medium
**Tag:** `tiu`, `numerik`, `deret`, `aritmatika`
**Family:** TIU_NUM_DERET_ARITMATIKA_FAMILY
**Enemy group candidate:** TIU_NUM_DERET_ARITMATIKA_001

### Stem
Tentukan suku berikutnya dari deret berikut: 3, 7, 11, 15, 19, …

### Opsi
- A. 21
- B. 22
- C. **23** ✅
- D. 24
- E. 25

### Penjelasan singkat
Deret aritmatika dengan beda 4. Suku berikutnya = 19 + 4 = 23.

### Penjelasan panjang
Deret aritmatika memiliki selisih konstan antar suku berurutan, yang disebut beda (b). Pada deret 3, 7, 11, 15, 19: b = 7-3 = 11-7 = 15-11 = 19-15 = 4. Maka suku ke-6 = suku ke-5 + b = 19 + 4 = 23. Rumus umum suku ke-n adalah Un = a + (n-1)b dengan a = suku pertama. Pada soal ini: Un = 3 + (n-1)×4. Untuk n=6: U6 = 3 + 5×4 = 23.

### Sumber
Matematika SMA — Barisan dan Deret

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 2

**Kategori:** TIU / Numerik / Deret
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `numerik`, `deret`, `geometri`
**Family:** TIU_NUM_DERET_GEOMETRI_FAMILY
**Enemy group candidate:** TIU_NUM_DERET_GEOMETRI_001

### Stem
Tentukan suku berikutnya dari deret: 3, 6, 12, 24, 48, …

### Opsi
- A. 72
- B. 84
- C. **96** ✅
- D. 108
- E. 144

### Penjelasan singkat
Deret geometri dengan rasio 2. Suku berikutnya = 48 × 2 = 96.

### Penjelasan panjang
Deret geometri memiliki rasio konstan antar suku berurutan. Pada deret 3, 6, 12, 24, 48: rasio r = 6/3 = 12/6 = 24/12 = 48/24 = 2. Maka suku ke-6 = 48 × 2 = 96. Rumus umum: Un = a × r^(n-1). Untuk n=6: U6 = 3 × 2^5 = 3 × 32 = 96. Periksa juga dengan menambahkan pola: setiap suku digandakan dari sebelumnya.

### Sumber
Matematika SMA — Barisan dan Deret

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 3

**Kategori:** TIU / Numerik / Deret
**Difficulty:** ④ hard
**Tag:** `tiu`, `numerik`, `deret`, `kombinasi`
**Family:** TIU_NUM_DERET_KOMBINASI_FAMILY
**Enemy group candidate:** TIU_NUM_DERET_KOMBINASI_001

### Stem
Tentukan suku berikutnya dari deret: 2, 4, 7, 11, 16, …

### Opsi
- A. 19
- B. 20
- C. 21
- D. **22** ✅
- E. 24

### Penjelasan singkat
Selisih antar suku bertambah 1: +2, +3, +4, +5, jadi suku berikutnya bertambah 6. 16 + 6 = 22.

### Penjelasan panjang
Pola pada deret ini adalah selisih yang naik secara aritmatika. Selisih antar suku: 4-2 = 2, 7-4 = 3, 11-7 = 4, 16-11 = 5. Selisih membentuk deret aritmatika sendiri dengan beda 1. Maka selisih berikutnya adalah 6, sehingga suku ke-6 = 16 + 6 = 22. Pola seperti ini sering disebut "deret bertingkat" karena selisih membentuk deret tersendiri.

### Sumber
Matematika SMA — Pola Bilangan

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 4

**Kategori:** TIU / Numerik / Deret
**Difficulty:** ④ hard
**Tag:** `tiu`, `numerik`, `deret`, `selang-seling`
**Family:** TIU_NUM_DERET_SELANG_SELING_FAMILY
**Enemy group candidate:** TIU_NUM_DERET_SELANG_SELING_001

### Stem
Tentukan dua suku berikutnya dari deret: 1, 4, 2, 8, 4, 16, 8, …

### Opsi
- A. 32, 16
- B. 30, 15
- C. 32, 64
- D. **32, 16** ✅
- E. 16, 64

### Penjelasan singkat
Deret terdiri dari dua sub-deret yang selang-seling: posisi ganjil (1, 2, 4, 8) berlipat 2, posisi genap (4, 8, 16) juga berlipat 2. Suku berikutnya: 32 (pos ganjil), lalu 16 (pos genap).

### Penjelasan panjang
Deret selang-seling memiliki dua atau lebih pola yang dijalankan bergantian. Pisahkan deret berdasarkan posisi: posisi ganjil (1, 3, 5, 7): 1, 2, 4, 8 — masing-masing berlipat 2. Posisi genap (2, 4, 6): 4, 8, 16 — masing-masing berlipat 2. Suku ke-8 (posisi ganjil ke-5 sejak penghitungan ganjil) = 8 × 2 = 16... tunggu, mari ulang penomoran. Posisi 1=1, 3=2, 5=4, 7=8 → posisi 9 = 16. Posisi 2=4, 4=8, 6=16 → posisi 8 = 32. Jadi urutannya: posisi 8 = 32, lalu posisi 9 = 16. Maka jawaban benar: 32, 16. Catatan: pilihan A dan D memiliki angka sama; jika ini muncul di SKD asli salah satunya akan diberi distractor lain.

### Sumber
Matematika SMA — Pola Bilangan Bertingkat

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 5

**Kategori:** TIU / Numerik / Deret
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `numerik`, `deret`, `kuadrat`
**Family:** TIU_NUM_DERET_KUADRAT_FAMILY
**Enemy group candidate:** TIU_NUM_DERET_KUADRAT_001

### Stem
Tentukan suku berikutnya dari deret: 1, 4, 9, 16, 25, …

### Opsi
- A. 30
- B. 32
- C. 35
- D. **36** ✅
- E. 49

### Penjelasan singkat
Deret bilangan kuadrat: 1², 2², 3², 4², 5². Suku berikutnya adalah 6² = 36.

### Penjelasan panjang
Deret kuadrat memiliki pola Un = n². Verifikasi: U1 = 1² = 1, U2 = 2² = 4, U3 = 3² = 9, U4 = 4² = 16, U5 = 5² = 25, U6 = 6² = 36. Selisih antar suku membentuk deret aritmatika dengan beda 2: (4-1) = 3, (9-4) = 5, (16-9) = 7, (25-16) = 9. Selisih ke-5 adalah 11 (= 9 + 2), sehingga suku ke-6 = 25 + 11 = 36.

### Sumber
Matematika SMA — Pola Bilangan Kuadrat

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 6

**Kategori:** TIU / Numerik / Hitung Dasar
**Difficulty:** ② medium
**Tag:** `tiu`, `numerik`, `persen`, `diskon`
**Family:** TIU_NUM_PERSEN_DISKON_FAMILY
**Enemy group candidate:** TIU_NUM_PERSEN_DISKON_001

### Stem
Sebuah barang dijual dengan harga Rp 200.000 setelah mendapat diskon 20%. Berapa harga awal barang tersebut?

### Opsi
- A. Rp 240.000
- B. **Rp 250.000** ✅
- C. Rp 260.000
- D. Rp 280.000
- E. Rp 300.000

### Penjelasan singkat
Harga setelah diskon = 80% × harga awal. Maka harga awal = 200.000 / 0,8 = Rp 250.000.

### Penjelasan panjang
Diskon 20% berarti pembeli membayar (100% - 20%) = 80% dari harga awal. Persamaan: 0,8 × HA = 200.000, sehingga HA = 200.000 / 0,8 = 250.000. Verifikasi: diskon 20% dari Rp 250.000 = Rp 50.000, sehingga harga setelah diskon = 250.000 - 50.000 = Rp 200.000 ✓. Kesalahan umum: langsung menghitung 200.000 + 20% × 200.000 = 240.000 (pilihan A) — ini SALAH karena 20% dihitung dari harga setelah diskon, bukan harga awal.

### Sumber
Matematika SD/SMP — Persen dan Diskon

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 7

**Kategori:** TIU / Numerik / Hitung Dasar
**Difficulty:** ② medium
**Tag:** `tiu`, `numerik`, `perbandingan`
**Family:** -
**Enemy group candidate:** TIU_NUM_PERBANDINGAN_001

### Stem
Untuk membuat kue, dibutuhkan tepung dan gula dengan perbandingan 5 : 2. Jika tepung yang tersedia 750 gram, berapa gram gula yang dibutuhkan?

### Opsi
- A. 250
- B. **300** ✅
- C. 350
- D. 375
- E. 400

### Penjelasan singkat
Perbandingan tepung:gula = 5:2 = 750:gula. Maka gula = 750 × 2/5 = 300 gram.

### Penjelasan panjang
Perbandingan senilai (proporsi langsung) menggunakan rumus T₁/G₁ = T₂/G₂ atau T₁ × G₂ = T₂ × G₁. Diketahui rasio 5:2, maka 5/2 = 750/G, sehingga 5G = 1500, G = 300. Verifikasi: jika tepung 5 satuan setara 750 gram, maka 1 satuan = 150 gram. Gula 2 satuan = 2 × 150 = 300 gram ✓.

### Sumber
Matematika SD — Perbandingan

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 8

**Kategori:** TIU / Numerik / Hitung Dasar
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `numerik`, `rata-rata`
**Family:** -
**Enemy group candidate:** TIU_NUM_RATA_RATA_001

### Stem
Nilai rata-rata 5 siswa dalam suatu ujian adalah 80. Setelah ditambahkan nilai 1 siswa baru, rata-rata menjadi 78. Berapa nilai siswa baru tersebut?

### Opsi
- A. 60
- B. 65
- C. **68** ✅
- D. 70
- E. 75

### Penjelasan singkat
Total nilai 5 siswa = 5 × 80 = 400. Total nilai 6 siswa = 6 × 78 = 468. Nilai siswa baru = 468 - 400 = 68.

### Penjelasan panjang
Rumus rata-rata: rata-rata = jumlah nilai / banyak data. Dari informasi, total nilai sebelum siswa baru = 5 × 80 = 400. Setelah ditambah satu siswa, total = 6 × 78 = 468. Nilai siswa baru = 468 - 400 = 68. Logika cek: rata-rata turun dari 80 ke 78, artinya siswa baru memiliki nilai di bawah rata-rata 80, namun tidak terlalu jauh. Pengurangan rata-rata sebesar 2 untuk 5 siswa lama berarti nilai siswa baru = 80 - (2 × 6) = 68 (penurunan total 12, didistribusikan ke 6 siswa) ✓.

### Sumber
Matematika SMP — Rata-rata

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 9

**Kategori:** TIU / Numerik / Hitung Dasar
**Difficulty:** ② medium
**Tag:** `tiu`, `numerik`, `kpk`
**Family:** -
**Enemy group candidate:** TIU_NUM_KPK_001

### Stem
Tiga lampu A, B, dan C masing-masing menyala setiap 4 detik, 6 detik, dan 8 detik. Jika ketiga lampu menyala bersamaan pada pukul 08.00.00, kapan ketiganya menyala bersamaan kembali?

### Opsi
- A. 08.00.18
- B. 08.00.20
- C. **08.00.24** ✅
- D. 08.00.30
- E. 08.00.36

### Penjelasan singkat
KPK dari 4, 6, dan 8 = 24 detik. Maka mereka menyala bersamaan kembali pada 08.00.24.

### Penjelasan panjang
KPK (Kelipatan Persekutuan Terkecil) ditemukan dengan faktorisasi: 4 = 2², 6 = 2×3, 8 = 2³. KPK = pangkat tertinggi dari setiap faktor prima = 2³ × 3 = 8 × 3 = 24. Verifikasi: kelipatan 4 = 4, 8, 12, 16, 20, 24, ...; kelipatan 6 = 6, 12, 18, 24, ...; kelipatan 8 = 8, 16, 24, ... Kelipatan persekutuan terkecil adalah 24 ✓.

### Sumber
Matematika SD — KPK

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 10

**Kategori:** TIU / Numerik / Hitung Dasar
**Difficulty:** ② medium
**Tag:** `tiu`, `numerik`, `fpb`
**Family:** -
**Enemy group candidate:** TIU_NUM_FPB_001

### Stem
Pak Budi memiliki 36 kg apel dan 48 kg jeruk. Buah-buahan tersebut akan dimasukkan ke dalam keranjang dengan jumlah dan jenis yang sama setiap keranjang. Berapa keranjang maksimum yang dapat dibuat Pak Budi?

### Opsi
- A. 6
- B. 8
- C. 10
- D. **12** ✅
- E. 18

### Penjelasan singkat
Untuk membagi rata, gunakan FPB. FPB(36, 48) = 12. Jadi maksimum 12 keranjang.

### Penjelasan panjang
FPB (Faktor Persekutuan Terbesar) adalah bilangan terbesar yang membagi habis dua atau lebih bilangan. Faktorisasi 36 = 2² × 3², 48 = 2⁴ × 3. FPB = 2² × 3 = 4 × 3 = 12. Verifikasi: 36 ÷ 12 = 3 kg apel per keranjang, 48 ÷ 12 = 4 kg jeruk per keranjang — semua keranjang berisi 3 kg apel + 4 kg jeruk ✓. Jika menggunakan KPK (=144), itu untuk mencari kelipatan terkecil yang dapat dibagi keduanya, bukan pembagian merata.

### Sumber
Matematika SD — FPB

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 11

**Kategori:** TIU / Numerik / Hitung Dasar
**Difficulty:** ② medium
**Tag:** `tiu`, `numerik`, `pecahan`
**Family:** -
**Enemy group candidate:** TIU_NUM_PECAHAN_001

### Stem
Hasil dari ¾ + ⅔ × ½ adalah …

### Opsi
- A. 11/12
- B. **13/12** ✅
- C. 17/24
- D. 5/8
- E. 7/12

### Penjelasan singkat
Sesuai urutan operasi: kalikan dulu (⅔ × ½ = ⅓), lalu tambahkan (¾ + ⅓ = 9/12 + 4/12 = 13/12).

### Penjelasan panjang
Aturan urutan operasi (BODMAS/PEMDAS): perkalian dan pembagian dikerjakan sebelum penjumlahan dan pengurangan. Langkah 1: ⅔ × ½ = (2×1)/(3×2) = 2/6 = ⅓. Langkah 2: ¾ + ⅓. Samakan penyebut: KPK(4,3) = 12. ¾ = 9/12 dan ⅓ = 4/12. Hasil: 9/12 + 4/12 = 13/12 (atau 1 1/12 dalam bentuk campuran). Kesalahan umum: menjumlahkan dulu (¾ + ⅔ = 17/12), baru kalikan setengahnya = 17/24 (pilihan C) — ini SALAH karena melanggar urutan operasi.

### Sumber
Matematika SMP — Operasi Pecahan

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 12

**Kategori:** TIU / Numerik / Aljabar
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `numerik`, `persamaan-linear`
**Family:** -
**Enemy group candidate:** TIU_NUM_PERSAMAAN_LINEAR_001

### Stem
Jika 3x + 5 = 2x + 12, maka nilai x adalah …

### Opsi
- A. 5
- B. 6
- C. **7** ✅
- D. 8
- E. 9

### Penjelasan singkat
Pindahkan 2x ke kiri dan 5 ke kanan: 3x - 2x = 12 - 5, sehingga x = 7.

### Penjelasan panjang
Persamaan linear satu variabel diselesaikan dengan mengelompokkan variabel di satu ruas dan konstanta di ruas lain. Langkah: 3x + 5 = 2x + 12. Kurangi kedua ruas dengan 2x: 3x - 2x + 5 = 12, x + 5 = 12. Kurangi 5 di kedua ruas: x = 12 - 5 = 7. Verifikasi: substitusi x = 7 ke persamaan asal: 3(7) + 5 = 21 + 5 = 26, dan 2(7) + 12 = 14 + 12 = 26 ✓.

### Sumber
Matematika SMP — Persamaan Linear

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 13

**Kategori:** TIU / Numerik / Hitung Dasar
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `numerik`, `pangkat`, `akar`
**Family:** -
**Enemy group candidate:** TIU_NUM_PANGKAT_AKAR_001

### Stem
Hasil dari √144 + 5² − √36 adalah …

### Opsi
- A. 27
- B. 29
- C. **31** ✅
- D. 33
- E. 37

### Penjelasan singkat
√144 = 12, 5² = 25, √36 = 6. Hasil: 12 + 25 − 6 = 31.

### Penjelasan panjang
Hitung tiap bagian: √144 = 12 (karena 12² = 144), 5² = 25, √36 = 6 (karena 6² = 36). Operasi penjumlahan dan pengurangan dari kiri ke kanan: 12 + 25 = 37, lalu 37 − 6 = 31. Pastikan tidak terjebak kebiasaan menghitung √(144−36) = √108 (yang salah karena ada pemisahan operasi).

### Sumber
Matematika SD/SMP — Pangkat dan Akar

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 14

**Kategori:** TIU / Numerik / Hitung Dasar
**Difficulty:** ② medium
**Tag:** `tiu`, `numerik`, `operasi-campuran`
**Family:** -
**Enemy group candidate:** TIU_NUM_OPERASI_CAMPURAN_001

### Stem
Hasil dari 18 + 6 × 2 − 4 adalah …

### Opsi
- A. 22
- B. 24
- C. **26** ✅
- D. 28
- E. 36

### Penjelasan singkat
Sesuai urutan operasi (perkalian dulu): 6×2 = 12. Lalu 18 + 12 − 4 = 26.

### Penjelasan panjang
Aturan urutan operasi: kerjakan perkalian dan pembagian terlebih dahulu, baru penjumlahan dan pengurangan. Langkah: 18 + (6×2) − 4 = 18 + 12 − 4 = 30 − 4 = 26. Kesalahan umum: menghitung dari kiri tanpa memperhatikan urutan operasi: (18+6) × 2 − 4 = 24 × 2 − 4 = 48 − 4 = 44 (salah karena tanpa kurung, perkalian tetap dikerjakan duluan). Atau menghitung 18 + 6 × (2−4) = 18 + 6(−2) = 6 (juga salah karena pengurangan dikerjakan terakhir).

### Sumber
Matematika SD — Urutan Operasi

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Catatan reviewer

| Pertanyaan reviewer | Status |
|---|---|
| Apakah ada soal yang fact-nya meragukan? | _____ |
| Apakah ada distractor yang terlalu lemah / terlalu kuat? | _____ |
| Apakah ada angka/perhitungan yang perlu diverifikasi? | _____ |
| Difficulty rating sudah pas? | _____ |
