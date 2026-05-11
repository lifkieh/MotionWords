import { SignSystem } from '@/data/signSystems';

export const THRESHOLD_CONFIG = {
  // Base configuration
  confidence: 0.70,       // Turunkan dari 0.75 sebagai starting point (empiris)
  smoothingRequired: 4,   // of 5 frames
  smoothingWindow: 5,
  holdDurationMs: 1500,

  // Per-system overrides
  overrides: {
    bisindo: {
      confidence: 0.68,   // Sedikit lebih longgar karena dual-hand tracking lebih bising/kompleks
    },
    sibi: {},
    asl: {},
  } as Record<SignSystem, { confidence?: number; smoothingRequired?: number; holdDurationMs?: number }>
};

export function getConfigForSystem(system: SignSystem) {
  const override = THRESHOLD_CONFIG.overrides[system] || {};
  return {
    confidence: override.confidence ?? THRESHOLD_CONFIG.confidence,
    smoothingRequired: override.smoothingRequired ?? THRESHOLD_CONFIG.smoothingRequired,
    smoothingWindow: THRESHOLD_CONFIG.smoothingWindow,
    holdDurationMs: override.holdDurationMs ?? THRESHOLD_CONFIG.holdDurationMs,
  };
}
