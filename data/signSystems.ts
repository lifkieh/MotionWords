export type SignSystem = 'bisindo' | 'sibi' | 'asl' | 'international';

export interface SignSystemMeta {
  key: SignSystem;
  name: string;
  nameId: string;
  shortLabel: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
  bgDark: string;
  disabled?: boolean;       // ← tambahan: sistem yang belum tersedia
  disabledReason?: string;  // ← tooltip saat hover
}

export const SIGN_SYSTEMS: SignSystemMeta[] = [
  {
    key: 'bisindo',
    name: 'BISINDO',
    nameId: 'BISINDO',
    shortLabel: 'BI',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-300 dark:border-blue-700',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-900/20',
  },
  {
    key: 'sibi',
    name: 'SIBI',
    nameId: 'SIBI',
    shortLabel: 'SI',
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-300 dark:border-purple-700',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-900/20',
  },
  {
    key: 'asl',
    name: 'ASL',
    nameId: 'ASL',
    shortLabel: 'AS',
    color: 'bg-emerald-600',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
  },
  {
    key: 'international',
    name: 'International Sign',
    nameId: 'Isyarat Internasional',
    shortLabel: 'IS',
    color: 'bg-amber-600',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-300 dark:border-amber-700',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
    disabled: true,
    disabledReason: 'Coming soon',
  },
];

export const SIGN_SYSTEM_MAP: Record<SignSystem, SignSystemMeta> = Object.fromEntries(
  SIGN_SYSTEMS.map((s) => [s.key, s])
) as Record<SignSystem, SignSystemMeta>;

export const ALL_SYSTEMS: SignSystem[] = ['bisindo', 'sibi', 'asl', 'international'];