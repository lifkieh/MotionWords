import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'sibi';

  const baseDir = path.join(process.cwd(), 'public', 'signs', language, 'train');
  
  const progress: Record<string, number> = {};
  
  try {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXY'.split('').filter(l => l !== 'J');
    letters.forEach(l => { progress[l] = 0; });

    try {
      await fs.access(baseDir);
    } catch {
      return NextResponse.json(progress); 
    }

    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.length === 1) {
        const letter = entry.name.toUpperCase();
        if (progress[letter] !== undefined) {
          const files = await fs.readdir(path.join(baseDir, entry.name));
          progress[letter] = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png')).length;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  return NextResponse.json(progress);
}
