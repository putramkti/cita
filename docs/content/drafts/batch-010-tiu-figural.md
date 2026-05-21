# Batch 010 — TIU Figural (18 soal, text + image prompt)

| Field | Value |
|---|---|
| Source | Pola SKD CPNS 2018-2024, soal logika visual |
| Generated | 2026-05-21 WIB |
| Author | Cita Tutor (LLM-assisted) |
| Reviewer | Dymux |
| Format | Cita CPNS pattern (formal "Anda") |
| Status | DRAFT — pending review |
| **Special** | Tiap soal punya **image_prompt** untuk generate gambar nanti (DALL-E/SD/Midjourney/Imagen) |

## Catatan untuk image generation

Setiap soal di batch ini berisi field `image_prompt` yang akan dipakai untuk generate visual saat:
1. Admin UI siap, atau
2. Lo trigger script generate batch images

Style baseline (apply ke semua):
```
Style: clean line art, black ink on white background, simple geometric shapes,
       no text labels, no shadows, no decoration. Aspect ratio 1:1 per cell.
       Educational textbook style.
```

## Coverage

| # | Topik | Difficulty |
|---|---|---|
| 1 | Analogi rotasi | ② |
| 2 | Analogi refleksi | ③ |
| 3 | Analogi penghilangan | ③ |
| 4 | Analogi penambahan | ③ |
| 5 | Analogi warna/arsiran | ③ |
| 6 | Seri rotasi 90° | ③ |
| 7 | Seri seri penambahan elemen | ③ |
| 8 | Seri perubahan posisi | ④ |
| 9 | Seri kombinasi rotasi+jumlah | ④ |
| 10 | Ketidaksamaan jumlah elemen | ② |
| 11 | Ketidaksamaan bentuk | ③ |
| 12 | Ketidaksamaan rotasi | ④ |
| 13 | Ketidaksamaan kategori | ③ |
| 14 | Refleksi cermin | ③ |
| 15 | Rotasi 180° | ③ |
| 16 | Pola simetri | ④ |
| 17 | Logika lipatan kertas | ④ |
| 18 | Pola kelipatan | ④ |

---

## Soal 1

**Kategori:** TIU / Figural / Analogi
**Difficulty:** ② medium
**Tag:** `tiu`, `figural`, `analogi`, `rotasi`
**Family:** TIU_FIGURAL_ROTASI_FAMILY
**Enemy group candidate:** TIU_FIGURAL_ROTASI_001

### Stem
Perhatikan analogi gambar berikut. Pilihlah gambar yang paling tepat menggantikan tanda tanya.

> ▲ : ▶ = ◆ : ?

```image_prompt
Layout: row of 4 cells with arrow A:B = C:?
Cell 1 (A): equilateral triangle pointing up, black outline, white fill
Cell 2 (B): equilateral triangle pointing right (rotated 90° clockwise), black outline, white fill
Cell 3 (C): rhombus / diamond shape (square rotated 45°), black outline, white fill
Cell 4 (?): empty placeholder with question mark
Style: clean line art, simple geometry, equal cell size, white background, no labels
```

### Opsi (text representation)
- A. ◆ (sama persis dengan C, tidak berubah)
- B. ◇ (rhombus/diamond putih dengan outline saja)
- C. **◇ rotasi 90° = bentuk baru (rhombus diputar)** ✅
- D. ◆ ke kiri (refleksi horizontal)
- E. lingkaran ●

### Penjelasan singkat
Pola dari A ke B adalah rotasi 90° searah jarum jam. Maka C → ? juga rotasi 90° searah jarum jam. Rhombus (◆) yang diputar 90° searah jarum jam menghasilkan rhombus dalam orientasi yang berbeda (terlihat sebagai persegi miring di sumbu lain).

### Penjelasan panjang
Pola transformasi dari A ke B harus diidentifikasi terlebih dahulu. Segitiga sama sisi yang awalnya menunjuk ke atas (▲) bertransformasi menjadi segitiga yang menunjuk ke kanan (▶) — rotasi 90° searah jarum jam. Pola yang sama harus diaplikasikan ke C: rhombus (◆) diputar 90° searah jarum jam menghasilkan rhombus dengan orientasi yang berbeda (sumbu vertikal panjangnya bergeser ke horizontal). Pilihan C paling tepat.

