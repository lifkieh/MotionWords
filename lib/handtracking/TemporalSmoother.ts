// ─────────────────────────────────────────────────────────────
// TemporalSmoother
//
// Masalah yang diselesaikan:
//   Saat tangan bergerak, ML model sering output huruf yang salah
//   selama beberapa frame (flicker). Ini menyebabkan:
//     - Huruf berkedip di UI
//     - Score practice salah terhitung
//
// Solusi:
//   Kumpulkan N prediksi terakhir, ambil yang paling sering muncul
//   (majority vote). Prediksi hanya diterima jika konsisten.
//
// Cara pakai:
//   const smoother = new TemporalSmoother(10, 0.6);
//
//   // Di loop per-frame:
//   const stable = smoother.push(rawPrediction, confidence);
//   if (stable) console.log(stable.label, stable.confidence);
// ─────────────────────────────────────────────────────────────

interface PredictionEntry {
    label: string;
    confidence: number;
}

export interface SmoothedResult {
    label: string;
    confidence: number;       // rata-rata confidence untuk label pemenang
    stability: number;        // 0–1: seberapa konsisten N frame terakhir
    frameCount: number;       // berapa frame sudah dikumpulkan
}

export class TemporalSmoother {
    private buffer: PredictionEntry[] = [];

    /**
     * @param windowSize  Jumlah frame yang dipertimbangkan (default 10)
     * @param minStability Minimum stability untuk dianggap valid (default 0.6 = 60% frame setuju)
     */
    constructor(
        private windowSize = 10,
        private minStability = 0.6
    ) { }

    /**
     * Tambah prediksi baru dari satu frame.
     * Return SmoothedResult jika sudah cukup stabil, null jika belum.
     */
    push(label: string, confidence: number): SmoothedResult | null {
        // Abaikan prediksi kosong
        if (!label) return null;

        this.buffer.push({ label, confidence });

        // Jaga ukuran buffer
        if (this.buffer.length > this.windowSize) {
            this.buffer.shift();
        }

        // Butuh minimal setengah window sebelum mulai output
        if (this.buffer.length < Math.ceil(this.windowSize / 2)) return null;

        return this.getStable();
    }

    /** Ambil hasil stabil saat ini tanpa menambah frame baru */
    getStable(): SmoothedResult | null {
        if (this.buffer.length === 0) return null;

        // Hitung vote per label
        const votes = new Map<string, { count: number; totalConf: number }>();
        for (const entry of this.buffer) {
            const existing = votes.get(entry.label) ?? { count: 0, totalConf: 0 };
            votes.set(entry.label, {
                count: existing.count + 1,
                totalConf: existing.totalConf + entry.confidence,
            });
        }

        // Cari pemenang
        let bestLabel = '';
        let bestCount = 0;
        let bestTotalConf = 0;

        for (const [label, { count, totalConf }] of votes) {
            if (count > bestCount || (count === bestCount && totalConf > bestTotalConf)) {
                bestLabel = label;
                bestCount = count;
                bestTotalConf = totalConf;
            }
        }

        const stability = bestCount / this.buffer.length;
        const avgConf = bestTotalConf / bestCount;

        if (stability < this.minStability) return null;

        return {
            label: bestLabel,
            confidence: avgConf,
            stability,
            frameCount: this.buffer.length,
        };
    }

    /** Reset buffer (misal saat tangan tidak terdeteksi beberapa frame) */
    reset(): void {
        this.buffer = [];
    }

    /** Cek apakah buffer kosong */
    get isEmpty(): boolean {
        return this.buffer.length === 0;
    }

    /** Berapa frame sudah terkumpul */
    get size(): number {
        return this.buffer.length;
    }
}