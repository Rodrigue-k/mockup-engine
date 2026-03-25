/**
 * Universal Mockup Engine - Video Rendering Worker
 * Uses WebCodecs API (VideoDecoder, VideoEncoder) + OffscreenCanvas
 */

// We'll need a way to handle types in workers if ts-loader/next-worker isn't configured for it
// but essentially it's a standard Web Worker.

interface RenderSettings {
  width: number;
  height: number;
  fps: number;
  background: string;
  mockupType: string;
  // ... other parameters
}

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

// Message handler
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT_CANVAS':
      canvas = payload.canvas;
      ctx = canvas!.getContext('2d', { alpha: false, desynchronized: true });
      break;

    case 'START_RENDER':
      await startRendering(payload);
      break;

    case 'STOP_RENDER':
      // Abort logic
      break;
  }
};

async function startRendering({ videoFile, settings }: { videoFile: File, settings: RenderSettings }) {
  if (!canvas || !ctx) {
    self.postMessage({ type: 'ERROR', message: 'Canvas not initialized' });
    return;
  }

  try {
    // 1. Setup VideoDecoder to read frames from the input video
    // 2. Setup VideoEncoder to write frames to the output stream
    // 3. For each decoded frame:
    //    a. Draw the "High-End Studio" background
    //    b. Draw the hardware mockup (iPhone/Mac)
    //    c. Draw the video frame inside the mockup viewport with rounded masks
    //    d. Draw shadow or glass effects
    //    e. Encode the canvas state
    
    // For now, let's implement the basic frame-by-frame loop skeleton
    self.postMessage({ type: 'STATUS', message: 'Engine warming up...' });

    // Mock progress for now to validate connection
    for (let i = 0; i <= 100; i += 10) {
      drawFrame(i, settings);
      self.postMessage({ type: 'PROGRESS', value: i });
      await new Promise(r => setTimeout(r, 50)); // Simulating processing
    }

    self.postMessage({ type: 'COMPLETE' });

  } catch (error: unknown) {
    const err = error as Error;
    self.postMessage({ type: 'ERROR', message: err.message });
  }
}

function drawFrame(progress: number, settings: RenderSettings) {
  if (!ctx || !canvas) return;

  const { width, height, background } = settings;

  // 1. Clear background with the elegant light color
  ctx.fillStyle = background || '#F9F9FB';
  ctx.fillRect(0, 0, width, height);

  // 2. Draw subtle studio grain or gradient (High-End style)
  const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(1, background || '#F9F9FB');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 3. Placeholder for Mockup Drawing
  // In a real implementation, we would draw the device frame here
  // and the video frame within its bounds.
}