### Sumber
Pola figural rotasi SKD CPNS

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 2

**Kategori:** TIU / Figural / Analogi
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `analogi`, `refleksi`
**Family:** TIU_FIGURAL_REFLEKSI_FAMILY
**Enemy group candidate:** TIU_FIGURAL_REFLEKSI_001

### Stem
Perhatikan analogi gambar berikut. Pilihlah gambar yang paling tepat menggantikan tanda tanya.

> [F] : [Ⅎ] = [P] : ?

```image_prompt
Layout: row of 4 cells with arrow A:B = C:?
Cell 1 (A): letter F in capital, black, sans-serif, simple
Cell 2 (B): letter F mirrored horizontally (looks like a reverse-F)
Cell 3 (C): letter P in capital, black, sans-serif
Cell 4 (?): empty placeholder
Style: clean black-and-white text font, equal cell size
```

### Opsi (text representation)
- A. P (sama)
- B. p (huruf kecil)
- C. d (huruf d)
- D. **q (huruf q)** ✅
- E. b (huruf b)

### Penjelasan singkat
Pola transformasi A ke B adalah refleksi horizontal (cermin kiri-kanan). P yang direfleksikan secara horizontal akan terlihat seperti huruf "q".

### Penjelasan panjang
Refleksi horizontal artinya gambar dibalik di sepanjang sumbu vertikal — kiri menjadi kanan dan sebaliknya. Huruf F yang direfleksikan secara horizontal menghasilkan bentuk seperti F terbalik (Ⅎ atau bentuk seperti "huruf F dengan kaki di kiri"). Pola yang sama diterapkan ke huruf P: bagian "kepala P" yang biasanya di kanan atas akan berpindah ke kiri atas, menghasilkan bentuk yang menyerupai huruf "q". Pilihan B (p kecil) tidak tepat karena hanya perubahan ukuran, bukan refleksi. Pilihan C (d) lebih dekat ke refleksi vertikal P, bukan horizontal.

### Sumber
Pola figural refleksi SKD CPNS

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 3

**Kategori:** TIU / Figural / Analogi
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `analogi`, `penghilangan`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_PENGHILANGAN_001

### Stem
Perhatikan analogi gambar berikut. Pilihlah gambar yang paling tepat menggantikan tanda tanya.

```image_prompt
Layout: row of 4 cells, A:B = C:?
Cell 1 (A): square containing 4 small circles arranged in a 2x2 grid
Cell 2 (B): square containing 3 small circles (top-right one removed, so bottom-left, top-left, bottom-right circles remain)
Cell 3 (C): triangle containing 3 small circles arranged like an upward triangle (top, bottom-left, bottom-right)
Cell 4 (?): empty placeholder
Style: clean black outline shapes, white fill background, simple geometry
```

### Opsi (text representation)
- A. Triangle dengan 3 lingkaran (sama dengan C)
- B. **Triangle dengan 2 lingkaran (lingkaran di puncak dihilangkan)** ✅
- C. Triangle dengan 4 lingkaran
- D. Square dengan 3 lingkaran
- E. Triangle kosong

### Penjelasan singkat
Pola dari A ke B adalah pengurangan satu lingkaran. C → ? juga harus dikurangi satu lingkaran. Triangle dengan 3 lingkaran menjadi triangle dengan 2 lingkaran.

### Penjelasan panjang
Pola transformasi: A memiliki 4 lingkaran, B memiliki 3 lingkaran (turun 1). Maka C dengan 3 lingkaran harus berubah menjadi gambar dengan 2 lingkaran. Bentuk dasar (triangle) dipertahankan. Pilihan B paling tepat. Pilihan A tidak ada perubahan (salah pola). Pilihan C bertambah (kebalikan pola). Pilihan D mengubah bentuk dasar (tidak konsisten). Pilihan E menghilangkan terlalu banyak.

### Sumber
Pola figural penghilangan elemen

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 4

