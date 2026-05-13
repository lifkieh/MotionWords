import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// ─── Format satu baris CSV ───────────────────────────────────────────────────
// label, handedness, timestamp, x0, y0, x1, y1, ... x20, y20
// Total kolom: 3 + 42 = 45 (single-hand) atau 3 + 84 = 87 (dual-hand / BISINDO)
// ─────────────────────────────────────────────────────────────────────────────

interface UploadPayload {
  language: string;
  letter: string;
  vector: number[];       // 42 atau 84 nilai ternormalisasi
  handedness: string;     // 'Left' | 'Right'
  timestamp: number;
}

export async function POST(request: Request) {
  try {
    const payload: UploadPayload = await request.json();
    const { language, letter, vector, handedness, timestamp } = payload;

    // ── Validasi input ───────────────────────────────────────────────────────
    if (!language || !letter || !vector || !Array.isArray(vector)) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    const validLengths = [42, 84];
    if (!validLengths.includes(vector.length)) {
      return NextResponse.json(
        { error: `Invalid vector length: ${vector.length}. Expected 42 (single-hand) or 84 (dual-hand)` },
        { status: 400 }
      );
    }

    const cleanLetter = letter.toUpperCase().slice(0, 1);
    if (!/^[A-Z]$/.test(cleanLetter)) {
      return NextResponse.json({ error: 'Invalid letter' }, { status: 400 });
    }

    // ── Path: public/landmarks/{language}/{letter}.csv ───────────────────────
    // Semua sample satu huruf dikumpulkan dalam satu file CSV
    // Ini memudahkan load ke pandas/numpy saat training
    const targetDir = path.join(process.cwd(), 'public', 'landmarks', language);
    await fs.mkdir(targetDir, { recursive: true });

    const csvPath = path.join(targetDir, `${cleanLetter}.csv`);

    // ── Tulis header jika file belum ada ────────────────────────────────────
    let fileExists = true;
    try {
      await fs.access(csvPath);
    } catch {
      fileExists = false;
    }

    if (!fileExists) {
      const featureCount = vector.length; // 42 atau 84
      const coordHeaders = Array.from({ length: featureCount / 2 }, (_, i) => `x${i},y${i}`).join(',');
      const header = `label,handedness,timestamp,${coordHeaders}\n`;
      await fs.writeFile(csvPath, header, 'utf8');
    }

    // ── Tulis satu baris data ────────────────────────────────────────────────
    const vectorStr = vector.map(v => v.toFixed(6)).join(',');
    const row = `${cleanLetter},${handedness ?? 'Unknown'},${timestamp ?? Date.now()},${vectorStr}\n`;

    await fs.appendFile(csvPath, row, 'utf8');

    // ── Hitung total sample untuk response ──────────────────────────────────
    const content = await fs.readFile(csvPath, 'utf8');
    // Jumlah baris - 1 (header)
    const sampleCount = content.trim().split('\n').length - 1;

    return NextResponse.json({ success: true, sampleCount });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
