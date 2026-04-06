import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

/**
 * Robust Path-Based Download Route
 * Chrome Standard trusts path segments more than query parameters for file naming.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string; customName: string }> }
) {
  const { filename, customName } = await params;

  if (!filename) {
    return NextResponse.json({ error: 'Filename missing' }, { status: 400 });
  }

  // Prevent directory traversal
  const safeFilename = path.basename(decodeURIComponent(filename));
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

    // Detect extension from the actual file on disk
    const ext = path.extname(safeFilename).toLowerCase();

    // Decode and sanitize the requested display name
    const decodedCustomName = decodeURIComponent(customName);
    const finalDownloadName = decodedCustomName.toLowerCase().endsWith(ext) 
      ? decodedCustomName 
      : `${decodedCustomName}${ext}`;
      
    const cleanDownloadName = finalDownloadName.replace(/[^a-z0-9._-]/gi, '_');
    const encodedFilename = encodeURIComponent(cleanDownloadName).replace(/['()'*]/g, c => `%${c.charCodeAt(0).toString(16)}`);

    // NOTE: Direct path access and forced binary MIME bypass most Chrome Standard security filters.
    const responseHeaders = {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stats.size.toString(),
      'Content-Disposition': `attachment; filename="${cleanDownloadName}"; filename*=UTF-8''${encodedFilename}`,
      'X-Content-Type-Options': 'nosniff',
      'X-Download-Options': 'noopen',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };

    const response = new Response(stream as any, { 
      headers: responseHeaders 
    });

    // EPHEMERAL CLEANUP
    setTimeout(async () => {
      try {
        if (fs.existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (e) {
        console.error(`Cleanup error for ${safeFilename}:`, e);
      }
    }, 60000); 

    return response;
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