**Kategori:** TIU / Figural / Analogi
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `analogi`, `penambahan`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_PENAMBAHAN_001

### Stem
Perhatikan analogi gambar berikut.

```image_prompt
Layout: row of 4 cells, A:B = C:?
Cell 1 (A): single horizontal line
Cell 2 (B): plus sign (horizontal line + vertical line crossing)
Cell 3 (C): single circle
Cell 4 (?): empty
```

### Opsi (text representation)
- A. Lingkaran kosong
- B. **Lingkaran dengan garis vertikal menembusnya (◐ tanpa arsiran, hanya outline + garis tengah)** ✅
- C. Lingkaran dengan garis horizontal di atas
- D. Dua lingkaran terpisah
- E. Lingkaran yang lebih besar

### Penjelasan singkat
Pola A→B: ditambahkan garis vertikal. Maka C→? juga ditambahkan garis vertikal yang menembus lingkaran.

### Penjelasan panjang
Transformasi A ke B: menambahkan elemen garis vertikal yang memotong garis horizontal (membentuk plus). Aplikasi ke C: lingkaran ditambahi garis vertikal yang menembusnya (atau menyilang). Pilihan B paling sesuai dengan pola penambahan elemen yang sama. Pilihan A tidak ada perubahan. Pilihan C menambahkan elemen yang berbeda. Pilihan D dan E mengubah karakteristik dasar lingkaran.

### Sumber
Pola figural penambahan elemen

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 5

**Kategori:** TIU / Figural / Analogi
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `analogi`, `arsiran`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_ARSIRAN_001

### Stem
Perhatikan analogi gambar berikut.

```image_prompt
Layout: row of 4 cells, A:B = C:?
Cell 1 (A): square white (outline only, no fill)
Cell 2 (B): square fully black (filled)
Cell 3 (C): circle white (outline only, no fill)
Cell 4 (?): empty
```

### Opsi (text representation)
- A. Lingkaran kosong (sama dengan C)
- B. **Lingkaran terisi penuh hitam** ✅
- C. Lingkaran berarsiran horizontal
- D. Setengah lingkaran terisi
- E. Lingkaran dengan titik di tengah

### Penjelasan singkat
Pola A→B: dari putih (kosong) menjadi hitam (terisi penuh). Maka C→? juga harus berubah dari putih ke hitam terisi.

### Penjelasan panjang
Transformasi yang konsisten: pengisian (warna) tanpa mengubah bentuk dasar. Square putih menjadi square hitam, maka circle putih harus menjadi circle hitam (terisi penuh). Bentuk dasar (lingkaran) dipertahankan, hanya warna/arsiran yang berubah. Pilihan B paling tepat. Pilihan A tidak ada perubahan. Pilihan C, D, E menggunakan jenis pengisian yang berbeda dari pola.

### Sumber
Pola figural perubahan warna/arsiran

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 6

**Kategori:** TIU / Figural / Seri
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `seri`, `rotasi-90`
**Family:** TIU_FIGURAL_ROTASI_FAMILY
**Enemy group candidate:** TIU_FIGURAL_SERI_ROTASI_001

### Stem
Lanjutkan pola gambar berikut.

```image_prompt
Layout: row of 5 cells (4 known + 1 unknown)
Cell 1: arrow pointing up ↑
Cell 2: arrow pointing right → (rotated 90° clockwise from cell 1)
Cell 3: arrow pointing down ↓ (rotated 90° clockwise from cell 2)
Cell 4: arrow pointing left ← (rotated 90° clockwise from cell 3)
Cell 5 (?): empty placeholder
Style: clean arrows, simple line art, equal cell size
```

### Opsi (text representation)
- A. Panah ke kanan ditangahnya
- B. **Panah ke atas ↑** ✅
- C. Panah ke kanan-atas (diagonal)
- D. Panah putus-putus
- E. Lingkaran tanpa panah

### Penjelasan singkat
Pola: rotasi 90° searah jarum jam tiap langkah. Setelah ←, rotasi berikutnya kembali ke ↑.

