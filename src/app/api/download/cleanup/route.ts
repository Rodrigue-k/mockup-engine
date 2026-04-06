import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { unlink } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Prevent directory traversal
  const safe = path.basename(filename);
  const filePath = path.join(process.cwd(), 'public', 'exports', safe);

  try {
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
      console.log(`Ephemeral file deleted: ${safe}`);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Cleanup error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
