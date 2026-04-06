import { toPng } from 'html-to-image';

export interface ExportOptions {
  filename?: string;
  withBackground?: boolean;
  isTransparent?: boolean;
}

/**
 * Converts an image element to a Data URL (Base64) by drawing it to a temporary canvas.
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
    console.warn('Failed to inline image, falling back to original src:', e);
    return img.src;
  }
};

export const exportToPng = async (
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: ExportOptions = {}
) => {
  const { 
    filename = `mockup-${Date.now()}.png`,
    isTransparent = false 
  } = options;

  const originalElement = containerRef.current;
  if (!originalElement) {
    console.error('Export failed: Ref is null');
    return;
  }

  // 1. Create a deep clone to avoid modifying the LIVE UI
  const clone = originalElement.cloneNode(true) as HTMLDivElement;
  
  // 2. Wrap clone in a hidden container to ensure it maintains layout but is invisible
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
    // 3. Wait for fonts
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }

    // 4. Inlining and Transparency on the CLONE only
    const cloneImages = Array.from(clone.querySelectorAll('img'));
    
    // Ensure images in the clone are decoded (they should be as they are copies of the live ones)
    const imagePromises = cloneImages.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    await Promise.all(imagePromises);

    // NUCLEAR STEP: Inline images in the clone
    cloneImages.forEach(img => {
      img.src = getImageAsDataUrl(img);
    });

    // STRIP BACKGROUND in clone
    if (isTransparent) {
      clone.style.background = 'transparent';
      clone.style.backgroundImage = 'none';
      clone.style.backgroundColor = 'transparent';
    }

    // Capture the CLONE
    const dataUrl = await toPng(clone, {
      pixelRatio: 2,
      quality: 1,
      cacheBust: false,
      skipAutoScale: true,
      backgroundColor: isTransparent ? undefined : (originalElement.style.backgroundColor || '#ffffff'),
    });

    // Download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    const errorMsg = error instanceof Error 
      ? error.message 
      : (error instanceof Event ? `Event: ${error.type}` : JSON.stringify(error));
      
    console.error('Error during local PNG export:', errorMsg);
    throw error;
  } finally {
    // Clean up: Remove the clone from DOM
    if (hiddenContainer.parentNode) {
      document.body.removeChild(hiddenContainer);
    }
  }
};