### Penjelasan panjang
Setiap langkah, panah berputar 90° searah jarum jam. Urutan: atas → kanan → bawah → kiri → atas (kembali ke awal). Pola siklik dengan periode 4. Maka cell ke-5 = ↑ (kembali ke posisi awal). Pilihan B paling tepat. Pemahaman kunci: kenali bahwa rotasi siklik akhirnya kembali ke titik awal — ini sering muncul di SKD figural.

### Sumber
Pola figural seri rotasi siklik

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 7

**Kategori:** TIU / Figural / Seri
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `seri`, `penambahan-elemen`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_SERI_PENAMBAHAN_001

### Stem
Lanjutkan pola.

```image_prompt
Layout: row of 5 cells
Cell 1: 1 small dot in center
Cell 2: 2 small dots side by side
Cell 3: 3 small dots in a row
Cell 4: 4 small dots in a row
Cell 5 (?): empty
Style: simple black dots on white background
```

### Opsi (text representation)
- A. 4 titik (sama dengan cell 4)
- B. **5 titik berderet** ✅
- C. 6 titik
- D. 4 titik dalam pola berbeda (vertikal)
- E. 5 titik dalam grid 2x2 + 1

### Penjelasan singkat
Pola: tiap langkah menambah 1 titik. Maka cell ke-5 = 5 titik berderet.

### Penjelasan panjang
Pola pertambahan +1 titik per langkah: 1, 2, 3, 4, → 5. Susunan dipertahankan (deretan horizontal). Pilihan B paling tepat. Pilihan A tidak ada perubahan. Pilihan C terlalu banyak. Pilihan D dan E menggunakan jumlah benar tapi pola susunan berubah, sedangkan pola asli mempertahankan susunan deretan.

### Sumber
Pola figural seri penambahan elemen

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 8

**Kategori:** TIU / Figural / Seri
**Difficulty:** ④ hard
**Tag:** `tiu`, `figural`, `seri`, `posisi`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_SERI_POSISI_001

### Stem
Lanjutkan pola.

```image_prompt
Layout: row of 5 cells, each cell contains a 3x3 grid
Cell 1: 3x3 grid with a black dot in top-left position
Cell 2: 3x3 grid with a black dot in top-middle position
Cell 3: 3x3 grid with a black dot in top-right position
Cell 4: 3x3 grid with a black dot in middle-right position
Cell 5 (?): empty placeholder
Style: clean black 3x3 grid lines on white, single black dot per cell
```

### Opsi (text representation)
- A. Titik di posisi tengah-tengah grid
- B. **Titik di posisi bawah-kanan grid** ✅
- C. Titik di posisi tengah-kiri grid
- D. Titik di posisi bawah-tengah grid
- E. Tidak ada titik (grid kosong)

### Penjelasan singkat
Pola: titik bergerak searah jarum jam mengelilingi tepi grid. Setelah middle-right, titik berpindah ke bottom-right.

### Penjelasan panjang
Pola pergerakan titik mengikuti pinggiran grid 3x3 searah jarum jam. Urutan: top-left → top-middle → top-right → middle-right → bottom-right (cell ke-5) → bottom-middle → bottom-left → middle-left → kembali ke top-left. Pilihan B paling sesuai dengan langkah ke-5 dalam pola siklik tersebut. Pilihan A salah karena tengah grid bukan bagian pinggiran. Pilihan C, D melompati posisi.

### Sumber
Pola figural seri posisi siklik

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 9

**Kategori:** TIU / Figural / Seri
**Difficulty:** ④ hard
**Tag:** `tiu`, `figural`, `seri`, `kombinasi`, `rotasi-jumlah`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_SERI_KOMBINASI_001

### Stem
Lanjutkan pola.

```image_prompt
Layout: row of 5 cells
Cell 1: 1 vertical line
Cell 2: 2 horizontal lines (rotated 90° + 1 added)
Cell 3: 3 vertical lines (rotated 90° + 1 added)
Cell 4: 4 horizontal lines
Cell 5 (?): empty placeholder
Style: simple parallel line strokes, equal cell size
```

### Opsi (text representation)
- A. 4 garis vertikal
- B. **5 garis vertikal** ✅
- C. 5 garis horizontal
- D. 6 garis vertikal
- E. 4 garis horizontal

