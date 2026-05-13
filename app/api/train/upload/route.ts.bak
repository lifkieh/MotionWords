import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { language, letter, imageBase64 } = await request.json();
    
    if (!language || !letter || !imageBase64) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const targetDir = path.join(process.cwd(), 'public', 'signs', language, 'train', letter.toUpperCase());
    
    await fs.mkdir(targetDir, { recursive: true });
    
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const fileName = `${timestamp}_${randomSuffix}.jpg`;
    
    const filePath = path.join(targetDir, fileName);
    
    await fs.writeFile(filePath, buffer);
    
    return NextResponse.json({ success: true, fileName });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
