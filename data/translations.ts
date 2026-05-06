export type Locale = 'en' | 'id';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.level1': 'Level 1: Alphabet',
    'nav.level2': 'Level 2: Words',
    'nav.level3': 'Level 3: Interactive',

    // Home
    'home.badge': 'Empowering inclusive communication',
    'home.title1': 'Master Sign Language with',
    'home.title2': 'MotionWords',
    'home.subtitle': 'An interactive learning platform for sign language education. Learn BISINDO, SIBI, ASL, and International Sign through visual tutors, word translation, and voice interaction — bridging Indonesian sign language to the world.',
    'home.cta': 'Start Learning Now',
    'home.explore': 'Explore Levels',
    'home.level1.title': 'Level 1: Alphabet Tutor',
    'home.level1.desc': 'Learn A-Z sign language with toggle-based exploration. Compare across BISINDO, SIBI, ASL, and International Sign side by side.',
    'home.level2.title': 'Level 2: Word Translation',
    'home.level2.desc': 'Convert words into sign language sequences or stop motion animations. Compare multiple systems at once.',
    'home.level3.title': 'Level 3: Interactive Practice',
    'home.level3.desc': 'Practice with voice recognition. Speak a word and see it come alive as sign language with adjustable speed.',
    'home.startLevel': 'Start Level',

    // Level 1
    'learn.title': 'Level 1: Alphabet Tutor',
    'learn.subtitle': 'Toggle letters ON/OFF to explore sign language alphabets. Activate multiple sign systems to compare them side by side.',
    'learn.toggleLetters': 'Toggle Letters',
    'learn.activeLetters': 'Active Letters',
    'learn.noActive': 'Tap on letters above to activate them and see their sign language representations.',
    'learn.signSystems': 'Sign Systems',
    'learn.comparison': 'Comparison Mode',
    'learn.comparisonHint': 'Activate 2 or more systems to compare',
    'learn.letterIn': 'Letter {letter} in {system}',
    'learn.swipePrev': 'Previous',
    'learn.swipeNext': 'Next',

    // Level 2
    'spelling.title': 'Level 2: Word Translation',
    'spelling.subtitle': 'Convert words into sign language sequences. Switch to stop motion for animated letter-by-letter playback.',
    'spelling.placeholder': 'Type a word (e.g. HELLO, BELAJAR)...',
    'spelling.translate': 'Translate',
    'spelling.sequence': 'Sequence',
    'spelling.stopMotion': 'Stop Motion',
    'spelling.emptyTitle': 'Type a word and hit Translate',
    'spelling.emptyDesc': 'to see its sign language sequence.',
    'spelling.viewMode': 'View Mode',

    // Level 3
    'interactive.title': 'Level 3: Interactive Practice',
    'interactive.subtitle': 'Use voice recognition to trigger sign language animations. The mic auto-closes after each word — press again to continue.',
    'interactive.preferences': 'Preferences',
    'interactive.signSystem': 'Sign Language System',
    'interactive.accessibility': 'Accessibility Profile',
    'interactive.deaf': 'Deaf / Hard of Hearing',
    'interactive.deafDesc': 'Focus on visual clarity and standard speed',
    'interactive.motor': 'Motor / Cognitive Impairment',
    'interactive.motorDesc': 'Slower animation speed for easier tracking',
    'interactive.speed': 'Animation Speed',
    'interactive.tapMic': 'Tap the microphone and say a word to translate.',
    'interactive.listening': 'Listening...',
    'interactive.micReady': 'Mic ready — tap to speak',
    'interactive.stopMotionViewer': 'Stop Motion Frame Viewer',
    'interactive.waiting': 'Waiting for voice input... The animation speed will adapt based on your settings.',
    'interactive.frame': 'Frame',

    // Compare Insight
    'insight.similar': 'Similar across systems',
    'insight.different': 'Different',
    'insight.unique': 'Unique',

    // Speed
    'speed.slow': 'Slow',
    'speed.normal': 'Normal',
    'speed.fast': 'Fast',
    'speed.label': 'Speed',

    // Footer
    'footer.tagline': 'Empowering communication through visual learning. Supports BISINDO, SIBI, ASL & International Sign.',
    'footer.copyright': '© {year} MotionWords. Built for inclusive education.',
    'footer.alphabet': 'Alphabet',
    'footer.words': 'Words',
    'footer.interactive': 'Interactive',

    // Common
    'common.play': 'Play',
    'common.pause': 'Pause',
    'common.reset': 'Reset',
    'common.of': 'of',
  },

  id: {
    // Navbar
    'nav.home': 'Beranda',
    'nav.level1': 'Level 1: Alfabet',
    'nav.level2': 'Level 2: Kata',
    'nav.level3': 'Level 3: Interaktif',

    // Home
    'home.badge': 'Memberdayakan komunikasi inklusif',
    'home.title1': 'Kuasai Bahasa Isyarat dengan',
    'home.title2': 'MotionWords',
    'home.subtitle': 'Platform pembelajaran interaktif untuk edukasi bahasa isyarat. Pelajari BISINDO, SIBI, ASL, dan Isyarat Internasional melalui tutor visual, terjemahan kata, dan interaksi suara — menjembatani bahasa isyarat Indonesia ke dunia.',
    'home.cta': 'Mulai Belajar Sekarang',
    'home.explore': 'Jelajahi Level',
    'home.level1.title': 'Level 1: Tutor Alfabet',
    'home.level1.desc': 'Pelajari bahasa isyarat A-Z dengan eksplorasi toggle. Bandingkan BISINDO, SIBI, ASL, dan Isyarat Internasional secara berdampingan.',
    'home.level2.title': 'Level 2: Terjemahan Kata',
    'home.level2.desc': 'Ubah kata menjadi urutan bahasa isyarat atau animasi stop motion. Bandingkan beberapa sistem sekaligus.',
    'home.level3.title': 'Level 3: Praktik Interaktif',
    'home.level3.desc': 'Berlatih dengan pengenalan suara. Ucapkan kata dan lihat ditampilkan sebagai bahasa isyarat dengan kecepatan yang dapat diatur.',
    'home.startLevel': 'Mulai Level',

    // Level 1
    'learn.title': 'Level 1: Tutor Alfabet',
    'learn.subtitle': 'Aktifkan/nonaktifkan huruf untuk menjelajahi alfabet bahasa isyarat. Aktifkan beberapa sistem untuk membandingkannya secara berdampingan.',
    'learn.toggleLetters': 'Pilih Huruf',
    'learn.activeLetters': 'Huruf Aktif',
    'learn.noActive': 'Ketuk huruf di atas untuk mengaktifkan dan melihat representasi bahasa isyaratnya.',
    'learn.signSystems': 'Sistem Isyarat',
    'learn.comparison': 'Mode Perbandingan',
    'learn.comparisonHint': 'Aktifkan 2 atau lebih sistem untuk membandingkan',
    'learn.letterIn': 'Huruf {letter} dalam {system}',
    'learn.swipePrev': 'Sebelumnya',
    'learn.swipeNext': 'Selanjutnya',

    // Level 2
    'spelling.title': 'Level 2: Terjemahan Kata',
    'spelling.subtitle': 'Ubah kata menjadi urutan bahasa isyarat. Beralih ke stop motion untuk pemutaran huruf per huruf secara animasi.',
    'spelling.placeholder': 'Ketik kata (misal: HELLO, BELAJAR)...',
    'spelling.translate': 'Terjemahkan',
    'spelling.sequence': 'Urutan',
    'spelling.stopMotion': 'Stop Motion',
    'spelling.emptyTitle': 'Ketik kata dan tekan Terjemahkan',
    'spelling.emptyDesc': 'untuk melihat urutan bahasa isyaratnya.',
    'spelling.viewMode': 'Mode Tampilan',

    // Level 3
    'interactive.title': 'Level 3: Praktik Interaktif',
    'interactive.subtitle': 'Gunakan pengenalan suara untuk memicu animasi bahasa isyarat. Mikrofon otomatis mati setelah setiap kata — tekan lagi untuk melanjutkan.',
    'interactive.preferences': 'Preferensi',
    'interactive.signSystem': 'Sistem Bahasa Isyarat',
    'interactive.accessibility': 'Profil Aksesibilitas',
    'interactive.deaf': 'Tuli / Gangguan Pendengaran',
    'interactive.deafDesc': 'Fokus pada kejelasan visual dan kecepatan standar',
    'interactive.motor': 'Gangguan Motorik / Kognitif',
    'interactive.motorDesc': 'Kecepatan animasi lebih lambat untuk pelacakan lebih mudah',
    'interactive.speed': 'Kecepatan Animasi',
    'interactive.tapMic': 'Ketuk mikrofon dan ucapkan kata untuk diterjemahkan.',
    'interactive.listening': 'Mendengarkan...',
    'interactive.micReady': 'Mikrofon siap — ketuk untuk berbicara',
    'interactive.stopMotionViewer': 'Penampil Frame Stop Motion',
    'interactive.waiting': 'Menunggu input suara... Kecepatan animasi akan menyesuaikan pengaturan Anda.',
    'interactive.frame': 'Frame',

    // Compare Insight
    'insight.similar': 'Mirip di semua sistem',
    'insight.different': 'Berbeda',
    'insight.unique': 'Unik',

    // Speed
    'speed.slow': 'Lambat',
    'speed.normal': 'Normal',
    'speed.fast': 'Cepat',
    'speed.label': 'Kecepatan',

    // Footer
    'footer.tagline': 'Memberdayakan komunikasi melalui pembelajaran visual. Mendukung BISINDO, SIBI, ASL & Isyarat Internasional.',
    'footer.copyright': '© {year} MotionWords. Dibuat untuk pendidikan inklusif.',
    'footer.alphabet': 'Alfabet',
    'footer.words': 'Kata',
    'footer.interactive': 'Interaktif',

    // Common
    'common.play': 'Putar',
    'common.pause': 'Jeda',
    'common.reset': 'Reset',
    'common.of': 'dari',
  },
};

export default translations;