### Penjelasan singkat
Pola dua dimensi: jumlah garis bertambah +1 tiap langkah, dan orientasi berputar 90° (vertikal-horizontal-vertikal-horizontal). Cell 5: jumlah=5, orientasi=vertikal.

### Penjelasan panjang
Identifikasi dua pola yang berjalan bersamaan: (1) jumlah garis: 1, 2, 3, 4 → 5 (selisih +1); (2) orientasi: vertikal, horizontal, vertikal, horizontal → vertikal (alternasi). Cell ke-5 harus memiliki 5 garis vertikal. Pilihan B paling tepat. Pilihan C jumlahnya benar tapi orientasi salah (alternasi seharusnya kembali ke vertikal). Pilihan D jumlah salah.

### Sumber
Pola figural seri kombinasi (jumlah + orientasi)

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 10

**Kategori:** TIU / Figural / Ketidaksamaan
**Difficulty:** ② medium
**Tag:** `tiu`, `figural`, `ketidaksamaan`, `jumlah-elemen`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_KETIDAKSAMAAN_JUMLAH_001

### Stem
Manakah yang tidak masuk dalam pola yang sama?

```image_prompt
Layout: row of 5 cells (5 options)
Cell A: square with 4 dots inside (one at each corner)
Cell B: triangle with 3 dots inside (one at each vertex)
Cell C: pentagon with 5 dots inside (one at each vertex)
Cell D: hexagon with 6 dots inside (one at each vertex)
Cell E: circle with 4 dots arranged at 0°, 90°, 180°, 270°
Style: clean line art shapes, equal-size cells
```

### Opsi (text representation)
- A. Kotak (4 sudut, 4 titik)
- B. Segitiga (3 sudut, 3 titik)
- C. Segi-5 (5 sudut, 5 titik)
- D. Segi-6 (6 sudut, 6 titik)
- E. **Lingkaran (tanpa sudut, tapi punya 4 titik)** ✅

### Penjelasan singkat
Pola: titik diletakkan di tiap sudut bentuk. Lingkaran tidak memiliki sudut tetapi tetap punya titik — beda dengan yang lain.

### Penjelasan panjang
Pola yang konsisten antara A, B, C, dan D: jumlah titik sama dengan jumlah sudut bentuk geometri tersebut. Lingkaran (E) tidak memiliki sudut, sehingga aturan "1 titik per sudut" tidak berlaku. Meskipun titik diletakkan di posisi 0°, 90°, 180°, 270°, ini bukan "sudut" dalam arti geometri — lingkaran tidak punya vertex. Pilihan E adalah anomali.

### Sumber
Pola figural ketidaksamaan kategori bentuk

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 11

**Kategori:** TIU / Figural / Ketidaksamaan
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `ketidaksamaan`, `bentuk`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_KETIDAKSAMAAN_BENTUK_001

### Stem
Manakah yang tidak masuk dalam pola yang sama?

```image_prompt
Layout: row of 5 cells
Cell A: square divided diagonally (2 triangles)
Cell B: rectangle divided horizontally (2 rectangles)
Cell C: square divided vertically (2 rectangles)
Cell D: triangle divided horizontally (2 trapezoids? or two triangles?)
Cell E: hexagon divided into 6 equal triangles (radial)
Style: clean line art, simple division lines
```

### Opsi (text representation)
- A. Kotak dibagi 2 (diagonal)
- B. Persegi panjang dibagi 2 (horizontal)
- C. Kotak dibagi 2 (vertikal)
- D. Segitiga dibagi 2 (horizontal)
- E. **Segi-6 dibagi 6 (radial)** ✅

### Penjelasan singkat
Pola: bentuk dibagi menjadi 2 bagian. Segi-6 dibagi 6 — beda dari pola "dibagi 2".

### Penjelasan panjang
A, B, C, dan D sama-sama membagi bentuk menjadi **2** bagian (apapun arah pembaginya). Segi-6 di pilihan E dibagi menjadi **6** bagian — pengecualian dari pola. Pilihan E adalah anomali. Catatan: jika lo terbalik fokus pada "berapa banyak garis pembagi", semua bentuk A-D punya 1 garis pembagi, sedangkan E punya banyak garis pembagi (radial).

