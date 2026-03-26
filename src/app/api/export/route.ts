import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, getVideoMetadata } from '@remotion/renderer';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { exportJobManager } from '@/lib/exportJobs';
import { cleanupOldFiles } from '@/lib/cleanup';
 
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  try {
    // Nettoyage préventif des fichiers de plus de 10 min
    await cleanupOldFiles(10);
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const settingsRaw = formData.get('settings') as string;
    const settings = JSON.parse(settingsRaw);

    if (!file) {
      return NextResponse.json({ success: false, error: "Aucun fichier fourni" }, { status: 400 });
    }

    const tempDir = path.resolve('./public/temp');
    const exportDir = path.resolve('./public/exports');
    
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    const tempFileName = `source-${Date.now()}${path.extname(file.name)}`;
    const tempFilePath = path.join(tempDir, tempFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, buffer);

    const mediaUrl = `/temp/${tempFileName}`;
    const protocol = new URL(req.url).protocol;
    const host = new URL(req.url).host;
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

    // Calcul de la durée dynamique
    let durationInFrames = 300; // Default 10s @ 30fps
    const FPS = 30;

    if (mediaType === 'video') {
      try {
        const metadata = await getVideoMetadata(tempFilePath);
        if (metadata.durationInSeconds) {
          durationInFrames = Math.floor(metadata.durationInSeconds * FPS);
        }
      } catch (e) {
        console.warn("Impossible de lire les métadonnées vidéo.", e);
      }
    }

    // Initialize Job
    exportJobManager.set(jobId, {
      id: jobId,
      progress: 0,
      status: 'processing'
    });

    // Start rendering in background - Do NOT await it here
    (async () => {
      try {
        console.log("Démarrage du bundling Remotion...");
        const bundleLocation = await bundle({
          entryPoint: path.resolve('./src/remotion/Root.tsx'),
          publicDir: path.resolve('./public'),
          // @ts-ignore
          webpackOverride: (config: any) => ({
            ...config,
            resolve: {
              ...config.resolve,
              alias: {
                ...(config.resolve.alias || {}),
                '@': path.resolve('./src'),
              },
            },
          }),
        });
        console.log("Bundle terminé:", bundleLocation);

        const compositionProps = { 
          mediaUrl, 
          mediaType, 
          settings 
        };

        console.log("Sélection de la composition...");
        const composition = await selectComposition({
          serveUrl: bundleLocation,
          id: 'StudioExport',
          inputProps: compositionProps,
        });
        console.log("Composition sélectionnée.");

        // Override duration dynamically
        composition.durationInFrames = durationInFrames;

        const outputFileName = `export-${Date.now()}.mp4`;
        const outputLocation = path.join(exportDir, outputFileName);

        console.log(`Démarrage du rendu média (${durationInFrames} frames) vers ${outputLocation}...`);
        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          codec: 'h264',
          outputLocation: outputLocation,
          inputProps: compositionProps,
          onProgress: ({ progress }) => {
            exportJobManager.update(jobId, { progress: Math.floor(progress * 100) });
          }
        });
        console.log("Rendu terminé avec succès.");

        exportJobManager.update(jobId, { 
          status: 'completed', 
          progress: 100, 
          url: `/exports/${outputFileName}` 
        });

        // Cleanup temp source file
        try { await fs.promises.unlink(tempFilePath); } catch(e) {
          console.error(`Erreur lors du nettoyage du fichier temporaire ${tempFilePath}:`, e);
        }

      } catch (error: any) {
        console.error(`Erreur Job ${jobId}:`, error);
        exportJobManager.update(jobId, { 
          status: 'error', 
          error: error.message || "Erreur inconnue" 
        });
      }
    })();

    return NextResponse.json({ success: true, jobId });

  } catch (error: any) {
    console.error("Erreur d'initialisation de l'export:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
