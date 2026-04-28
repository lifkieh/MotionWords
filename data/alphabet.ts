import type { SignSystem } from './signSystems';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const SYSTEMS: SignSystem[] = ['bisindo', 'sibi', 'asl', 'international'];
const FRAMES_PER_LETTER = 3;

/**
 * Build image paths for every letter × system.
 * Structure: /signs/{system}/{letter}/{frame}.jpg
 */
function buildAlphabetData(): Record<string, Record<SignSystem, string[]>> {
  const data: Record<string, Record<SignSystem, string[]>> = {};

  for (const letter of LETTERS) {
    const upper = letter.toUpperCase();
    data[upper] = {} as Record<SignSystem, string[]>;

    for (const sys of SYSTEMS) {
      const frames: string[] = [];
      for (let i = 1; i <= FRAMES_PER_LETTER; i++) {
        frames.push(`/signs/${sys}/${letter}/${i}.png`);
      }
      data[upper][sys] = frames;
    }
  }

  return data;
}

export const alphabetData = buildAlphabetData();

/** All uppercase letter keys */
export const ALPHABET = LETTERS.map((l) => l.toUpperCase());

/** Fallback placeholder path */
export const PLACEHOLDER_IMAGE = '/signs/placeholder.svg';