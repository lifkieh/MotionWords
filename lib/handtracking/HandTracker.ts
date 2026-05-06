import type { Hands, Results, Options } from '@mediapipe/hands';
import { Point3D } from './types';

// Callback: primary = tangan utama, secondary = tangan kedua (bisa null)
type DualHandCallback = (
  primary: Point3D[] | null,
  secondary: Point3D[] | null
) => void;

export class HandTracker {
  private hands: Hands | null = null;
  private onResultsCallback: DualHandCallback | null = null;
  private isRunning = false;
  private stream: MediaStream | null = null;

  constructor(private videoElement: HTMLVideoElement) { }

  // ─── Callback — sekarang terima dua tangan ─────────────────
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
      maxNumHands: 2,          // ← deteksi 2 tangan
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    } as Options);

    this.hands.onResults((results: Results) => {
      if (!this.onResultsCallback) return;

      const all = results.multiHandLandmarks ?? [];
      const primary = (all[0] as unknown as Point3D[]) ?? null;
      const secondary = (all[1] as unknown as Point3D[]) ?? null;

      this.onResultsCallback(primary, secondary);
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