### Sumber
Pola figural ketidaksamaan jumlah bagian

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 12

**Kategori:** TIU / Figural / Ketidaksamaan
**Difficulty:** ④ hard
**Tag:** `tiu`, `figural`, `ketidaksamaan`, `rotasi`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_KETIDAKSAMAAN_ROTASI_001

### Stem
Manakah yang tidak masuk dalam pola yang sama?

```image_prompt
Layout: row of 5 cells, each containing a letter
Cell A: letter L pointing up-left (standard L orientation)
Cell B: letter L rotated 90° clockwise (looks like inverted L pointing right)
Cell C: letter L rotated 180° (upside down)
Cell D: letter L rotated 270° (mirror reflected, like J without curve)
Cell E: letter L mirrored horizontally (looks like backward L)
Style: clean sans-serif L letters in different orientations
```

### Opsi (text representation)
- A. L tegak
- B. L diputar 90°
- C. L diputar 180°
- D. L diputar 270°
- E. **L direfleksi (cermin)** ✅

### Penjelasan singkat
A, B, C, D semua adalah rotasi (tanpa cermin). E adalah refleksi/cermin — bentuk yang tidak bisa dicapai dengan rotasi 2D saja.

### Penjelasan panjang
Rotasi vs refleksi adalah dua transformasi berbeda. A, B, C, D semua dapat saling diubah hanya dengan rotasi (tanpa membalik bentuk). Sedangkan refleksi cermin (E) menghasilkan bentuk yang tidak bisa didapat hanya dengan rotasi 2D — perlu dilipat di sumbu cermin. Untuk mengeceknya: bentuk asli L bisa diputar berapa kali pun tetap memiliki kaidah arah yang sama (chirality), sedangkan cerminnya berbeda. Pilihan E adalah anomali.

### Sumber
Pola figural ketidaksamaan rotasi vs refleksi

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 13

**Kategori:** TIU / Figural / Ketidaksamaan
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `ketidaksamaan`, `kategori`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_KETIDAKSAMAAN_KATEGORI_001

### Stem
Manakah yang tidak masuk dalam pola yang sama?

```image_prompt
Layout: row of 5 cells
Cell A: square (4 sides)
Cell B: rectangle (4 sides)
Cell C: rhombus (4 sides)
Cell D: trapezoid (4 sides)
Cell E: pentagon (5 sides)
Style: clean line art quadrilaterals + pentagon, equal cell size
```

### Opsi (text representation)
- A. Kotak (4 sisi)
- B. Persegi panjang (4 sisi)
- C. Belah ketupat (4 sisi)
- D. Trapesium (4 sisi)
- E. **Segi-5 (5 sisi)** ✅

### Penjelasan singkat
A, B, C, D semua punya 4 sisi (segi-empat). Segi-5 (E) berbeda kategori — bukan segi-empat.

### Penjelasan panjang
Segi-empat (quadrilateral) memiliki 4 sisi dan 4 sudut. Square, rectangle, rhombus, dan trapezoid semuanya termasuk dalam kategori ini, dengan variasi panjang sisi dan sudut. Pentagon memiliki 5 sisi sehingga keluar dari kategori segi-empat. Pilihan E adalah anomali. Soal seperti ini menguji kemampuan klasifikasi geometri.

### Sumber
Pola figural ketidaksamaan kategori geometri

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 14

**Kategori:** TIU / Figural / Refleksi
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `refleksi`, `cermin`
**Family:** TIU_FIGURAL_REFLEKSI_FAMILY
**Enemy group candidate:** TIU_FIGURAL_REFLEKSI_002

### Stem
Manakah yang merupakan refleksi cermin (refleksi vertikal) dari gambar berikut?

```image_prompt
Original: Capital letter R in standard orientation
Cell A: Letter R standard (no change)
Cell B: Letter R mirrored horizontally (left-right flip)
Cell C: Letter R rotated 180°
Cell D: Letter R rotated 90° clockwise
Cell E: Letter R rotated 90° counter-clockwise
Layout: original shown above; 5 options as labeled cells below
Style: clean sans-serif font
```

