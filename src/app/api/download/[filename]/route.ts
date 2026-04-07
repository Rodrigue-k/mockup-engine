import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  if (!filename) {
    return NextResponse.json({ error: 'Filename missing' }, { status: 400 });
  }

  // Prevent directory traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), 'public', 'exports', safeFilename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const stats = fs.statSync(filePath);
    const nodeStream = createReadStream(filePath);
    
    // Convert Node.js stream to Web Stream for Next.js App Router stability
    // @ts-ignore
    const stream = Readable.toWeb(nodeStream);

    // Detect MIME type more robustly
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webm': 'video/webm',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Set headers for universal download compatibility
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', stats.size.toString());
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    // RFC 6266 + Chrome consistency
    const cleanFilename = safeFilename.replace(/[^a-z0-9._-]/gi, '_');
    const encodedFilename = encodeURIComponent(cleanFilename).replace(/['()'*]/g, c => `%${c.charCodeAt(0).toString(16)}`);
    headers.set('Content-Disposition', `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodedFilename}`);

    // Create a streaming response
    const response = new NextResponse(stream as any, { headers });

    // EPHEMERAL CLEANUP (with 15s safety delay)
    // We delay the unlink to allow Chrome to handle range requests or retries
    nodeStream.on('open', () => {
      setTimeout(async () => {
        try {
          if (fs.existsSync(filePath)) {
            await unlink(filePath);
            console.log(`Ephemeral file deleted (Dynamic Route): ${safeFilename}`);
          }
        } catch (e) {
          console.error(`Failed to delete ephemeral file ${safeFilename}:`, e);
        }
      }, 15000); // 15 seconds delay
    });

    return response;
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
