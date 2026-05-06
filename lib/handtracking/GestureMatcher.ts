import { HandFeatures, FingerState } from './types';
import { GestureModelTrainer } from './ModelTrainer';

// Sistem yang sudah punya ML model — TIDAK pakai template fallback
const ML_ONLY_SYSTEMS = new Set(['bisindo', 'sibi', 'asl']);

// ─── Cache trainer per sistem ─────────────────────────────────────────────────
const trainerCache: Record<string, GestureModelTrainer> = {};

async function getTrainer(system: string): Promise<GestureModelTrainer | null> {
  if (trainerCache[system]?.isReady) return trainerCache[system];

  const t = new GestureModelTrainer();
  const ok = await t.loadFromPublic(system);
  if (!ok) return null;

  trainerCache[system] = t;
  return t;
}

export function clearTrainerCache(system?: string): void {
  if (system) delete trainerCache[system];
  else Object.keys(trainerCache).forEach(k => delete trainerCache[k]);
}

// ─── ML matcher ───────────────────────────────────────────────────────────────
export async function matchGestureML(
  landmarks: number[],
  system: string
): Promise<{ label: string; confidence: number } | null> {
  const trainer = await getTrainer(system);
  if (!trainer) return null;
  return trainer.predict(landmarks);
}

// ─── Template matcher (hanya untuk sistem tanpa ML model) ─────────────────────
function matchFinger(f1: FingerState, f2: FingerState): boolean {
  return f1.isExtended === f2.isExtended;
}

export function matchGesture(
  liveFeatures: HandFeatures,
  templateFeatures: HandFeatures
): boolean {
  const weights: Record<keyof HandFeatures['fingers'], number> = {
    thumb: 2, index: 2, middle: 1, ring: 1, pinky: 1,
  };
  let score = 0;
  for (const [finger, weight] of Object.entries(weights)) {
    const f = finger as keyof HandFeatures['fingers'];
    if (matchFinger(liveFeatures.fingers[f], templateFeatures.fingers[f])) score += weight;
  }
  return score >= 5;
}

// ─── Unified matcher ──────────────────────────────────────────────────────────
export interface MatchResult {
  label: string;
  confidence: number;
  source: 'ml' | 'template' | 'none';
  isMatch: boolean;
}

export async function matchGestureAuto(opts: {
  landmarks: number[] | null;
  liveFeatures: HandFeatures;
  templateFeatures: HandFeatures;
  templateLabel: string;
  system: string;
  confidenceThreshold?: number;
}): Promise<MatchResult> {
  const {
    landmarks,
    liveFeatures,
    templateFeatures,
    templateLabel,
    system,
    confidenceThreshold = 0.6,
  } = opts;

  const hasMLModel = ML_ONLY_SYSTEMS.has(system);

  // ── Coba ML dulu ────────────────────────────────────────────────────────────
  if (landmarks !== null) {
    const mlResult = await matchGestureML(landmarks, system);

    if (mlResult) {
      const isMatch = mlResult.label === templateLabel
        && mlResult.confidence >= confidenceThreshold;
      return {
        label: mlResult.label,
        confidence: mlResult.confidence,
        source: 'ml',
        isMatch,
      };
    }
  }

  // ── Kalau sistem punya ML model tapi gagal predict → TIDAK lolos ────────────
  // (model belum load, landmarks null, atau feature size salah)
  // Ini mencegah gestur sistem lain lolos lewat template fallback
  if (hasMLModel) {
    return { label: '', confidence: 0, source: 'none', isMatch: false };
  }

  // ── Template fallback hanya untuk sistem tanpa ML (misal: international) ────
  const isMatch = matchGesture(liveFeatures, templateFeatures);
  return {
    label: isMatch ? templateLabel : '',
    confidence: isMatch ? 0.5 : 0,
    source: 'template',
    isMatch,
  };
}

export async function isModelReady(system: string): Promise<boolean> {
  const trainer = await getTrainer(system);
  return trainer !== null;
}