import { Point3D, HandFeatures, FingerState } from './types';

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────

function distance(p1: Point3D, p2: Point3D): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

function calculateAngle(p1: Point3D, p2: Point3D, p3: Point3D): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
  const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);
  if (mag1 === 0 || mag2 === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * 180) / Math.PI;
}

// ─────────────────────────────────────────────────────────────
// HandFeatures extractor (tidak diubah — untuk template fallback)
// ─────────────────────────────────────────────────────────────

function analyzeFinger(
  landmarks: Point3D[],
  rootIdx: number,
  isThumb = false
): FingerState {
  const mcp = landmarks[rootIdx];
  const pip = landmarks[rootIdx + 1];
  const dip = landmarks[rootIdx + 2];
  const tip = landmarks[rootIdx + 3];
  const curlAngle = calculateAngle(mcp, pip, dip) + calculateAngle(pip, dip, tip);
  let isExtended = false;
  if (isThumb) {
    isExtended =
      distance(tip, landmarks[17]) > distance(landmarks[2], landmarks[17]) &&
      curlAngle > 140;
  } else {
    isExtended = distance(tip, landmarks[0]) > distance(pip, landmarks[0]);
  }
  return { isExtended, curlAngle };
}

export function extractFeatures(landmarks: Point3D[]): HandFeatures {
  if (landmarks.length !== 21) throw new Error('Expected 21 landmarks');
  return {
    fingers: {
      thumb: analyzeFinger(landmarks, 1, true),
      index: analyzeFinger(landmarks, 5),
      middle: analyzeFinger(landmarks, 9),
      ring: analyzeFinger(landmarks, 13),
      pinky: analyzeFinger(landmarks, 17),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Flat vector untuk ML — satu tangan (42 nilai)
// ─────────────────────────────────────────────────────────────

export function extractLandmarks(landmarks: Point3D[]): number[] | null {
  if (landmarks.length !== 21) return null;
  const wx = landmarks[0].x;
  const wy = landmarks[0].y;
  const scaleX = landmarks[9].x - wx;
  const scaleY = landmarks[9].y - wy;
  const scale = Math.sqrt(scaleX ** 2 + scaleY ** 2);
  if (scale < 1e-6) return null;
  return landmarks.flatMap((lm) => [(lm.x - wx) / scale, (lm.y - wy) / scale]);
}

// ─────────────────────────────────────────────────────────────
// Dual hand vector untuk BISINDO (84 nilai = h0 + h1)
// secondaryLandmarks null/undefined → h1 diisi zeros
// ─────────────────────────────────────────────────────────────

export function extractLandmarksDualHand(
  primaryLandmarks: Point3D[],
  secondaryLandmarks?: Point3D[] | null
): number[] | null {
  const primary = extractLandmarks(primaryLandmarks);
  if (!primary) return null;

  const secondary = secondaryLandmarks
    ? (extractLandmarks(secondaryLandmarks) ?? new Array(42).fill(0))
    : new Array(42).fill(0);

  return [...primary, ...secondary]; // 84 nilai
}

// ─────────────────────────────────────────────────────────────
// extractAll — convenience untuk satu tangan (practice page)
// ─────────────────────────────────────────────────────────────

export function extractAll(landmarks: Point3D[]): {
  features: HandFeatures;
  vector: number[] | null;
} {
  return {
    features: extractFeatures(landmarks),
    vector: extractLandmarks(landmarks),
  };
}

// ─────────────────────────────────────────────────────────────
// extractAllDual — convenience untuk dua tangan (BISINDO)
// ─────────────────────────────────────────────────────────────

export function extractAllDual(
  primaryLandmarks: Point3D[],
  secondaryLandmarks?: Point3D[] | null
): {
  features: HandFeatures;
  vector: number[] | null;
} {
  return {
    features: extractFeatures(primaryLandmarks),
    vector: extractLandmarksDualHand(primaryLandmarks, secondaryLandmarks),
  };
}