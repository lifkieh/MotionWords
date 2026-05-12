import { SignSystem } from '@/data/signSystems';

export const THRESHOLD_CONFIG = {
  // Base configuration
  confidence: 0.65,       // Turunkan dari 0.70 sebagai starting point
  smoothingRequired: 4,   // of 5 frames
  smoothingWindow: 5,
  holdDurationMs: 1000,

  // Per-system overrides
  overrides: {
    bisindo: {
      confidence: 0.63,   // Sedikit lebih longgar karena dual-hand tracking lebih bising/kompleks
    },
    sibi: {},
    asl: {},
  } as Record<SignSystem, { confidence?: number; smoothingRequired?: number; holdDurationMs?: number }>,

  // Huruf yang secara anatomi mirip diberikan threshold lebih longgar
  letterOverrides: {
    B: 0.60, F: 0.60, U: 0.60, V: 0.60, W: 0.60, M: 0.60, N: 0.60, R: 0.60, S: 0.60, E: 0.60
  } as Record<string, number>
};

export function getConfigForSystem(system: SignSystem, letter?: string) {
  const override = THRESHOLD_CONFIG.overrides[system] || {};
  let conf = override.confidence ?? THRESHOLD_CONFIG.confidence;
  
  if (letter && letter in THRESHOLD_CONFIG.letterOverrides) {
    conf = THRESHOLD_CONFIG.letterOverrides[letter];
  }

  return {
    confidence: conf,
    smoothingRequired: override.smoothingRequired ?? THRESHOLD_CONFIG.smoothingRequired,
    smoothingWindow: THRESHOLD_CONFIG.smoothingWindow,
    holdDurationMs: override.holdDurationMs ?? THRESHOLD_CONFIG.holdDurationMs,
  };
}
