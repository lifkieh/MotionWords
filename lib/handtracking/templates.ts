import { HandFeatures } from './types';

const f = (
  t: number, i: number, m: number, r: number, p: number,
  pinch?: number
): HandFeatures => ({
  fingers: {
    thumb: { isExtended: t < 60, curlAngle: t },
    index: { isExtended: i < 60, curlAngle: i },
    middle: { isExtended: m < 60, curlAngle: m },
    ring: { isExtended: r < 60, curlAngle: r },
    pinky: { isExtended: p < 60, curlAngle: p },
  },
  pinch: pinch ? { thumbIndex: pinch } : undefined
});

export const templates: Record<string, HandFeatures> = {
  A: f(30, 120, 120, 120, 120),
  B: f(120, 10, 10, 10, 10),
  C: f(40, 40, 40, 40, 40),
  D: f(100, 10, 120, 120, 120),
  E: f(120, 120, 120, 120, 120),
  F: f(10, 10, 20, 20, 80, 0.03),
  G: f(10, 10, 120, 120, 120),
  H: f(100, 10, 10, 120, 120),
  I: f(120, 120, 120, 120, 10),
  J: f(120, 120, 120, 120, 10),
  K: f(10, 10, 10, 120, 120),
  L: f(10, 10, 120, 120, 120),
  M: f(120, 120, 120, 120, 120),
  N: f(110, 120, 120, 120, 120),
  O: f(60, 60, 60, 60, 60, 0.02),
  P: f(20, 20, 20, 120, 120),
  Q: f(20, 20, 120, 120, 120),
  R: f(120, 10, 10, 120, 120),
  S: f(120, 120, 120, 120, 120),
  T: f(110, 120, 120, 120, 120),
  U: f(120, 10, 10, 120, 120),
  V: f(120, 10, 10, 120, 120),
  W: f(120, 10, 10, 10, 120),
  X: f(120, 40, 120, 120, 120),
  Y: f(10, 120, 120, 120, 10),
  Z: f(120, 40, 120, 120, 120),
};