### Opsi (text representation)
- A. R standar (sama dengan asal)
- B. **R direfleksi horizontal (cermin kiri-kanan)** ✅
- C. R diputar 180°
- D. R diputar 90° searah jarum jam
- E. R diputar 90° berlawanan arah jarum jam

### Penjelasan singkat
Refleksi vertikal artinya gambar dibalik di sumbu vertikal — bagian kiri menjadi kanan dan sebaliknya. R yang direfleksi vertikal akan terlihat seperti R-terbalik kiri-kanan (kepala R ke kiri).

### Penjelasan panjang
Refleksi vertikal (atau "horizontal flip" — istilah ini bertukar tergantung referensi) adalah transformasi yang membalik gambar di sepanjang sumbu vertikal. Untuk huruf R, "tangan" R yang biasanya menghadap kanan akan berpindah ke kiri. Pilihan B paling tepat. Pilihan C (rotasi 180°) menghasilkan R yang juga terbalik atas-bawah. Pilihan D dan E adalah rotasi yang berbeda dari refleksi.

### Sumber
Pola figural refleksi cermin

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 15

**Kategori:** TIU / Figural / Rotasi
**Difficulty:** ③ medium-hard
**Tag:** `tiu`, `figural`, `rotasi`, `180-derajat`
**Family:** TIU_FIGURAL_ROTASI_FAMILY
**Enemy group candidate:** TIU_FIGURAL_ROTASI_180_001

### Stem
Berikut gambar awal. Manakah pilihan yang merupakan hasil rotasi 180°?

```image_prompt
Original: arrow pointing up-right diagonal (45°)
Cell A: arrow pointing up-right (same as original)
Cell B: arrow pointing down-left (180° rotation)
Cell C: arrow pointing up-left (mirrored)
Cell D: arrow pointing down-right
Cell E: arrow pointing right (90° rotation only)
Style: clean simple arrows
```

### Opsi (text representation)
- A. Panah ke atas-kanan (sama)
- B. **Panah ke bawah-kiri** ✅
- C. Panah ke atas-kiri
- D. Panah ke bawah-kanan
- E. Panah ke kanan

### Penjelasan singkat
Rotasi 180° membalik arah panah ke kebalikan persis. Panah ke atas-kanan → panah ke bawah-kiri.

### Penjelasan panjang
Rotasi 180° (atau "putaran setengah lingkaran") membalik orientasi gambar 180° — semua arah dibalik ke kebalikan. Untuk panah diagonal yang menunjuk ke atas-kanan (45°), rotasi 180° menghasilkan panah ke bawah-kiri (225°). Pilihan B paling tepat. Pilihan C dan D adalah refleksi (membalik di salah satu sumbu saja, bukan keduanya). Pilihan E hanya rotasi 90° atau 45°.

### Sumber
Pola figural rotasi 180°

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 16

**Kategori:** TIU / Figural / Simetri
**Difficulty:** ④ hard
**Tag:** `tiu`, `figural`, `simetri`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_SIMETRI_001

### Stem
Bentuk berikut memiliki sumbu simetri sebanyak…

```image_prompt
Show: equilateral triangle (all sides and angles equal)
Style: clean black outline, white fill
```

### Opsi (text representation)
- A. 1
- B. 2
- C. **3** ✅
- D. 4
- E. Tak terhingga

### Penjelasan singkat
Segitiga sama sisi memiliki 3 sumbu simetri yang masing-masing menghubungkan satu sudut ke titik tengah sisi di seberangnya.

### Penjelasan panjang
Sumbu simetri adalah garis yang membagi bentuk menjadi dua bagian yang merupakan refleksi cermin satu sama lain. Untuk segitiga sama sisi (equilateral), terdapat 3 sumbu simetri: setiap sudut segitiga memiliki garis yang menghubungkannya ke titik tengah sisi yang berseberangan, dan garis ini membagi segitiga menjadi dua bagian yang sebangun. Bandingkan dengan: persegi (4 sumbu), persegi panjang (2 sumbu), lingkaran (tak terhingga sumbu), segitiga sembarang (umumnya 0 sumbu).

