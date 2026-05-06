export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FingerState {
  isExtended: boolean;
  curlAngle: number;
}

export interface HandFeatures {
  fingers: {
    thumb: FingerState;
    index: FingerState;
    middle: FingerState;
    ring: FingerState;
    pinky: FingerState;
  };
}

export interface GestureTemplate {
  letter: string;
  features: HandFeatures;
}
