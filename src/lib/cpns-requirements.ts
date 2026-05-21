/**
 * CPNS 2026 requirements & documents — content data.
 *
 * Sourced from:
 *   - Permenpan-RB No. 6 Tahun 2024, Pasal 23 ayat (1)
 *     (Pengadaan Pegawai Aparatur Sipil Negara)
 *   - Buku Petunjuk Pendaftaran Calon ASN Tahun 2024 (BKN)
 *   - SSCASN BKN portal documentation
 *   - detikSulsel 9 Apr 2026 (cite Permenpan-RB)
 *   - detikJatim 18 May 2026 (cite SSCASN flow)
 *
 * Kept separate from src/lib/i18n.ts because the content is
 * domain-heavy and would inflate the dict file. Locale-aware via
 * the `getRequirements(locale)` helper.
 */

import type { Locale } from "@/lib/i18n"

export type RequirementItem = {
  id: string
  title: string
  detail?: string
}

export type DocumentItem = {
  id: string
  name: string
  detail?: string
  conditional?: boolean
}

export type StepItem = {
  id: string
  title: string
  detail: string
}

export type RequirementsContent = {
  pageEyebrow: string
  pageTitle: string
  pageSubtitle: string

  // Section: legal basis
  legalEyebrow: string
  legalTitle: string
  legalBody: string

  // Section: general requirements
  generalEyebrow: string
  generalTitle: string
  generalIntro: string
  generalItems: ReadonlyArray<RequirementItem>

  // Section: required documents
  documentsEyebrow: string
  documentsTitle: string
  documentsIntro: string
  documentsItems: ReadonlyArray<DocumentItem>
  documentsNote: string

  // Section: registration steps (SSCASN flow)
  flowEyebrow: string
  flowTitle: string
  flowIntro: string
  flowSteps: ReadonlyArray<StepItem>

  // Section: disqualifying conditions
  disqualifyEyebrow: string
  disqualifyTitle: string
  disqualifyItems: ReadonlyArray<RequirementItem>

  // Final note
  finalNoteEyebrow: string
  finalNoteTitle: string
  finalNoteBody: string
  ctaTryout: string
  ctaSscasn: string

  // Source attribution
  sourcesTitle: string
  sources: ReadonlyArray<{ label: string; url: string }>
}

