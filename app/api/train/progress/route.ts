import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// J dan Z tidak ada karena dynamic gesture
const ALPHABET = 'ABCDEFGHIKLMNOPQRSTUVWXY'.split('');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'sibi';

  // Inisialisasi semua huruf ke 0
  const progress: Record<string, number> = {};
  ALPHABET.forEach(l => { progress[l] = 0; });

  const baseDir = path.join(process.cwd(), 'public', 'landmarks', language);

  try {
    await fs.access(baseDir);
  } catch {
    // Folder belum ada — return semua 0
    return NextResponse.json(progress);
  }

  // Hitung baris di setiap CSV (minus header)
  await Promise.all(
    ALPHABET.map(async letter => {
      const csvPath = path.join(baseDir, `${letter}.csv`);
      try {
        const content = await fs.readFile(csvPath, 'utf8');
        const lines = content.trim().split('\n');
        // Baris pertama = header, sisanya = data
        progress[letter] = Math.max(0, lines.length - 1);
      } catch {
        // File belum ada = 0 sample
        progress[letter] = 0;
      }
    })
  );

  return NextResponse.json(progress);
}