### Sumber
Geometri SMP — Sumbu simetri

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 17

**Kategori:** TIU / Figural / Logika Visual
**Difficulty:** ④ hard
**Tag:** `tiu`, `figural`, `lipatan-kertas`, `logika-visual`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_LIPATAN_KERTAS_001

### Stem
Sehelai kertas dilipat dua kali (sekali horizontal lalu sekali vertikal). Kemudian dilubangi dengan satu lubang di sudut kanan atas hasil lipatan. Saat dibuka, berapa lubang yang muncul?

```image_prompt
Step 1: rectangular paper unfolded
Step 2: paper folded in half horizontally
Step 3: paper folded again vertically (now 1/4 of original)
Step 4: a small circle (hole) drawn in the top-right corner of the folded paper
Question mark on the unfolded final state
Style: simple line art showing fold lines and hole positions
```

### Opsi (text representation)
- A. 1 lubang
- B. 2 lubang
- C. 3 lubang
- D. **4 lubang** ✅
- E. 8 lubang

### Penjelasan singkat
Setiap kali kertas dilipat, jumlah lapisan menjadi 2x. Dua lipatan → 4 lapisan. Satu lubang menembus 4 lapisan = 4 lubang saat dibuka.

### Penjelasan panjang
Saat kertas dilipat horizontal, terbentuk 2 lapisan. Dilipat lagi vertikal, terbentuk 4 lapisan (2 × 2). Satu lubang yang dibuat menembus semua lapisan, sehingga saat kertas dibuka kembali, akan ada 4 lubang yang terdistribusi simetris (di 4 sudut "kuadran" yang dibentuk oleh garis lipatan). Aturan umum: jika kertas dilipat n kali, lapisan = 2^n. Satu lubang akan menjadi 2^n lubang saat dibuka. Untuk 2 lipatan: 2² = 4 lubang.

### Sumber
Logika visual — Lipatan kertas

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Soal 18

**Kategori:** TIU / Figural / Pola Kelipatan
**Difficulty:** ④ hard
**Tag:** `tiu`, `figural`, `pola-kelipatan`, `seri-grid`
**Family:** -
**Enemy group candidate:** TIU_FIGURAL_KELIPATAN_001

### Stem
Lanjutkan pola.

```image_prompt
Layout: row of 5 cells, each containing dots in a triangular arrangement
Cell 1: 1 dot (top)
Cell 2: 3 dots (1 top + 2 bottom forming a triangle)
Cell 3: 6 dots (1 + 2 + 3 forming a larger triangle)
Cell 4: 10 dots (1 + 2 + 3 + 4 forming an even larger triangle)
Cell 5 (?): empty placeholder
Style: black dots arranged in triangular pattern, clean white background
```

### Opsi (text representation)
- A. 12 titik
- B. 13 titik
- C. 14 titik
- D. **15 titik** ✅
- E. 16 titik

### Penjelasan singkat
Pola bilangan segitiga: 1, 3, 6, 10, … rumus n(n+1)/2. Cell 5: 5×6/2 = 15.

### Penjelasan panjang
Pola yang muncul adalah bilangan segitiga (triangular numbers). Rumus untuk bilangan segitiga ke-n: T_n = n(n+1)/2. Verifikasi: T_1 = 1, T_2 = 3, T_3 = 6, T_4 = 10, T_5 = 15. Atau pola tambahan: cell n berisi cell sebelumnya + n. T_5 = 10 + 5 = 15. Pola ini muncul di banyak konteks: hitungan domino, susunan bowling pin, segitiga Pascal baris pertama setelah 1.

### Sumber
Matematika SMA — Bilangan segitiga; pola figural

### Reviewer note
**[ ] Accept**  **[ ] Edit**  **[ ] Reject**

Catatan:
> _____

---

## Catatan reviewer

| Pertanyaan reviewer | Status |
|---|---|
| Image prompt cukup deskriptif untuk generate gambar? | _____ |
| Apakah ada pola yang ambigu / interpretasinya beda? | _____ |
| Distractor seimbang? | _____ |
| Difficulty rating sudah pas? | _____ |
