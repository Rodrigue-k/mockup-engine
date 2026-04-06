import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

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
    const stream = createReadStream(filePath);

    // Create a streaming response
    const response = new NextResponse(stream as any);

    // Set headers for download
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    response.headers.set('Content-Length', stats.size.toString());

    // DELETE FILE AFTER SENDING
    // We use a small hack: we attach a callback to the response stream finishing
    // or we just wait for the response to be 'ready' and then unlink.
    // In Next.js App Router, the response is sent immediately.
    // However, the cleanest way to delete after streaming is to do it in the background
    // after a short delay or by listening to the stream close.
    
    stream.on('close', async () => {
      try {
        await unlink(filePath);
        console.log(`Ephemeral file deleted: ${safeFilename}`);
      } catch (e) {
        console.error(`Failed to delete ephemeral file ${safeFilename}:`, e);
      }
    });

    return response;
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