const id: RequirementsContent = {
  pageEyebrow: "PERSIAPAN PENDAFTARAN",
  pageTitle: "Syarat & dokumen pendaftaran CPNS",
  pageSubtitle:
    "Rangkuman lengkap berdasarkan Permenpan-RB No. 6 Tahun 2024 dan panduan resmi SSCASN. Persyaratan inti ini relatif stabil dari tahun ke tahun, jadi siapkan sejak dini.",

  legalEyebrow: "DASAR HUKUM",
  legalTitle: "Mengacu pada peraturan resmi",
  legalBody:
    "Seluruh persyaratan di halaman ini dirangkum dari Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Permenpan-RB) Nomor 6 Tahun 2024 tentang Pengadaan Pegawai Aparatur Sipil Negara, terutama Pasal 23 ayat (1), serta Buku Petunjuk Pendaftaran Calon ASN BKN. Detail spesifik dapat berbeda mengikuti pengumuman resmi tiap instansi pada saat seleksi CPNS 2026 dibuka.",

  generalEyebrow: "SYARAT UMUM",
  generalTitle: "Sembilan kriteria wajib pelamar",
  generalIntro:
    "Pelamar harus memenuhi seluruh kriteria berikut pada saat melamar. Kriteria ini berlaku nasional, lalu setiap instansi dapat menambahkan persyaratan khusus sesuai jabatannya.",
  generalItems: [
    {
      id: "wni",
      title: "Warga Negara Indonesia",
      detail: "Berusia minimal 18 tahun dan maksimal 35 tahun pada saat melamar.",
    },
    {
      id: "no-pidana",
      title: "Tidak pernah dipidana",
      detail:
        "Bebas dari pidana penjara berdasarkan putusan pengadilan yang berkekuatan hukum tetap atas tindak pidana dengan ancaman 2 tahun atau lebih.",
    },
    {
      id: "no-diberhentikan",
      title: "Tidak pernah diberhentikan",
      detail:
        "Tidak pernah diberhentikan dengan hormat tidak atas permintaan sendiri atau tidak dengan hormat sebagai PNS, PPPK, TNI, POLRI, maupun pegawai swasta.",
    },
    {
      id: "no-aktif",
      title: "Tidak berstatus aktif",
      detail:
        "Bukan calon PNS, PNS, prajurit TNI, atau anggota POLRI pada saat melamar.",
    },
    {
      id: "no-partai",
      title: "Tidak berafiliasi partai politik",
      detail:
        "Tidak menjadi anggota atau pengurus partai politik dan tidak terlibat politik praktis.",
    },
    {
      id: "pendidikan",
      title: "Memenuhi kualifikasi pendidikan",
      detail:
        "Lulus jenjang pendidikan yang dipersyaratkan jabatan, dengan akreditasi kampus/program studi sesuai ketentuan.",
    },
    {
      id: "kompetensi",
      title: "Memiliki kompetensi profesi (jika diminta)",
      detail:
        "Sertifikasi keahlian masih berlaku dari lembaga profesi berwenang untuk jabatan yang mempersyaratkannya, misalnya STR untuk tenaga kesehatan.",
    },
    {
      id: "sehat",
      title: "Sehat jasmani dan rohani",
      detail:
        "Sesuai persyaratan jabatan yang dilamar, dibuktikan dengan surat keterangan sehat dari fasilitas kesehatan resmi.",
    },
    {
      id: "penempatan",
      title: "Bersedia ditempatkan di seluruh wilayah NKRI",
      detail:
        "Termasuk penempatan luar negeri sesuai ketentuan instansi, dibuktikan dengan surat pernyataan kesediaan penempatan.",
    },
  ],

  documentsEyebrow: "DOKUMEN PENDAFTARAN",
  documentsTitle: "Berkas yang perlu disiapkan",
  documentsIntro:
    "Mengacu pada Buku Petunjuk Pendaftaran Calon ASN BKN, dokumen berikut umumnya wajib disiapkan dalam format digital sebelum pendaftaran dibuka. Sebagian bersifat kondisional — hanya dipersyaratkan untuk formasi tertentu.",
  documentsItems: [
    {
      id: "ktp",
      name: "KTP elektronik",
      detail:
        "Asli dan masih berlaku. Bila belum tercetak, gunakan Surat Keterangan dari Disdukcapil sebagai pengganti sementara.",
    },
    {
      id: "kk",
      name: "Kartu Keluarga (KK)",
      detail: "Salinan terbaru yang menampilkan nama pelamar.",
    },
    {
      id: "ijazah",
      name: "Ijazah asli",
      detail:
        "Sesuai jenjang pendidikan terakhir dan kualifikasi yang dipersyaratkan instansi pelamaran.",
    },
    {
      id: "transkrip",
      name: "Transkrip nilai asli",
      detail:
        "Pastikan IPK terbaca jelas; sebagian instansi menetapkan IPK minimum sebagai syarat tambahan.",
    },
    {
      id: "pas-foto",
      name: "Pas foto terbaru",
      detail:
        "Latar belakang merah, mengenakan pakaian formal, ukuran sesuai panduan SSCASN (umumnya 200 KB).",
    },
    {
      id: "swafoto",
      name: "Swafoto memegang KTP",
      detail:
        "Diambil saat pendaftaran SSCASN sebagai validasi identitas wajah.",
    },
    {
      id: "lamaran",
      name: "Surat lamaran",
      detail:
        "Format disediakan oleh instansi yang dilamar; ditandatangani di atas materai sesuai instruksi.",
    },
    {
      id: "pernyataan",
      name: "Surat pernyataan",
      detail:
        "Format disediakan instansi, mencakup pernyataan kesediaan penempatan, kebenaran data, dan tidak terikat ikatan dinas lain.",
    },
    {
      id: "akreditasi",
      name: "Akreditasi kampus / prodi",
      detail:
        "Tangkapan layar atau salinan dokumen akreditasi yang valid pada saat ijazah diterbitkan.",
    },
    {
      id: "toefl",
      name: "Sertifikat TOEFL / kemampuan bahasa",
      conditional: true,
      detail:
        "Hanya untuk formasi yang mensyaratkan kemampuan bahasa asing (umumnya luar negeri atau hubungan internasional).",
    },
    {
      id: "str",
      name: "Surat Tanda Registrasi (STR)",
      conditional: true,
      detail:
        "Wajib untuk formasi tenaga kesehatan (dokter, perawat, bidan, apoteker, dll.) sesuai profesinya.",
    },
    {
      id: "khusus",
      name: "Dokumen pendukung lain",
      conditional: true,
      detail:
        "Sesuai formasi: sertifikat keahlian, surat keterangan disabilitas, sertifikat keahlian khusus, dan dokumen lainnya yang diminta instansi.",
    },
  ],
  documentsNote:
    "Pastikan setiap berkas dipindai dengan kualitas baik dan ukuran sesuai batas yang ditetapkan SSCASN. Gunakan format PDF atau JPG/JPEG sesuai instruksi setiap kolom unggah.",

  flowEyebrow: "ALUR PENDAFTARAN",
  flowTitle: "Langkah pendaftaran di SSCASN",
  flowIntro:
    "Seluruh pendaftaran dilakukan melalui portal resmi sscasn.bkn.go.id. Berikut alur umum yang berlaku setiap periode seleksi.",
  flowSteps: [
    {
      id: "akun",
      title: "Buat akun SSCASN",
      detail:
        "Lengkapi NIK, nomor KK, biodata dasar, dan email aktif. Buat kata sandi yang kuat serta pertanyaan pengaman. Unggah foto KTP dan lakukan swafoto sesuai panduan.",
    },
    {
      id: "kartu-info",
      title: "Cetak Kartu Informasi Akun",
      detail:
        "Setelah akun terverifikasi, unduh dan simpan Kartu Informasi Akun sebagai bukti registrasi.",
    },
    {
      id: "biodata",
      title: "Lengkapi biodata pelamar",
      detail:
        "Login kembali, isi biodata lanjutan: alamat lengkap, riwayat pendidikan, dan informasi kontak darurat.",
    },
    {
      id: "pilih-formasi",
      title: "Pilih jenis seleksi & formasi",
      detail:
        "Pilih jenis seleksi 'CPNS' lalu tentukan formasi dan jabatan target. Perhatikan kualifikasi, IPK minimum, dan persyaratan khusus tiap formasi.",
    },
    {
      id: "unggah-dokumen",
      title: "Unggah dokumen persyaratan",
      detail:
        "Lampirkan seluruh berkas wajib dan kondisional yang diminta instansi. Periksa preview tiap dokumen sebelum mengunci.",
    },
    {
      id: "resume",
      title: "Susun resume pendaftaran",
      detail:
        "SSCASN akan menyusun resume otomatis berdasarkan biodata dan dokumen yang diunggah. Periksa ulang setiap baris sebelum mengirim.",
    },
    {
      id: "kartu-pendaftaran",
      title: "Cetak Kartu Pendaftaran",
      detail:
        "Setelah submit, unduh Kartu Pendaftaran sebagai bukti resmi. Pelamar tidak dapat mengubah pilihan formasi setelah tahap ini.",
    },
    {
      id: "pantau",
      title: "Pantau hasil seleksi administrasi",
      detail:
        "Panitia akan memverifikasi data dalam beberapa hari kerja. Jika terdapat kekeliruan, manfaatkan masa sanggah pada periode yang ditentukan.",
    },
  ],

  disqualifyEyebrow: "FAKTOR DISKUALIFIKASI",
  disqualifyTitle: "Hal yang membatalkan kelulusan",
  disqualifyItems: [
    {
      id: "data-palsu",
      title: "Memberikan data atau dokumen palsu",
      detail:
        "Pemalsuan ijazah, transkrip, identitas, atau surat pernyataan dapat berujung pidana dan blacklist seleksi ASN.",
    },
    {
      id: "ganda",
      title: "Mendaftar di lebih dari satu instansi atau formasi",
      detail:
        "Pelamar hanya boleh memilih satu jenis seleksi dan satu jabatan dalam satu periode rekrutmen.",
    },
    {
      id: "tidak-hadir",
      title: "Tidak hadir tahapan seleksi",
      detail:
        "Ketidakhadiran SKD/SKB tanpa alasan resmi yang dapat diterima panitia akan menggugurkan kelulusan.",
    },
    {
      id: "tindakan-curang",
      title: "Melakukan kecurangan saat ujian",
      detail:
        "Termasuk komunikasi tidak sah, membawa perangkat terlarang, atau mewakilkan ujian kepada pihak lain.",
    },
  ],

  finalNoteEyebrow: "LANGKAH BERIKUTNYA",
  finalNoteTitle: "Sambil menunggu pengumuman resmi",
  finalNoteBody:
    "Selagi menyiapkan berkas, gunakan tryout SKD Cita untuk mengasah materi TWK, TIU, dan TKP. Setiap soal dibantu penjelasan AI yang tetap konsisten dengan kisi-kisi resmi pemerintah.",
  ctaTryout: "Coba Tryout Sekarang",
  ctaSscasn: "Buka Portal SSCASN",

  sourcesTitle: "Sumber",
  sources: [
    {
      label: "Permenpan-RB No. 6 Tahun 2024",
      url: "https://peraturan.bpk.go.id/Details/293717/permen-pan-rb-no-6-tahun-2024",
    },
    {
      label: "Portal SSCASN BKN",
      url: "https://sscasn.bkn.go.id/",
    },
    {
      label: "Situs resmi BKN",
      url: "https://www.bkn.go.id/",
    },
    {
      label: "Situs resmi KemenPAN-RB",
      url: "https://www.menpan.go.id/",
    },
  ],
}

