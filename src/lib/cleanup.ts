import fs from 'fs';
import path from 'path';

/**
 * Nettoie les fichiers de rendu anciens.
 */
export async function cleanupOldFiles(maxAgeMinutes: number = 20) {
  const folders = [
    path.resolve('./public/temp'),
    path.resolve('./public/exports')
  ];

  const now = Date.now();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  for (const folder of folders) {
    if (!fs.existsSync(folder)) continue;

    try {
      const files = await fs.promises.readdir(folder);
      
      for (const file of files) {
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(folder, file);
        const stats = await fs.promises.stat(filePath);
        
        const age = now - stats.mtimeMs;
        
        if (age > maxAgeMs) {
          console.log(`[Cleanup] Suppression de ${file} (âge: ${Math.round(age / 1000 / 60)} min)`);
          await fs.promises.unlink(filePath).catch(e => console.error(`[Cleanup] Erreur unlink ${file}`, e));
        }
      }
    } catch (err) {
      console.error(`[Cleanup] Erreur dossier ${folder}`, err);
    }
  }
}
