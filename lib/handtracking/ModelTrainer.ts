import * as tf from '@tensorflow/tfjs';

interface ModelMetadata {
    labelMap: string[];
    featureSize: number;
    numClasses: number;
    finalAcc: number;
    system: string;
}

export class GestureModelTrainer {
    private model: tf.LayersModel | null = null;
    public labelMap: string[] = [];
    public featureSize = 42;

    // ─── Load dari file statis di /public/models/{system}/ ───────────────────
    // Tidak perlu training di browser, tidak perlu IndexedDB
    // Model di-bundle ke project dan tersedia untuk semua user
    async loadFromPublic(system: string): Promise<boolean> {
        try {
            // Load metadata dulu
            const metaRes = await fetch(`/models/${system}/metadata.json`);
            if (!metaRes.ok) return false;
            const meta: ModelMetadata = await metaRes.json();

            this.labelMap = meta.labelMap;
            this.featureSize = meta.featureSize;

            // Load TF.js LayersModel dari model.json + .bin
            this.model = await tf.loadLayersModel(`/models/${system}/model.json`);
            console.log(`[ModelTrainer] Loaded ${system} | features=${this.featureSize} | acc=${(meta.finalAcc * 100).toFixed(1)}%`);
            return true;
        } catch (err) {
            console.error(`[ModelTrainer] Failed to load ${system}:`, err);
            return false;
        }
    }

    // ─── Predict ─────────────────────────────────────────────────────────────
    predict(landmarks: number[]): { label: string; confidence: number } | null {
        if (!this.model || this.labelMap.length === 0) return null;
        if (landmarks.length !== this.featureSize) {
            console.warn(`[ModelTrainer] Expected ${this.featureSize} features, got ${landmarks.length}`);
            return null;
        }
        return tf.tidy(() => {
            const input = tf.tensor2d([landmarks]);
            const probs = this.model!.predict(input) as tf.Tensor;
            const arr = Array.from(probs.dataSync());
            const maxIdx = arr.indexOf(Math.max(...arr));
            return { label: this.labelMap[maxIdx], confidence: arr[maxIdx] };
        });
    }

    predictTop3(landmarks: number[]): Array<{ label: string; confidence: number }> {
        if (!this.model || this.labelMap.length === 0) return [];
        if (landmarks.length !== this.featureSize) return [];
        return tf.tidy(() => {
            const input = tf.tensor2d([landmarks]);
            const probs = this.model!.predict(input) as tf.Tensor;
            const arr = Array.from(probs.dataSync());
            return arr
                .map((conf, idx) => ({ label: this.labelMap[idx], confidence: conf }))
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 3);
        });
    }

    get isReady(): boolean {
        return this.model !== null && this.labelMap.length > 0;
    }
}