const en: RequirementsContent = {
  pageEyebrow: "REGISTRATION READINESS",
  pageTitle: "CPNS registration: requirements & documents",
  pageSubtitle:
    "A complete summary based on Permenpan-RB Regulation No. 6 of 2024 and the official SSCASN guide. Core requirements stay stable year over year, so prepare early.",

  legalEyebrow: "LEGAL BASIS",
  legalTitle: "Grounded in official regulation",
  legalBody:
    "All requirements on this page are summarised from Indonesian Ministerial Regulation Permenpan-RB No. 6 of 2024 on the Procurement of State Civil Apparatus, particularly Article 23 paragraph (1), as well as the BKN Candidate Registration Handbook. Specific details may vary across each agency's official announcement when CPNS 2026 opens.",

  generalEyebrow: "GENERAL REQUIREMENTS",
  generalTitle: "Nine mandatory criteria",
  generalIntro:
    "Applicants must meet every criterion at the time of application. These apply nationwide; each agency may add role-specific extras.",
  generalItems: [
    {
      id: "wni",
      title: "Indonesian citizenship",
      detail: "Aged between 18 and 35 years old at the time of application.",
    },
    {
      id: "no-pidana",
      title: "No criminal record",
      detail:
        "No prison conviction with permanent legal force for an offence carrying a sentence of 2 years or more.",
    },
    {
      id: "no-diberhentikan",
      title: "No prior dismissal",
      detail:
        "Never honourably dismissed against own request, dishonourably dismissed as a civil servant, contract worker, military member, police officer, or private-sector employee.",
    },
    {
      id: "no-aktif",
      title: "Not currently a state employee",
      detail:
        "Not actively serving as a candidate civil servant, civil servant, military, or police member at the time of application.",
    },
    {
      id: "no-partai",
      title: "No political party affiliation",
      detail:
        "Not a member or executive of any political party and not engaged in active political practice.",
    },
    {
      id: "pendidikan",
      title: "Required education qualification",
      detail:
        "Holds the academic level required by the position, with proper accreditation of the institution and study programme.",
    },
    {
      id: "kompetensi",
      title: "Professional competence (when required)",
      detail:
        "Valid professional certification from an authorised body for positions that require it (e.g. STR for healthcare workers).",
    },
    {
      id: "sehat",
      title: "Physically and mentally fit",
      detail:
        "As required by the role, evidenced by a health certificate from an official medical facility.",
    },
    {
      id: "penempatan",
      title: "Willing to be posted nationwide",
      detail:
        "Including overseas postings as the agency requires, supported by a signed placement-readiness statement.",
    },
  ],

  documentsEyebrow: "REQUIRED DOCUMENTS",
  documentsTitle: "Files to prepare in advance",
  documentsIntro:
    "Per the BKN Candidate Registration Handbook, the following documents are typically required in digital form before registration opens. Some are conditional and only apply to specific positions.",
  documentsItems: [
    {
      id: "ktp",
      name: "Indonesian e-ID (KTP)",
      detail:
        "Original and valid. If not yet printed, an interim certificate from Disdukcapil is acceptable.",
    },
    {
      id: "kk",
      name: "Family card (KK)",
      detail: "Latest copy showing the applicant's name.",
    },
    {
      id: "ijazah",
      name: "Original diploma",
      detail:
        "Matching the latest level of education and qualifications required by the agency.",
    },
    {
      id: "transkrip",
      name: "Original academic transcript",
      detail:
        "Ensure the GPA is clearly readable; some agencies set a minimum GPA threshold.",
    },
    {
      id: "pas-foto",
      name: "Recent passport photo",
      detail:
        "Red background, formal attire, file size per SSCASN guidance (typically 200 KB).",
    },
    {
      id: "swafoto",
      name: "Selfie holding KTP",
      detail:
        "Captured during SSCASN registration as identity verification.",
    },
    {
      id: "lamaran",
      name: "Application letter",
      detail:
        "Template provided by the destination agency, signed on stamp duty as instructed.",
    },
    {
      id: "pernyataan",
      name: "Statement letter",
      detail:
        "Agency-issued template covering placement-readiness, data accuracy, and absence of binding service obligations.",
    },
    {
      id: "akreditasi",
      name: "Institutional / programme accreditation",
      detail:
        "Screenshot or copy of the valid accreditation document at the time the diploma was issued.",
    },
    {
      id: "toefl",
      name: "Language proficiency certificate",
      conditional: true,
      detail:
        "Only required for positions that mandate language proficiency (typically overseas or international affairs roles).",
    },
    {
      id: "str",
      name: "Professional Registration Letter (STR)",
      conditional: true,
      detail:
        "Mandatory for healthcare positions (doctor, nurse, midwife, pharmacist, etc.) according to profession.",
    },
    {
      id: "khusus",
      name: "Other supporting documents",
      conditional: true,
      detail:
        "Per role: skill certifications, disability certificates, special accreditations, and any extra documents the agency requests.",
    },
  ],
  documentsNote:
    "Scan every document in clear quality and within the file-size limits set by SSCASN. Use PDF or JPG/JPEG as instructed for each upload field.",

  flowEyebrow: "REGISTRATION FLOW",
  flowTitle: "Step-by-step on SSCASN",
  flowIntro:
    "All registration is carried out via sscasn.bkn.go.id. Below is the standard flow used in every recent recruitment cycle.",
  flowSteps: [
    {
      id: "akun",
      title: "Create your SSCASN account",
      detail:
        "Provide your national ID, family card number, basic profile, and a working email. Set a strong password and security question. Upload a KTP photo and selfie per the guidance.",
    },
    {
      id: "kartu-info",
      title: "Print the Account Information Card",
      detail:
        "Once verified, download and store the Account Information Card as proof of registration.",
    },
    {
      id: "biodata",
      title: "Complete the applicant profile",
      detail:
        "Sign back in and fill out the extended profile: full address, education history, and emergency contact information.",
    },
    {
      id: "pilih-formasi",
      title: "Pick selection type & position",
      detail:
        "Choose 'CPNS' as the selection type and pick the target position. Mind the qualifications, minimum GPA, and any role-specific extras.",
    },
    {
      id: "unggah-dokumen",
      title: "Upload all required documents",
      detail:
        "Attach every required and conditional file the agency asks for. Preview each upload before locking it in.",
    },
    {
      id: "resume",
      title: "Compile the registration summary",
      detail:
        "SSCASN will generate the summary automatically from your profile and uploads. Double-check every line before submitting.",
    },
    {
      id: "kartu-pendaftaran",
      title: "Print the Registration Card",
      detail:
        "After submitting, download the Registration Card as your official record. Position choice cannot be changed after this step.",
    },
    {
      id: "pantau",
      title: "Watch the administrative result",
      detail:
        "The committee will verify your data within a few business days. Use the appeal window if you find any errors.",
    },
  ],

  disqualifyEyebrow: "DISQUALIFYING FACTORS",
  disqualifyTitle: "What can void your acceptance",
  disqualifyItems: [
    {
      id: "data-palsu",
      title: "Submitting false data or documents",
      detail:
        "Forged diplomas, transcripts, identity, or statements can lead to criminal charges and a blacklist from civil-service selection.",
    },
    {
      id: "ganda",
      title: "Registering at multiple agencies or positions",
      detail:
        "An applicant may pick only one selection type and one position per recruitment cycle.",
    },
    {
      id: "tidak-hadir",
      title: "Missing a selection stage",
      detail:
        "Failing to attend SKD/SKB without a reason accepted by the committee voids the application.",
    },
    {
      id: "tindakan-curang",
      title: "Cheating during the exam",
      detail:
        "Includes unauthorised communication, prohibited devices, or asking another person to take the exam on your behalf.",
    },
  ],

  finalNoteEyebrow: "NEXT STEP",
  finalNoteTitle: "While you wait for the official announcement",
  finalNoteBody:
    "While preparing your documents, use Cita's SKD tryout to sharpen the TWK, TIU, and TKP material. Each question comes with an AI explanation aligned with the official curriculum.",
  ctaTryout: "Try the Tryout",
  ctaSscasn: "Open SSCASN Portal",

  sourcesTitle: "Sources",
  sources: [
    {
      label: "Permenpan-RB Regulation No. 6 of 2024",
      url: "https://peraturan.bpk.go.id/Details/293717/permen-pan-rb-no-6-tahun-2024",
    },
    {
      label: "SSCASN BKN portal",
      url: "https://sscasn.bkn.go.id/",
    },
    {
      label: "BKN official website",
      url: "https://www.bkn.go.id/",
    },
    {
      label: "KemenPAN-RB official website",
      url: "https://www.menpan.go.id/",
    },
  ],
}

const all = { id, en } as const

export function getRequirements(locale: Locale): RequirementsContent {
  return all[locale]
}
