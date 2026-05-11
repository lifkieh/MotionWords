import type { Hands, Results, Options } from '@mediapipe/hands';
import { Point3D } from './types';

export type Handedness = 'Left' | 'Right' | null;

// Callback: primary = tangan utama, secondary = tangan kedua (bisa null)
// primaryHandedness / secondaryHandedness = label anatomis dari MediaPipe
type DualHandCallback = (
  primary: Point3D[] | null,
  secondary: Point3D[] | null,
  primaryHandedness: Handedness,
  secondaryHandedness: Handedness
) => void;

export class HandTracker {
  private hands: Hands | null = null;
  private onResultsCallback: DualHandCallback | null = null;
  private isRunning = false;
  private stream: MediaStream | null = null;

  constructor(private videoElement: HTMLVideoElement) { }

  // ─── Callback ──────────────────────────────────────────────
  onResults(callback: DualHandCallback): void {
    this.onResultsCallback = callback;
  }

  // ─── Camera setup ──────────────────────────────────────────
  private async setupCamera(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.videoElement.srcObject = this.stream;
    return new Promise<void>((resolve) => {
      this.videoElement.onloadedmetadata = () => {
        this.videoElement.play();
        resolve();
      };
    });
  }

  private startTracking(): void {
    this.isRunning = true;
    const frameLoop = async () => {
      if (!this.isRunning || !this.hands || this.videoElement.readyState < 2) return;
      await this.hands.send({ image: this.videoElement });
      if (this.isRunning) requestAnimationFrame(frameLoop);
    };
    frameLoop();
  }

  // ─── Start ─────────────────────────────────────────────────
  async start(): Promise<void> {
    let HandsClass: any;
    if (typeof window !== 'undefined') {
      const mp = require('@mediapipe/hands');
      HandsClass = mp.Hands || (mp as any).default?.Hands || (window as any).Hands;
    }
    if (!HandsClass) {
      console.error('Failed to load MediaPipe Hands.');
      return;
    }

    this.hands = new HandsClass({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    }) as Hands;

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    } as Options);

    this.hands.onResults((results: Results) => {
      if (!this.onResultsCallback) return;

      const all = results.multiHandLandmarks ?? [];
      const handedness = results.multiHandedness ?? [];

      if (all.length === 0) {
        this.onResultsCallback(null, null, null, null);
        return;
      }

      // MediaPipe handedness = label anatomis tangan pengguna
      // "Right" = tangan kanan user, "Left" = tangan kiri user
      let right: Point3D[] | null = null;
      let left: Point3D[] | null = null;
      let rightLabel: Handedness = null;
      let leftLabel: Handedness = null;

      for (let i = 0; i < all.length; i++) {
        const label = handedness[i]?.label;
        const lm = all[i] as unknown as Point3D[];
        if (label === 'Right') {
          right = lm;
          rightLabel = 'Right';
        } else if (label === 'Left') {
          left = lm;
          leftLabel = 'Left';
        }
      }

      // Primary = tangan pertama yang terdeteksi (right diprioritaskan, fallback ke left)
      const primary = right ?? left;
      const primaryHandedness = right ? rightLabel : leftLabel;

      // Secondary = tangan kedua (hanya jika KEDUA tangan terdeteksi)
      const secondary = (right !== null && left !== null) ? left : null;
      const secondaryHandedness = (right !== null && left !== null) ? leftLabel : null;

      this.onResultsCallback(primary, secondary, primaryHandedness, secondaryHandedness);
    });

    await this.setupCamera();
    this.startTracking();
  }

  // ─── Stop ──────────────────────────────────────────────────
  stop(): void {
    this.isRunning = false;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }
  }
}