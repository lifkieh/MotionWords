import type { SignSystem } from './signSystems';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const SYSTEMS: SignSystem[] = ['bisindo', 'sibi', 'asl', 'international'];

/**
 * Get the path for a specific sign language image
 */
export function getSignImage(system: string, letter: string): string {
  const cleanLetter = letter.toUpperCase();
  return `/signs/${system}/${cleanLetter}.jpg`;
}

/** All uppercase letter keys */
export const ALPHABET = LETTERS.map((l) => l.toUpperCase());

/** Fallback placeholder path */
export const PLACEHOLDER_IMAGE = '/signs/placeholder.svg';