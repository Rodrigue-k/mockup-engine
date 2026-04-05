import html2canvas from 'html2canvas';

interface ExportOptions {
  withBackground: boolean;
  filename?: string;
}

/**
 * Captures a DOM element using html2canvas.
 * This is more robust for 3D transforms and complex shadows.
 */
export async function exportToPng(
  fullCanvasRef: React.RefObject<HTMLDivElement | null>,
  deviceOnlyRef: React.RefObject<HTMLDivElement | null>,
  options: ExportOptions
): Promise<void> {
  const { withBackground, filename = `mockup-${Date.now()}.png` } = options;

  const target = withBackground ? fullCanvasRef.current : deviceOnlyRef.current;
  if (!target) {
    console.error('[ExportPNG] Target element not found');
    return;
  }

  try {
    const canvas = await html2canvas(target, {
      useCORS: true,
      scale: 2, // Equivalent to 2x pixelRatio for good quality without crashing
      backgroundColor: withBackground ? null : 'transparent',
      logging: false,
      onclone: (clonedDoc) => {
        // Optionnel: On peut ajuster le DOM cloné ici si besoin
      }
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('[ExportPNG] Export failed:', err);
    throw err;
  }
}
