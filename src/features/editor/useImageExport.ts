import { toBlob } from 'html-to-image';

export interface ExportOptions {
  filename?: string;
  isTransparent?: boolean;
}

/**
 * Converts an image element to a Data URL by drawing it to a canvas.
 * This effectively inlines the image data, bypassing SVG sandbox/CORS hurdles.
 */
const getImageAsDataUrl = (img: HTMLImageElement): string => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx || canvas.width === 0) return img.src;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Failed to inline image:', e);
    return img.src;
  }
};

/**
 * Trigger a browser download for a Blob with maximum compatibility.
 */
const triggerDownload = (blob: Blob, filename: string) => {
  // Re-wrap the blob with an explicit MIME type to ensure Chrome doesn't ignore the extension
  const typedBlob = new Blob([blob], { type: 'image/png' });
  
  // Sanitize the filename one last time for Windows safety
  const safeFilename = filename.replace(/[^a-z0-9._-]/gi, '_');
  
  const url = URL.createObjectURL(typedBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename;
  
  // Required for some Chrome versions/extensions to trigger reliably
  link.style.display = 'none';
  document.body.appendChild(link);
  
  // Use .click() for the most reliable cross-browser download trigger
  link.click();

  // Cleanup after a delay so the browser can initiate the file stream
  setTimeout(() => {
    if (link.parentNode) document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 15000);
};

export const exportToPng = async (
  containerRef: { current: HTMLElement | null },
  options: ExportOptions = {}
) => {
  const {
    filename = `mockup-${Date.now()}.png`,
    isTransparent = false,
  } = options;

  const originalElement = containerRef.current;
  if (!originalElement) {
    console.error('Export failed: element ref is null');
    return;
  }

  console.log('[Export] Starting PNG capture...');

  // 1. Create a hidden clone to avoid visual glitches in the active UI
  const clone = originalElement.cloneNode(true) as HTMLElement;
  const hiddenContainer = document.createElement('div');
  Object.assign(hiddenContainer.style, {
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
    width: `${originalElement.offsetWidth}px`,
    height: `${originalElement.offsetHeight}px`,
    overflow: 'hidden',
    pointerEvents: 'none',
  });
  hiddenContainer.appendChild(clone);
  document.body.appendChild(hiddenContainer);

  try {
    // 2. Wait for fonts and resource readiness
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }

    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // 3. Inline images as Base64 to bypass SVG cross-origin restrictions in html-to-image
    images.forEach((img) => {
      img.src = getImageAsDataUrl(img);
    });

    if (isTransparent) {
      clone.style.background = 'transparent';
      clone.style.backgroundColor = 'transparent';
      clone.style.backgroundImage = 'none';
    }

    console.log('[Export] Generating Blob...');

    // 4. Generate the Blob directly (bypasses Chrome's block on data:URL fetching)
    const blob = await toBlob(clone, {
      pixelRatio: 2, // High resolution
      quality: 1,
      cacheBust: true,
      backgroundColor: isTransparent ? undefined : '#ffffff',
    });

    if (!blob) throw new Error('Failed to generate image blob');

    console.log('[Export] Triggering download:', filename);
    triggerDownload(blob, filename);

  } catch (error) {
    console.error('[Export] Error:', error);
    throw error;
  } finally {
    // Clean up our hidden clone
    if (hiddenContainer.parentNode) {
      document.body.removeChild(hiddenContainer);
    }
  }
};
