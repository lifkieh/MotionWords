import type { SignSystem } from './signSystems';

export type InsightType = 'similar' | 'different' | 'unique';

export interface CompareInsight {
  type: InsightType;
  en: string;
  id: string;
  /** Which systems this insight applies to (empty = all active) */
  systems?: SignSystem[];
}

/**
 * Per-letter comparison insights.
 * These provide educational context when comparing sign systems.
 */
export const compareInsights: Record<string, CompareInsight> = {
  A: {
    type: 'similar',
    en: 'Similar across most systems — a closed fist with thumb to the side',
    id: 'Mirip di sebagian besar sistem — kepalan tangan dengan ibu jari di samping',
  },
  B: {
    type: 'similar',
    en: 'Similar hand shape — flat hand with fingers together',
    id: 'Bentuk tangan serupa — tangan datar dengan jari-jari rapat',
  },
  C: {
    type: 'similar',
    en: 'Curved hand shape is consistent across systems',
    id: 'Bentuk tangan melengkung konsisten di semua sistem',
  },
  D: {
    type: 'different',
    en: 'Index finger position varies between BISINDO and ASL',
    id: 'Posisi jari telunjuk berbeda antara BISINDO dan ASL',
    systems: ['bisindo', 'asl'],
  },
  E: {
    type: 'different',
    en: 'Finger curl pattern differs in International Sign',
    id: 'Pola lengkungan jari berbeda di Isyarat Internasional',
    systems: ['international'],
  },
  F: {
    type: 'different',
    en: 'ASL uses a unique OK-like shape for F',
    id: 'ASL menggunakan bentuk mirip OK untuk huruf F',
    systems: ['asl'],
  },
  G: {
    type: 'different',
    en: 'Hand orientation differs significantly between systems',
    id: 'Orientasi tangan sangat berbeda antar sistem',
  },
  H: {
    type: 'similar',
    en: 'Two-finger horizontal point is widely shared',
    id: 'Dua jari menunjuk horizontal digunakan secara luas',
  },
  I: {
    type: 'similar',
    en: 'Pinky finger raised — consistent across systems',
    id: 'Jari kelingking diangkat — konsisten di semua sistem',
  },
  J: {
    type: 'different',
    en: 'J involves motion in ASL but is static in SIBI',
    id: 'J melibatkan gerakan di ASL tetapi statis di SIBI',
    systems: ['asl', 'sibi'],
  },
  K: {
    type: 'different',
    en: 'Finger spread pattern varies between BISINDO and others',
    id: 'Pola jari terbuka berbeda antara BISINDO dan lainnya',
    systems: ['bisindo'],
  },
  L: {
    type: 'similar',
    en: 'L-shape with thumb and index is universal',
    id: 'Bentuk L dengan ibu jari dan telunjuk bersifat universal',
  },
  M: {
    type: 'different',
    en: 'Number of fingers over thumb differs between ASL and BISINDO',
    id: 'Jumlah jari di atas ibu jari berbeda antara ASL dan BISINDO',
    systems: ['asl', 'bisindo'],
  },
  N: {
    type: 'different',
    en: 'Similar to M but with fewer fingers — varies by system',
    id: 'Mirip M tetapi dengan lebih sedikit jari — bervariasi per sistem',
  },
  O: {
    type: 'similar',
    en: 'Rounded O-shape is consistent across all systems',
    id: 'Bentuk O bulat konsisten di semua sistem',
  },
  P: {
    type: 'different',
    en: 'Hand angle differs — ASL points downward, BISINDO stays neutral',
    id: 'Sudut tangan berbeda — ASL menunjuk ke bawah, BISINDO tetap netral',
    systems: ['asl', 'bisindo'],
  },
  Q: {
    type: 'different',
    en: 'Downward pointing varies across systems',
    id: 'Posisi menunjuk ke bawah bervariasi antar sistem',
  },
  R: {
    type: 'different',
    en: 'Crossed fingers in ASL vs separate in BISINDO',
    id: 'Jari bersilang di ASL vs terpisah di BISINDO',
    systems: ['asl', 'bisindo'],
  },
  S: {
    type: 'similar',
    en: 'Closed fist with thumb over fingers — widely shared',
    id: 'Kepalan tertutup dengan ibu jari di atas jari — digunakan luas',
  },
  T: {
    type: 'different',
    en: 'Thumb position between fingers varies by system',
    id: 'Posisi ibu jari di antara jari bervariasi per sistem',
  },
  U: {
    type: 'similar',
    en: 'Two fingers raised together — consistent across systems',
    id: 'Dua jari diangkat bersamaan — konsisten di semua sistem',
  },
  V: {
    type: 'similar',
    en: 'V-sign / peace sign is universal',
    id: 'Tanda V / tanda perdamaian bersifat universal',
  },
  W: {
    type: 'similar',
    en: 'Three fingers spread — consistent across systems',
    id: 'Tiga jari terbuka — konsisten di semua sistem',
  },
  X: {
    type: 'different',
    en: 'Hook finger shape differs between ASL and BISINDO',
    id: 'Bentuk jari bengkok berbeda antara ASL dan BISINDO',
    systems: ['asl', 'bisindo'],
  },
  Y: {
    type: 'similar',
    en: 'Thumb and pinky extended — shared across systems',
    id: 'Ibu jari dan kelingking dijulurkan — sama di semua sistem',
  },
  Z: {
    type: 'different',
    en: 'Z involves a zigzag motion in ASL but is static in SIBI',
    id: 'Z melibatkan gerakan zigzag di ASL tetapi statis di SIBI',
    systems: ['asl', 'sibi'],
  },
};

/** Helper: get badge info for a letter given active systems */
export function getInsight(
  letter: string,
  activeSystems: SignSystem[]
): CompareInsight | null {
  if (activeSystems.length < 2) return null;

  const insight = compareInsights[letter.toUpperCase()];
  if (!insight) return null;

  // If insight targets specific systems, check if at least one is active
  if (insight.systems && insight.systems.length > 0) {
    const relevant = insight.systems.some((s) => activeSystems.includes(s));
    if (!relevant) return null;
  }

  return insight;
}

/** Get badge color classes by insight type */
export function getInsightBadgeClasses(type: InsightType): string {
  switch (type) {
    case 'similar':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'different':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'unique':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
}

/** Get emoji by insight type */
export function getInsightEmoji(type: InsightType): string {
  switch (type) {
    case 'similar':
      return '🟢';
    case 'different':
      return '🔴';
    case 'unique':
      return '🟡';
  }
}


