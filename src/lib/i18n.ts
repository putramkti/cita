/**
 * Lightweight i18n for Cita.
 *
 * Scope: UI chrome (navigation, page copy, buttons, labels).
 * Out of scope: SKD question content (always Indonesian — that's the actual
 * exam material; reviewers see the "Indonesian Civil Service Exam Question"
 * label that signals authenticity).
 *
 * Usage:
 *   const t = await getDict()        // server component
 *   t.landing.heroTitle              // typed string
 *
 * Locale flow:
 *   1. Cookie `cita_locale` = "id" | "en" -> use that
 *   2. Otherwise default "id"
 *   3. Toggle = client-side cookie write, then router.refresh()
 */

import { cookies } from "next/headers"

export const SUPPORTED_LOCALES = ["id", "en"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "id"
export const LOCALE_COOKIE = "cita_locale"

const dictionaries = {
  id: {
    locale: "id" as const,
    nav: {
      tryout: "Tryout",
      leaderboard: "Peringkat",
      about: "Tentang",
      requirements: "Syarat",
      pricing: "Harga",
      start: "Mulai",
      login: "Log In",
      backHome: "Kembali ke beranda",
    },
    header: {
      tagline: "Tenang, fokus, akurat",
    },
    footer: {
      tagline: "Tenang, fokus, akurat",
      excellence: "Excellence through discipline. Media latihan SKD CPNS yang fokus pada ketenangan kognitif.",
      copyright: "Cita Academic. Hak cipta dilindungi.",
      resourcesTitle: "Sumber",
      legalTitle: "Legalitas",
      methodology: "Metodologi",
      privacy: "Privasi",
      terms: "Ketentuan",
      about: "Tentang",
      requirements: "Syarat & Dokumen",
      disclaimer: "Cita tidak berafiliasi dengan BKN, FHCI, atau lembaga pemerintah lainnya.",
    },
    landing: {
      heroEyebrow: "Sesi Latihan SKD CPNS Dibuka",
      heroPillIcon: "live",
      heroTitle: "Wujudkan Cita-cita jadi ASN,",
      heroTitleItalic: "dimulai dari sini.",
      heroSubtitle:
        "Latihan SKD 30 soal dalam 30 menit. Tiap soal punya pembahasan AI mendalam — Anda bisa tanya lebih lanjut sampai paham.",
      ctaStart: "Mulai Tryout Gratis",
      ctaLeaderboard: "Lihat Metodologi Kami",

      // Two-column feature cards (anonymous + AI mentor)
      privacyCardEyebrow: "PRIVACY FIRST",
      privacyCardTitle: "Anonymous-First Prep",
      privacyCardBody:
        "Cita dirancang untuk dapat digunakan tanpa pendaftaran akun. Mode tamu (Guest) tersedia untuk simulasi cepat tanpa jejak digital.",
      privacyCardCheck1: "Tanpa pelacakan media sosial",
      privacyCardCheck2: "Mode Guest untuk simulasi cepat",

      mentorCardEyebrow: "CITA TUTOR 24/7",
      mentorCardTitle: "Bimbingan Mendalam & Personal",
      mentorCardBody:
        "Tutor AI siap membahas alasan jawaban benar dan salah, kapan pun Anda perlu, langsung dari halaman soal.",
      mentorCardChat1Q:
        "Mengapa jawaban D salah pada soal TIU Logika tersebut?",
      mentorCardChat1A:
        "Pada soal logika ini, opsi D mengandung kontradiksi premis. Mari saya uraikan langkah deduksinya...",

      // Simulation showcase
      showcaseTitle: "Simulasi yang",
      showcaseTitleItalic: "Identik",
      showcaseTitleAfter: "dengan CAT BKN.",
      showcaseBody:
        "Antarmuka simulasi Cita merepresentasikan Computer Assisted Test (CAT) BKN: timer, jumlah soal, dan tata letak tombol disusun semirip mungkin agar pengalaman ujian terasa familiar saat hari H.",
      showcaseFeat1Title: "Manajemen Waktu",
      showcaseFeat1Body:
        "Timer terlihat sepanjang sesi. Anda dapat menandai soal dan kembali ke soal yang dilewati.",
      showcaseFeat2Title: "Skor Langsung",
      showcaseFeat2Body:
        "Skor per subtes dihitung otomatis. Bandingkan dengan ambang batas resmi BKN.",
      showcaseMockTitle: "Pratinjau Simulasi",
      showcaseMockSubtitle: "Klik untuk membuka",
      showcaseBadge: "ANTARMUKA IDENTIK",
      sim: {
        testTitle: "CPNS 2024 · SIMULASI TIU",
        startTest: "Mulai Tes",
        modeLabel: "MODE SIMULASI",
        timeRemainingLabel: "WAKTU TERSISA",
        questionMeta: "TIU · ANALOGI VERBAL",
        questionStem: "Cahaya : Terang = ... : ...",
        options: [
          "Air : Basah",
          "Api : Panas",
          "Makan : Lapar",
          "Haus : Minum",
          "Mata : Lihat",
        ],
        optionLabels: ["A", "B", "C", "D", "E"],
        previous: "Sebelumnya",
        next: "Lanjut",
        markReview: "Tandai untuk Review",
        submit: "Kumpulkan",
        quote: "Sukses adalah akumulasi usaha kecil yang diulang setiap hari.",
        toolsAi: "Tutor AI",
        toolsNotes: "Catatan",
        toolsCalc: "Kalkulator",
        tabOverview: "Ringkasan",
        tabTwk: "TWK",
        tabTiu: "TIU",
        tabTkp: "TKP",
      },
      showcaseQuestionLabel: "NOMOR SOAL: 42",

      // Final CTA section
      finalCtaTitle: "Mulai perjalanan",
      finalCtaTitleItalic: "menuju NIP Anda",
      finalCtaTitleAfter: "hari ini.",
      finalCtaSubtitle:
        "Tanpa pendaftaran. Tanpa biaya. Buka tryout langsung di peramban Anda.",
      finalCtaButton: "Mulai Sekarang",

      // CPNS 2026 timeline section — hard-coded estimates based on
      // detikJatim 18-05-2026 and detikJateng 12-05-2026 reporting
      // of statements from BKN (Plt Direktur Perencanaan ASN) and
      // Menteri PANRB Rini Widyantini. Update as soon as the
      // official BKN schedule is released.
      timelineEyebrow: "JADWAL CPNS 2026",
      timelineTitle: "Linimasa rekrutmen CPNS 2026",
      timelineSubtitle:
        "Estimasi tahapan berdasarkan pernyataan resmi BKN dan KemenPAN-RB. Jadwal final menunggu pengumuman resmi pemerintah.",
      timelineProgressLabel: "Progres tahapan",
      timelineLegendDone: "Selesai",
      timelineLegendActive: "Berlangsung",
      timelineLegendUpcoming: "Akan datang",
      timelineSourceLabel:
        "Sumber: BKN · KemenPAN-RB · per 21 Mei 2026",
      timelineStages: [
        {
          id: "perencanaan",
          label: "Penyusunan Formasi",
          period: "Apr–Mei 2026",
          status: "active",
        },
        {
          id: "pengumuman",
          label: "Pengumuman Formasi",
          period: "Jun 2026",
          status: "upcoming",
        },
        {
          id: "pendaftaran",
          label: "Pendaftaran SSCASN",
          period: "Jun–Jul 2026",
          status: "upcoming",
        },
        {
          id: "administrasi",
          label: "Seleksi Administrasi",
          period: "Jul–Agu 2026",
          status: "upcoming",
        },
        {
          id: "skd",
          label: "SKD",
          period: "Sep–Okt 2026",
          status: "upcoming",
        },
        {
          id: "skb",
          label: "SKB",
          period: "Nov–Des 2026",
          status: "upcoming",
        },
        {
          id: "pengumuman-akhir",
          label: "Pengumuman Akhir",
          period: "Jan 2027",
          status: "upcoming",
        },
        {
          id: "pelantikan",
          label: "Pemberkasan & Pelantikan",
          period: "Feb–Apr 2027",
          status: "upcoming",
        },
      ] as const,

      featuresTitle: "Apa yang Anda dapatkan",
      feat1Title: "30 soal kurasi AI",
      feat1Desc:
        "Soal TWK, TIU, TKP yang dirancang merepresentasikan tipe soal SKD asli.",
      feat2Title: "Pembahasan AI per soal",
      feat2Desc:
        "Tiap soal punya pembahasan dari Claude Opus 4.7. Bingung? Tanya tutor AI.",
      feat3Title: "Peringkat anonim",
      feat3Desc:
        "Tanpa daftar akun. Ikut tryout, langsung tampil di peringkat.",
      bottomCtaTitle: "Siap mulai?",
      bottomCtaSubtitle:
        "Tanpa daftar. Tanpa biaya. Langsung kerjakan.",
    },
    tryout: {
      briefingTitle: "Pilih mode tryout Anda",
      briefingSubtitle: "Sesi singkat untuk latihan harian, atau simulasi penuh sebelum hari H. Pilih salah satu lalu baca petunjuk di bawah.",
      rule1: "30 soal dalam 30 menit (10 TWK, 10 TIU, 10 TKP).",
      rule2: "Anda bisa lompat antar soal dan mengubah jawaban kapan saja sebelum waktu habis.",
      rule3: "Jawaban tersimpan otomatis. Tutup tab? Tenang, lanjut nanti masih bisa.",
      rule4: "Setelah selesai, Anda bisa tanya tutor AI per soal (5 pertanyaan/soal).",
      startNow: "Mulai sekarang",
      legalNote: "Dengan memulai, Anda menyetujui",
      and: "dan",
      // In-progress tryout interface (Academic Zen layout)
      modeLabel: "MODE SIMULASI",
      timeRemainingLabel: "WAKTU TERSISA",
      overview: "Ringkasan",
      questionPanelLabel: "Soal",
      ofLabel: "dari",
      previous: "Sebelumnya",
      next: "Selanjutnya",
      markReview: "Tandai untuk Ditinjau",
      submit: "Submit Tryout",
      submitting: "Menghitung skor…",
      submittingTitle: "Menghitung jawaban Anda",
      submittingHint: "Mohon jangan menutup atau memuat ulang halaman.",
      questionUnavailable: "Soal tidak tersedia.",
      retry: "Coba mulai ulang",
      tools: "Alat Bantu",
      toolAi: "Tutor AI",
      toolNotes: "Catatan",
      toolCalc: "Kalkulator",
      toolsComingSoon: "Segera hadir",
      motivationalQuote:
        "“Kesuksesan adalah jumlah dari upaya kecil, diulang hari demi hari.”",
      answeredCount: "dijawab",
    },
    result: {
      title: "Hasil tryout Anda",
      // Academic Zen redesign keys
      eyebrow: "SIMULASI SELESAI",
      heroTitle: "Ringkasan Performa",
      totalScoreLabel: "SKOR TOTAL",
      passingStatusLabel: "STATUS KELULUSAN:",
      passingLulus: "LULUS",
      passingBelum: "BELUM LULUS",
      breakdownTitle: "Rincian per Subtes",
      targetLabel: "Ambang batas",
      criticalNote: "Skor di bawah ambang batas",
      itemAnalysisTitle: "Analisis Butir Soal",
      filterAll: "FILTER: SEMUA",
      filterCorrect: "FILTER: BENAR",
      filterWrong: "FILTER: SALAH",
      downloadReport: "UNDUH LAPORAN",
      tagCorrect: "BENAR",
      tagWrong: "SALAH",
      tagSkipped: "TIDAK DIJAWAB",
      askTutorCta: "Tanya Cita Tutor",
      viewAllPrefix: "Lihat semua",
      viewAllSuffix: "soal",
      ctaNextTitle: "Lanjut latihan?",
      ctaNextSubtitle: "Konsistensi setiap hari mengalahkan sesi maraton mingguan.",
      ctaStartNew: "Mulai tryout baru",
      ctaBackHome: "Kembali ke beranda",
      durationLabel: "Durasi",
      answeredLabel: "Dijawab",
      correctLabel: "Benar",
      // Pre-existing
      totalScore: "Skor total",
      passingHint: "Ambang batas resmi BKN: TWK 65, TIU 80, TKP 166.",
      reviewTitle: "Review per soal",
      askTutor: "Tanya Cita Tutor",
      backToHome: "Kembali ke beranda",
      shareScore: "Bagikan hasil",
      explanationLabel: "Penjelasan AI",
      disclaimer:
        "Pembahasan AI di-generate oleh Claude Opus 4.7 saat soal disusun, divalidasi tim Cita.",
      yourAnswer: "Jawaban Anda",
      correctAnswer: "Kunci",
      notAnswered: "Tidak dijawab",
    },
    study: {
      backToResult: "Kembali ke hasil",
      prevQuestion: "Soal sebelumnya",
      nextQuestion: "Soal selanjutnya",
      tutorName: "Cita Tutor",
      tutorTagline: "Diskusi soal ini dengan AI",
      remaining: "{n}/{max} pertanyaan hari ini",
      thinking: "Tutor sedang menyusun jawaban...",
      placeholder: "Tanya apa saja... (Enter untuk kirim, Shift+Enter untuk baris baru)",
      placeholderLimit: "Batas pertanyaan tercapai. Lanjut ke soal lain.",
      send: "Kirim",
      suggestionsTitle: "Saran pertanyaan",
      closeSuggestions: "Tutup saran pertanyaan",
      emptyTitle: "Tanya apa saja tentang soal ini.",
      emptySubtitle:
        "Tutor sudah tahu soal, kunci jawaban, dan jawaban Anda. Mulai dari saran cepat di bawah, atau ketik pertanyaan sendiri.",
      youLabel: "Anda",
      explanationLabel: "Penjelasan dasar",
      quickPrompts: {
        analogy: "Beri analogi sehari-hari",
        eli5: "Jelaskan untuk pemula",
        whyWrong: "Mengapa opsi lain salah?",
        realCase: "Berikan contoh kasus nyata",
      },
      quickPromptTexts: {
        analogy:
          "Tolong berikan analogi dari kehidupan sehari-hari agar konsep ini lebih mudah saya pahami.",
        eli5:
          "Mohon jelaskan ulang dengan bahasa yang lebih sederhana, seolah-olah sedang menjelaskan kepada siswa SMP.",
        whyWrong: "Mohon bahas satu per satu mengapa opsi-opsi yang salah itu kurang tepat.",
        realCase:
          "Mohon berikan satu sampai dua contoh kasus nyata di Indonesia yang mencerminkan jawaban yang benar.",
      },
    },
    leaderboard: {
      title: "Peringkat",
      subtitle: "10 skor tertinggi sepanjang masa",
      empty: "Belum ada peringkat. Jadi yang pertama!",
      rank: "Peringkat",
      participant: "Peserta",
      score: "Skor",
      duration: "Waktu",
      status: "Status",
      passed: "Lulus",
      notPassed: "Belum",
      ctaStart: "Mulai tryout",
      passingNote:
        "Catatan: status 'Lulus' mengikuti ambang batas BKN (TWK 65, TIU 80, TKP 166).",
    },
    common: {
      darkMode: "Mode gelap",
      lightMode: "Mode terang",
      languageToggle: "Bahasa",
    },
    about: {
      title: "Tentang Cita",
      subtitle:
        "Platform persiapan SKD CPNS berbasis AI: tryout terstruktur, pembahasan personal per soal, dan analisis hasil yang membantu Anda fokus pada kelemahan yang nyata.",
      whyTitle: "Mengapa Cita ada",
      why1:
        "Setiap siklus rekrutmen, jutaan pelamar bersaing memperebutkan formasi CPNS. Materi persiapan yang berkualitas kerap terkunci di balik biaya tinggi atau hanya disajikan sebagai pembahasan statis tanpa konteks pembelajaran yang memadai.",
      why2:
        "Cita menawarkan pendekatan berbeda. Anda dapat mengerjakan 30 soal dalam 30 menit, melihat skor secara objektif, dan mendiskusikan tiap soal langsung dengan tutor AI yang memahami konteks pertanyaan, jawaban yang Anda pilih, serta tingkat kesulitan soal — tanpa keharusan mendaftar, tanpa iklan, tanpa hambatan.",
      cardCalmTitle: "Tenang",
      cardCalmDesc:
        "Antarmuka dirancang minim distraksi. Tipografi nyaman dibaca, mode gelap dan terang, animasi hanya pada bagian yang membantu pemahaman.",
      cardFocusTitle: "Fokus",
      cardFocusDesc:
        "Satu sesi tryout berdurasi 30 soal × 30 menit. Cukup ringkas untuk dijalankan harian, cukup realistis untuk melatih ritme ujian sesungguhnya.",
      cardAccurateTitle: "Akurat",
      cardAccurateDesc:
        "Soal mengikuti pola SKD terkini. Pembahasan dasar dihasilkan oleh model penalaran tingkat lanjut dan ditinjau ulang sebelum tayang.",
      featuresTitle: "Yang Anda dapatkan di Cita",
      feat1Bold: "Tryout SKD lengkap.",
      feat1: "30 soal TWK, TIU, dan TKP dalam satu sesi 30 menit. Distribusi materi merujuk pada pedoman SKD CPNS yang berlaku saat ini.",
      feat2Bold: "Cita Tutor.",
      feat2: "Diskusi per soal dengan asisten AI yang sudah memahami konteks — soal, jawaban Anda, kunci, dan tingkat kesulitan. Pengguna gratis mendapat 5 pertanyaan tutor per hari, pelanggan Premium hingga 50 per hari.",
      feat3Bold: "Analisis hasil personal.",
      feat3: "Rangkuman performa berbasis AI untuk pelanggan Premium yang menyoroti kekuatan, area yang perlu dilatih, serta rekomendasi langkah lanjut yang dapat Anda kerjakan.",
      feat4Bold: "Riwayat dan statistik.",
      feat4: "Setiap tryout tersimpan otomatis. Anda dapat meninjau jawaban tiap soal, memantau akurasi per topik, dan melacak perkembangan dari waktu ke waktu.",
      feat5Bold: "Akses tanpa pendaftaran.",
      feat5: "Mulai tryout secara anonim dengan sesi yang terikat cookie peramban. Pendaftaran hanya diperlukan apabila Anda ingin menyinkronkan riwayat lintas perangkat atau berlangganan Premium.",
      feat6Bold: "Langganan ringan dengan voucher.",
      feat6: "Premium tersedia dengan harga yang terjangkau dan kode voucher dapat diterapkan di halaman checkout — baik untuk potongan parsial maupun akses gratis sesuai kebijakan promosi yang berlaku.",
      feat7Bold: "Bilingual dan multi-tema.",
      feat7: "Antarmuka tersedia dalam Bahasa Indonesia dan Inggris dengan mode terang dan gelap. Preferensi tersimpan pada peramban Anda.",
      feat8Bold: "Sumber terbuka.",
      feat8: "Kode aplikasi dipublikasikan di GitHub. Anda dapat membaca kode, melaporkan kekeliruan, atau mengusulkan kontribusi.",
      stackTitle: "Tumpukan teknologi",
      stackBody:
        "Next.js 16 (App Router), TypeScript, Tailwind CSS 4, dan shadcn/ui untuk antarmuka. Supabase Postgres dengan Prisma sebagai lapisan data, hosting Vercel di kawasan Singapura. Gateway LLM kompatibel OpenAI sehingga model yang melayani tutor dan analisis hasil dapat dipertukarkan tanpa mengubah kode aplikasi. Pembayaran diproses oleh Midtrans.",
      disclaimerTitle: "Pernyataan",
      disclaimerBody1Bold: "Cita adalah produk independen dan tidak berafiliasi dengan, tidak didukung oleh, serta tidak dioperasikan atas nama Badan Kepegawaian Negara (BKN), Kementerian PANRB, atau lembaga pemerintah Republik Indonesia mana pun.",
      disclaimerBody2:
        "Soal di Cita disusun untuk keperluan latihan dan tidak merepresentasikan ujian SKD CPNS resmi. Skor di Cita bukan jaminan kelulusan seleksi resmi. Untuk informasi otoritatif, mohon merujuk pada sumber resmi BKN.",
      teamTitle: "Pembuat",
      teamBody1Lead: "Cita dirancang dan dikembangkan oleh",
      teamCreatorName: "Dymux",
      teamBody1Tail:
        "secara independen, dengan dukungan agen AI untuk percepatan eksekusi pengembangan dan pembuatan konten. Roadmap, prioritas fitur, serta peninjauan akhir konten ditangani langsung oleh pembuat.",
      teamBody2:
        "Punya saran, menemukan soal yang janggal, atau ingin berkontribusi?",
      teamLinkLabel: "Buka Issue di GitHub",
      teamCreatorLinkLabel: "Lihat profil GitHub Dymux",
      backHome: "Kembali ke beranda",
      privacy: "Privasi",
      terms: "Ketentuan",
    },
    privacy: {
      title: "Kebijakan Privasi",
      effective: "Berlaku efektif",
      lastUpdated: "Terakhir diperbarui",
      summaryTitle: "Ringkasan",
      summaryBody:
        "Cita adalah platform latihan SKD CPNS yang dirancang agar dapat digunakan tanpa pendaftaran akun. Apabila Anda hanya mengerjakan tryout dan melihat hasil, kami tidak memerlukan data pribadi Anda.",
      collectedTitle: "Data yang kami simpan",
      collectedAnonIdLabel: "ID anonim",
      collectedAnonIdBody:
        "Saat Anda memulai tryout, sistem membuat ID acak (contoh: anon_xxxxxxxx) yang disimpan dalam cookie peramban Anda. ID ini digunakan untuk mengaitkan jawaban dengan satu sesi tryout. Cookie berlaku selama satu tahun dan dapat Anda hapus kapan saja melalui pengaturan peramban.",
      collectedAnswersLabel: "Jawaban tryout",
      collectedAnswersBody:
        "Pilihan jawaban per soal, durasi pengerjaan, dan skor total. Data ini digunakan untuk menampilkan hasil dan menghitung statistik agregat (misalnya soal yang paling sering dijawab keliru).",
      collectedEmailLabel: "Alamat surel",
      collectedEmailBody:
        "Bersifat opsional. Hanya disimpan apabila Anda mendaftar untuk menyinkronkan riwayat antar perangkat, dan dapat dihapus kapan saja.",
      notDoTitle: "Yang TIDAK kami lakukan",
      notDo1: "Kami tidak menjual data Anda kepada pihak ketiga.",
      notDo2: "Kami tidak menjalankan iklan pelacak (tracking ad) di Cita.",
      notDo3: "Kami tidak melacak aktivitas Anda di luar Cita.",
      notDo4:
        "Kami tidak mengaitkan ID anonim Anda dengan identitas asli, kecuali Anda sendiri mendaftar dengan alamat surel.",
      thirdPartyTitle: "Pihak ketiga yang kami gunakan",
      thirdPartySupabase:
        "Supabase — penyedia basis data dan autentikasi. Data tersimpan pada server AWS di kawasan Asia Tenggara.",
      thirdPartySupabaseLink: "Pelajari kebijakan Supabase",
      thirdPartyVercel:
        "Vercel — penyedia hosting aplikasi. Berpotensi mencatat log akses (alamat IP, user-agent) untuk keperluan diagnostik infrastruktur.",
      thirdPartyVercelLink: "Pelajari kebijakan Vercel",
      rightsTitle: "Hak Anda",
      rightsDelete:
        "Penghapusan data — apabila Anda tidak mendaftar dengan surel, cukup hapus cookie cita_anon_id pada peramban Anda. Setelah itu, kami tidak dapat lagi mengaitkan data lama dengan Anda.",
      rightsAccess:
        "Akses dan koreksi — apabila Anda telah mendaftar dengan surel dan ingin meninjau atau menghapus data Anda, silakan menghubungi kami melalui kanal kontak di bawah.",
      contactTitle: "Kontak",
      contactBody:
        "Pertanyaan atau permintaan terkait privasi dapat disampaikan melalui kanal Issue publik pada repositori Cita di GitHub. Pada masa MVP ini, fitur penghapusan data otomatis akan ditambahkan pada rilis berikutnya.",
      contactLinkLabel: "Buka Issue di GitHub",
      footnote:
        "Kebijakan ini dapat berubah seiring perkembangan Cita. Versi terbaru selalu tersedia pada halaman ini.",
      navTerms: "Ketentuan Layanan",
      navHome: "Kembali ke beranda",
    },
    terms: {
      title: "Ketentuan Layanan",
      effective: "Berlaku efektif",
      lastUpdated: "Terakhir diperbarui",
      noticeLabel: "Penting — pernyataan non-afiliasi",
      noticeBoldBody:
        "Cita adalah produk independen dan TIDAK berafiliasi, tidak disponsori, serta tidak diendos oleh Badan Kepegawaian Negara (BKN), Kementerian PANRB, maupun lembaga pemerintah Republik Indonesia mana pun.",
      noticeBody:
        "Soal pada Cita disusun oleh tim Cita untuk keperluan latihan dan tidak merepresentasikan soal resmi seleksi CPNS atau dokumen pemerintah yang bersifat rahasia.",
      s1Title: "1. Tentang Cita",
      s1Body:
        "Cita adalah platform latihan daring untuk Seleksi Kompetensi Dasar (SKD) CPNS. Materi soal mencakup TWK, TIU, dan TKP, disusun mengikuti pola umum SKD berdasarkan literatur publik dan sumber terbuka.",
      s2Title: "2. Penggunaan yang diperkenankan",
      s2Item1: "Latihan pribadi sebagai bagian dari persiapan tes SKD CPNS.",
      s2Item2: "Berbagi tautan tryout atau hasil latihan kepada rekan atau komunitas belajar.",
      s2Item3: "Memberikan masukan kepada kami terkait soal yang tidak akurat.",
      s3Title: "3. Penggunaan yang dilarang",
      s3Item1:
        "Menyalin, mendistribusikan ulang, atau menjual kembali konten Cita (soal, pembahasan, desain) untuk kepentingan komersial tanpa izin tertulis dari kami.",
      s3Item2:
        "Memodifikasi atau mengakses sistem Cita di luar antarmuka publik, termasuk namun tidak terbatas pada scraping yang agresif, brute-force, atau eksploitasi kerentanan.",
      s3Item3:
        "Menyatakan atau menyiratkan bahwa Cita berafiliasi dengan BKN, instansi pemerintah, atau lembaga lain yang sebenarnya tidak terkait.",
      s4Title: "4. Akurasi konten",
      s4Lead: "Kami berupaya menyediakan soal dan pembahasan seakurat mungkin, dengan catatan berikut:",
      s4Item1:
        "Soal pada Cita tidak menjamin kelulusan Anda dalam seleksi CPNS resmi. Pola dan bobot soal SKD dapat berubah sesuai kebijakan BKN.",
      s4Item2:
        "Pembahasan dihasilkan dengan bantuan model penalaran tingkat lanjut dan ditinjau oleh tim Cita. Apabila Anda menemukan kekeliruan, mohon dilaporkan.",
      s4Item3:
        "Konten Cita disediakan apa adanya (as-is). Kami tidak bertanggung jawab atas keputusan Anda terkait persiapan ujian, hasil ujian, maupun dampak lain dari penggunaan Cita.",
      s5Title: "5. Layanan dan ketersediaan",
      s5Body:
        "Cita masih berada pada fase awal pengembangan. Kami dapat mengubah, menambah, atau menghapus fitur tanpa pemberitahuan terlebih dahulu. Layanan disediakan tanpa Service Level Agreement (SLA) tertulis. Apabila terjadi gangguan, kami akan menanganinya secepat mungkin.",
      s6Title: "6. Penghentian akses",
      s6Body:
        "Kami berhak membatasi atau menghentikan akses pengguna yang melanggar ketentuan ini, tanpa pemberitahuan terlebih dahulu, demi keamanan pengguna lain.",
      s7Title: "7. Hukum yang berlaku",
      s7Body:
        "Ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa terlebih dahulu diselesaikan secara musyawarah; apabila tidak tercapai mufakat, akan diselesaikan melalui jalur hukum yang berlaku.",
      s8Title: "8. Perubahan ketentuan",
      s8Body:
        "Ketentuan ini dapat diperbarui dari waktu ke waktu. Versi terbaru selalu tersedia pada halaman ini. Tanggal \"Terakhir diperbarui\" di atas mencerminkan revisi paling mutakhir.",
      contactTitle: "Kontak",
      contactBody:
        "Pertanyaan terkait ketentuan layanan ini dapat disampaikan melalui kanal Issue publik pada repositori Cita di GitHub.",
      contactLinkLabel: "Buka Issue di GitHub",
      navPrivacy: "Kebijakan Privasi",
      navHome: "Kembali ke beranda",
    },
    meta: {
      examLabel: "Tipe soal", // shown next to question category for clarity
    },
    notFound: {
      eyebrow: "404",
      title: "Halaman tidak ditemukan",
      body: "Tautan yang Anda buka tidak tersedia atau sudah dipindahkan. Silakan kembali ke beranda untuk melanjutkan.",
      cta: "Kembali ke Beranda",
    },
    errorBoundary: {
      eyebrow: "TERJADI KESALAHAN",
      title: "Sesuatu tidak berjalan semestinya",
      body: "Maaf, terjadi gangguan tak terduga di halaman ini. Silakan coba muat ulang atau kembali ke beranda.",
      retry: "Coba Lagi",
      home: "Kembali ke Beranda",
    },
  },
  en: {
    locale: "en" as const,
    nav: {
      tryout: "Tryout",
      leaderboard: "Leaderboard",
      about: "About",
      requirements: "Requirements",
      pricing: "Pricing",
      start: "Start",
      login: "Log In",
      backHome: "Back to home",
    },
    header: {
      tagline: "Calm, focused, accurate",
    },
    footer: {
      tagline: "Calm, focused, accurate",
      excellence: "Excellence through discipline. Indonesia's most focused SKD CPNS prep platform.",
      copyright: "Cita Academic. All rights reserved.",
      resourcesTitle: "Resources",
      legalTitle: "Legal",
      methodology: "Methodology",
      privacy: "Privacy",
      terms: "Terms",
      about: "About",
      requirements: "Requirements & Documents",
      disclaimer:
        "Cita is not affiliated with BKN, FHCI, or any Indonesian government agency.",
    },
    landing: {
      heroEyebrow: "SKD CPNS Practice Sessions Open",
      heroPillIcon: "live",
      heroTitle: "Realize your civil-service ambition,",
      heroTitleItalic: "starting here.",
      heroSubtitle:
        "30 questions in 30 minutes. Each question ships with a deep AI explanation — chat with our AI tutor until every concept clicks.",
      ctaStart: "Start free tryout",
      ctaLeaderboard: "Read our methodology",

      // Two-column feature cards
      privacyCardEyebrow: "PRIVACY FIRST",
      privacyCardTitle: "Anonymous-First Prep",
      privacyCardBody:
        "Cita is designed to be usable without account registration. Guest mode is available for quick, footprint-free simulations.",
      privacyCardCheck1: "No social-media tracking",
      privacyCardCheck2: "Guest mode for quick simulations",

      mentorCardEyebrow: "CITA TUTOR 24/7",
      mentorCardTitle: "Deep, Personal Guidance",
      mentorCardBody:
        "An AI tutor stands by to walk you through why answers are right or wrong, exactly when you need it, right from the question page.",
      mentorCardChat1Q:
        "Why is option D wrong on that TIU logic question?",
      mentorCardChat1A:
        "On that logic problem, option D contradicts the premise set. Let me walk you through the deduction step by step...",

      // Simulation showcase
      showcaseTitle: "A simulation",
      showcaseTitleItalic: "Identical",
      showcaseTitleAfter: "to the BKN CAT.",
      showcaseBody:
        "Cita's simulation interface mirrors the BKN Computer Assisted Test (CAT): timer, question count, and button placement are arranged so the experience feels familiar on exam day.",
      showcaseFeat1Title: "Time Management",
      showcaseFeat1Body:
        "Timer remains visible throughout the session. You can flag questions and revisit anything you skipped.",
      showcaseFeat2Title: "Live Scoring",
      showcaseFeat2Body:
        "Per-subtest scores compute automatically. Compare them against the official BKN passing thresholds.",
      showcaseMockTitle: "Simulation Preview",
      showcaseMockSubtitle: "Click to expand",
      showcaseBadge: "IDENTICAL UI",
      sim: {
        testTitle: "CPNS 2024 · TIU SIMULATION",
        startTest: "Start Test",
        modeLabel: "SIMULATION MODE",
        timeRemainingLabel: "TIME REMAINING",
        questionMeta: "TIU · VERBAL ANALOGY",
        questionStem: "Light : Bright = ... : ...",
        options: [
          "Water : Wet",
          "Fire : Hot",
          "Eat : Hungry",
          "Thirst : Drink",
          "Eye : See",
        ],
        optionLabels: ["A", "B", "C", "D", "E"],
        previous: "Previous",
        next: "Next",
        markReview: "Mark for Review",
        submit: "Submit",
        quote: "Success is the sum of small efforts, repeated day-in and day-out.",
        toolsAi: "AI Tutor",
        toolsNotes: "Notes",
        toolsCalc: "Calculator",
        tabOverview: "Overview",
        tabTwk: "TWK",
        tabTiu: "TIU",
        tabTkp: "TKP",
      },
      showcaseQuestionLabel: "QUESTION NO: 42",

      // Final CTA section
      finalCtaTitle: "Begin the path",
      finalCtaTitleItalic: "to your civil service ID",
      finalCtaTitleAfter: "today.",
      finalCtaSubtitle:
        "No signup. No payment. Open the tryout directly in your browser.",
      finalCtaButton: "Start Now",

      // CPNS 2026 timeline — keep stage labels in Indonesian
      // because they are domain-specific exam terminology that
      // English-speaking visitors looking at this product will
      // recognise (the product itself is Indonesia-centric).
      timelineEyebrow: "CPNS 2026 SCHEDULE",
      timelineTitle: "CPNS 2026 recruitment timeline",
      timelineSubtitle:
        "Estimated stages based on official statements from BKN and KemenPAN-RB. Final dates pending an official government announcement.",
      timelineProgressLabel: "Stage progress",
      timelineLegendDone: "Completed",
      timelineLegendActive: "In progress",
      timelineLegendUpcoming: "Upcoming",
      timelineSourceLabel:
        "Source: BKN · KemenPAN-RB · as of 21 May 2026",
      timelineStages: [
        {
          id: "perencanaan",
          label: "Formation Planning",
          period: "Apr–May 2026",
          status: "active",
        },
        {
          id: "pengumuman",
          label: "Formation Announcement",
          period: "Jun 2026",
          status: "upcoming",
        },
        {
          id: "pendaftaran",
          label: "SSCASN Registration",
          period: "Jun–Jul 2026",
          status: "upcoming",
        },
        {
          id: "administrasi",
          label: "Administrative Screening",
          period: "Jul–Aug 2026",
          status: "upcoming",
        },
        {
          id: "skd",
          label: "SKD",
          period: "Sep–Oct 2026",
          status: "upcoming",
        },
        {
          id: "skb",
          label: "SKB",
          period: "Nov–Dec 2026",
          status: "upcoming",
        },
        {
          id: "pengumuman-akhir",
          label: "Final Result",
          period: "Jan 2027",
          status: "upcoming",
        },
        {
          id: "pelantikan",
          label: "Onboarding & Inauguration",
          period: "Feb–Apr 2027",
          status: "upcoming",
        },
      ] as const,

      featuresTitle: "What you get",
      feat1Title: "30 AI-curated questions",
      feat1Desc:
        "TWK (national values), TIU (logical), TKP (personality) — designed to mirror the real SKD exam.",
      feat2Title: "AI explanation per question",
      feat2Desc:
        "Every question ships with a Claude Opus 4.7 explanation. Confused? Chat with the AI tutor.",
      feat3Title: "Anonymous leaderboard",
      feat3Desc:
        "No signup needed. Take the test, your score lands on the leaderboard.",
      bottomCtaTitle: "Ready to start?",
      bottomCtaSubtitle: "No signup. No payment. Just start.",
    },
    tryout: {
      briefingTitle: "Pick your tryout mode",
      briefingSubtitle: "A short session for daily practice, or a full simulation before exam day. Pick one then read the guidelines below.",
      rule1: "30 questions in 30 minutes (10 TWK, 10 TIU, 10 TKP).",
      rule2:
        "You can jump between questions and change answers anytime before the timer ends.",
      rule3:
        "Answers auto-save. Closed the tab? No worries, you can resume later.",
      rule4:
        "After submitting, you can chat with the AI tutor on each question (5 questions per problem).",
      startNow: "Start now",
      legalNote: "By starting, you agree to our",
      and: "and",
      // In-progress tryout interface (Academic Zen layout)
      modeLabel: "SIMULATION MODE",
      timeRemainingLabel: "TIME REMAINING",
      overview: "Overview",
      questionPanelLabel: "Question",
      ofLabel: "of",
      previous: "Previous",
      next: "Next",
      markReview: "Mark for Review",
      submit: "Submit Test",
      submitting: "Scoring…",
      submittingTitle: "Scoring your answers",
      submittingHint: "Please do not close or reload this page.",
      questionUnavailable: "Question unavailable.",
      retry: "Try restarting",
      tools: "Tools",
      toolAi: "AI Tutor",
      toolNotes: "Notes",
      toolCalc: "Calculator",
      toolsComingSoon: "Coming soon",
      motivationalQuote:
        "“Success is the sum of small efforts, repeated day in and day out.”",
      answeredCount: "answered",
    },
    result: {
      title: "Your tryout results",
      // Academic Zen redesign keys
      eyebrow: "SIMULATION COMPLETED",
      heroTitle: "Performance Summary",
      totalScoreLabel: "TOTAL SCORE",
      passingStatusLabel: "PASSING STATUS:",
      passingLulus: "PASSED",
      passingBelum: "NOT YET",
      breakdownTitle: "Subtest Breakdown",
      targetLabel: "Target",
      criticalNote: "Score below the official target",
      itemAnalysisTitle: "Item Analysis",
      filterAll: "FILTER: ALL",
      filterCorrect: "FILTER: CORRECT",
      filterWrong: "FILTER: INCORRECT",
      downloadReport: "DOWNLOAD REPORT",
      tagCorrect: "CORRECT",
      tagWrong: "INCORRECT",
      tagSkipped: "SKIPPED",
      askTutorCta: "Ask Cita Tutor",
      viewAllPrefix: "View all",
      viewAllSuffix: "questions",
      ctaNextTitle: "Keep practising?",
      ctaNextSubtitle:
        "Daily consistency outperforms a weekly marathon session.",
      ctaStartNew: "Start a new test",
      ctaBackHome: "Back to home",
      durationLabel: "Duration",
      answeredLabel: "Answered",
      correctLabel: "Correct",
      // Pre-existing
      totalScore: "Total score",
      passingHint:
        "Official BKN passing thresholds: TWK 65, TIU 80, TKP 166.",
      reviewTitle: "Per-question review",
      askTutor: "Ask Cita Tutor",
      backToHome: "Back to home",
      shareScore: "Share results",
      explanationLabel: "AI explanation",
      disclaimer:
        "AI explanations were generated by Claude Opus 4.7 when the questions were authored, and validated by the Cita team.",
      yourAnswer: "Your answer",
      correctAnswer: "Key",
      notAnswered: "Not answered",
    },
    study: {
      backToResult: "Back to results",
      prevQuestion: "Previous question",
      nextQuestion: "Next question",
      tutorName: "Cita Tutor",
      tutorTagline: "Discuss this question with AI",
      remaining: "{n}/{max} left today",
      thinking: "Tutor is thinking...",
      placeholder: "Ask anything... (Enter to send, Shift+Enter for new line)",
      placeholderLimit: "Question limit reached. Try a different question.",
      send: "Send",
      suggestionsTitle: "Quick prompts",
      closeSuggestions: "Hide quick prompts",
      emptyTitle: "Ask anything about this question.",
      emptySubtitle:
        "The tutor knows the question, the correct answer, and what you picked. Try a quick prompt below or write your own.",
      youLabel: "You",
      explanationLabel: "Base explanation",
      quickPrompts: {
        analogy: "Give a real-world analogy",
        eli5: "Explain it simply",
        whyWrong: "Why are the other options wrong?",
        realCase: "Give a real-world example",
      },
      quickPromptTexts: {
        analogy:
          "Please give me an analogy from everyday life so this concept is easier to understand.",
        eli5:
          "Please explain again in simpler terms, as if you were teaching a middle-school student.",
        whyWrong: "Please walk me through why each wrong option is incorrect, one by one.",
        realCase:
          "Please give one or two real-world examples in Indonesia that illustrate the correct answer.",
      },
    },
    leaderboard: {
      title: "Leaderboard",
      subtitle: "Top 10 all-time scores",
      empty: "No scores yet. Be the first!",
      rank: "Rank",
      participant: "Participant",
      score: "Score",
      duration: "Time",
      status: "Status",
      passed: "Passed",
      notPassed: "Not yet",
      ctaStart: "Start tryout",
      passingNote:
        "Note: 'Passed' uses BKN's official thresholds (TWK 65, TIU 80, TKP 166).",
    },
    common: {
      darkMode: "Dark mode",
      lightMode: "Light mode",
      languageToggle: "Language",
    },
    about: {
      title: "About Cita",
      subtitle:
        "An AI-assisted SKD CPNS preparation platform: structured tryouts, per-question discussion with an AI tutor, and a personalized result analysis that helps you focus on actual weaknesses.",
      whyTitle: "Why Cita exists",
      why1:
        "Every recruitment cycle, millions of Indonesians compete for civil service positions. Quality preparation material is often locked behind expensive paywalls or shipped as static explanations with no real learning context.",
      why2:
        "Cita takes a different approach. You can attempt 30 questions in 30 minutes, see an honest score, and discuss each item directly with an AI tutor that already understands the question, your answer, and its difficulty — no signup required, no ads, no friction.",
      cardCalmTitle: "Calm",
      cardCalmDesc:
        "The interface is intentionally low-distraction. Comfortable typography, light and dark modes, motion only where it aids comprehension.",
      cardFocusTitle: "Focused",
      cardFocusDesc:
        "Each tryout runs for 30 questions in 30 minutes. Short enough to repeat daily, realistic enough to build genuine exam pacing.",
      cardAccurateTitle: "Accurate",
      cardAccurateDesc:
        "Questions follow current SKD patterns. Baseline explanations are generated by a frontier reasoning model and reviewed before publication.",
      featuresTitle: "What you get on Cita",
      feat1Bold: "Full SKD tryout.",
      feat1: "30 TWK, TIU, and TKP questions in a single 30-minute session. Topic distribution mirrors the current SKD CPNS guideline.",
      feat2Bold: "Cita Tutor.",
      feat2: "Per-question discussion with an AI assistant that already has the full context — the question, your answer, the key, and the difficulty. Free users get 5 tutor questions per day; Premium subscribers get up to 50.",
      feat3Bold: "Personalized result analysis.",
      feat3: "An AI-authored summary for Premium subscribers that highlights your strengths, the areas to drill, and concrete next steps you can act on.",
      feat4Bold: "History and statistics.",
      feat4: "Every tryout is saved automatically. You can revisit each answer, monitor accuracy per topic, and track your progress over time.",
      feat5Bold: "Use it without an account.",
      feat5: "Start a tryout anonymously with a cookie-bound session. Sign up only if you need to sync history across devices or upgrade to Premium.",
      feat6Bold: "Affordable plans, voucher-friendly.",
      feat6: "Premium is priced reasonably and voucher codes can be applied at checkout — for partial discounts or full free access depending on the active campaign.",
      feat7Bold: "Bilingual and multi-theme.",
      feat7: "Available in Indonesian and English, light and dark modes. Your preference is stored on your browser.",
      feat8Bold: "Open source.",
      feat8: "The application code is published on GitHub. You are welcome to read the source, report issues, or contribute.",
      stackTitle: "Tech stack",
      stackBody:
        "Next.js 16 (App Router), TypeScript, Tailwind CSS 4, and shadcn/ui for the interface. Supabase Postgres with Prisma as the data layer, hosted on Vercel in the Singapore region. The LLM gateway is OpenAI-compatible, so the model powering the tutor and the result analysis can be swapped without changing application code. Payments are processed by Midtrans.",
      disclaimerTitle: "Disclaimer",
      disclaimerBody1Bold: "Cita is an independent product and is not affiliated with, endorsed by, or operated on behalf of Badan Kepegawaian Negara (BKN), the Ministry of PANRB, or any agency of the Government of the Republic of Indonesia.",
      disclaimerBody2:
        "Question content is created for practice only and does not represent any official SKD CPNS examination. Scores on Cita are not a guarantee of passing the official selection. For authoritative information, please consult primary BKN sources.",
      teamTitle: "Maker",
      teamBody1Lead: "Cita is designed and developed by",
      teamCreatorName: "Dymux",
      teamBody1Tail:
        "as an independent project, with AI agents assisting development execution and content generation. Roadmap, feature prioritization, and final content review are handled directly by the maker.",
      teamBody2:
        "Have a suggestion, found a question that looks off, or want to contribute?",
      teamLinkLabel: "Open an issue on GitHub",
      teamCreatorLinkLabel: "View Dymux on GitHub",
      backHome: "Back to home",
      privacy: "Privacy",
      terms: "Terms",
    },
    privacy: {
      title: "Privacy Policy",
      effective: "Effective date",
      lastUpdated: "Last updated",
      summaryTitle: "Summary",
      summaryBody:
        "Cita is an SKD CPNS practice platform designed to be usable without account registration. If you simply take a tryout and view your results, we do not require any personal data from you.",
      collectedTitle: "Data we store",
      collectedAnonIdLabel: "Anonymous ID",
      collectedAnonIdBody:
        "When you start a tryout, the system creates a random ID (e.g. anon_xxxxxxxx) stored in your browser cookie. The ID is used to associate your answers with a single tryout session. The cookie has a one-year lifetime and can be deleted at any time through your browser settings.",
      collectedAnswersLabel: "Tryout answers",
      collectedAnswersBody:
        "Your selected answer per question, time spent, and total score. This data is used to display results and to compute aggregate statistics (such as the most frequently missed questions).",
      collectedEmailLabel: "Email address",
      collectedEmailBody:
        "Optional. Stored only if you sign up to sync history across devices, and removable at any time.",
      notDoTitle: "What we do NOT do",
      notDo1: "We do not sell your data to third parties.",
      notDo2: "We do not run tracking advertising on Cita.",
      notDo3: "We do not track your activity outside of Cita.",
      notDo4:
        "We do not link your anonymous ID to a real-world identity, unless you yourself sign up with an email address.",
      thirdPartyTitle: "Third parties we use",
      thirdPartySupabase:
        "Supabase — database and authentication provider. Data is stored on AWS servers in the Southeast Asia region.",
      thirdPartySupabaseLink: "Supabase privacy policy",
      thirdPartyVercel:
        "Vercel — application hosting provider. May log access information (IP address, user-agent) for infrastructure diagnostics.",
      thirdPartyVercelLink: "Vercel privacy policy",
      rightsTitle: "Your rights",
      rightsDelete:
        "Data deletion — if you have not signed up with an email address, simply remove the cita_anon_id cookie from your browser. After that, we are no longer able to associate prior data with you.",
      rightsAccess:
        "Access and correction — if you have signed up with an email and would like to review or delete your data, please contact us through the channel below.",
      contactTitle: "Contact",
      contactBody:
        "Privacy-related questions or requests can be raised through the public Issue tracker on the Cita repository on GitHub. During this MVP phase, an automated data-deletion feature will be added in a subsequent release.",
      contactLinkLabel: "Open an issue on GitHub",
      footnote:
        "This policy may evolve as Cita develops. The current version is always available on this page.",
      navTerms: "Terms of Service",
      navHome: "Back to home",
    },
    terms: {
      title: "Terms of Service",
      effective: "Effective date",
      lastUpdated: "Last updated",
      noticeLabel: "Important — non-affiliation notice",
      noticeBoldBody:
        "Cita is an independent product and is NOT affiliated with, sponsored by, or endorsed by Badan Kepegawaian Negara (BKN), the Ministry of PANRB, or any agency of the Government of the Republic of Indonesia.",
      noticeBody:
        "Question content on Cita is authored by the Cita team for practice purposes and does not represent any official SKD CPNS examination or any classified government document.",
      s1Title: "1. About Cita",
      s1Body:
        "Cita is an online practice platform for the Indonesian Civil Service Selection Test (SKD CPNS). Question content covers TWK, TIU, and TKP, written following common SKD patterns based on publicly available literature and open sources.",
      s2Title: "2. Permitted use",
      s2Item1: "Personal practice as part of preparing for the SKD CPNS exam.",
      s2Item2: "Sharing tryout links or your practice results with peers or learning communities.",
      s2Item3: "Providing feedback to us regarding inaccurate questions.",
      s3Title: "3. Prohibited use",
      s3Item1:
        "Copying, redistributing, or reselling Cita content (questions, explanations, design) for commercial purposes without our written permission.",
      s3Item2:
        "Modifying or accessing Cita's systems outside of the public interface, including but not limited to aggressive scraping, brute force, or vulnerability exploitation.",
      s3Item3:
        "Stating or implying that Cita is affiliated with BKN, government agencies, or any other unrelated organization.",
      s4Title: "4. Content accuracy",
      s4Lead: "We strive to provide questions and explanations as accurately as possible, with the following caveats:",
      s4Item1:
        "Cita questions do not guarantee that you will pass the official CPNS selection. SKD question patterns and weights may change in line with BKN policy.",
      s4Item2:
        "Explanations are produced with the assistance of an advanced reasoning model and reviewed by the Cita team. If you find an error, please report it.",
      s4Item3:
        "Cita content is provided as-is. We are not responsible for your decisions regarding exam preparation, exam outcomes, or any other consequences of using Cita.",
      s5Title: "5. Service and availability",
      s5Body:
        "Cita is in the early stages of development. We may change, add, or remove features without prior notice. The service is provided without a written Service Level Agreement (SLA). If an outage occurs, we will address it as quickly as possible.",
      s6Title: "6. Termination of access",
      s6Body:
        "We reserve the right to limit or terminate access for users who violate these terms, without prior notice, in the interest of other users' safety.",
      s7Title: "7. Governing law",
      s7Body:
        "These terms are governed by the laws of the Republic of Indonesia. Disputes shall first be resolved amicably; if no settlement is reached, they shall be resolved through the applicable legal channels.",
      s8Title: "8. Changes to these terms",
      s8Body:
        "These terms may be updated from time to time. The current version is always available on this page. The \"Last updated\" date above reflects the most recent revision.",
      contactTitle: "Contact",
      contactBody:
        "Questions regarding these Terms of Service can be raised through the public Issue tracker on the Cita repository on GitHub.",
      contactLinkLabel: "Open an issue on GitHub",
      navPrivacy: "Privacy Policy",
      navHome: "Back to home",
    },
    meta: {
      examLabel: "Question type",
    },
    notFound: {
      eyebrow: "404",
      title: "Page not found",
      body: "The link you followed isn't available or has been moved. Please return to the home page to continue.",
      cta: "Back to Home",
    },
    errorBoundary: {
      eyebrow: "SOMETHING WENT WRONG",
      title: "We hit an unexpected snag",
      body: "Sorry, something went wrong on this page. Please reload, or head back to the home page.",
      retry: "Try Again",
      home: "Back to Home",
    },
  },
}

export type Dict = (typeof dictionaries)[Locale]

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const v = cookieStore.get(LOCALE_COOKIE)?.value
  if (v && (SUPPORTED_LOCALES as readonly string[]).includes(v)) {
    return v as Locale
  }
  return DEFAULT_LOCALE
}

export async function getDict(): Promise<Dict> {
  const locale = await getLocale()
  return dictionaries[locale] as Dict
}

export function getDictByLocale(locale: Locale): Dict {
  return dictionaries[locale] as Dict
}
