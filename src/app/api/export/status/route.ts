import { NextResponse } from 'next/server';
import { exportJobManager } from '@/lib/exportJobs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('id');

  if (!jobId) {
    return NextResponse.json({ success: false, error: "ID de job manquant" }, { status: 400 });
  }

  const job = exportJobManager.get(jobId);

  if (!job) {
    return NextResponse.json({ success: false, error: "Job non trouvé" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    progress: job.progress,
    status: job.status,
    url: job.url,
    error: job.error
  });
}
