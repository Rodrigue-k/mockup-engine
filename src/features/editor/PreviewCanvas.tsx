'use client';

import React, { useRef } from 'react';
import { Player } from '@remotion/player';
import { RemotionDeviceFrame } from '@/remotion/RemotionDeviceFrame';
import { ImageMockupCanvas } from './ImageMockupCanvas';
import { useStudioStore } from '@/store/useStudioStore';
import { FORMAT_DIMENSIONS, AspectRatio } from '@/config/studio-constants';

// Expose canvas refs globally so ControlPanel can trigger PNG export
export type CanvasRefs = {
  fullRef: HTMLDivElement | null;
  deviceRef: HTMLDivElement | null;
};

// Module-level ref for export access
let _canvasRefs: CanvasRefs | null = null;
export const getCanvasRefs = () => _canvasRefs;

export const PreviewCanvas: React.FC = () => {
  const { mediaPreviewUrl, mediaType, canvasSettings } = useStudioStore();

  const formatKey = (canvasSettings.format as AspectRatio) || '9:16';
  const dimensions = FORMAT_DIMENSIONS[formatKey] || FORMAT_DIMENSIONS['9:16'];

  // Ref for ImageMockupCanvas (image mode only)
  const imageMockupRef = useRef<{ fullRef: HTMLDivElement | null; deviceRef: HTMLDivElement | null }>(null);

  // Expose refs for external export trigger
  React.useEffect(() => {
    _canvasRefs = imageMockupRef.current;
  });

  const isImageMode = mediaType === 'image' || mediaType === null;

  return (
    <div className="relative z-10 flex items-center justify-center w-full h-full p-8">
      {/* Studio Stage */}
      <div
        className="relative flex items-center justify-center max-h-full max-w-full overflow-hidden select-none"
        style={{
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          height: '100%',
        }}
      >
        {isImageMode ? (
          // ── IMAGE MODE: Static canvas, clean, no timeline ─────────
          <ImageMockupCanvas
            ref={imageMockupRef}
            mediaUrl={mediaPreviewUrl}
            settings={{
              ...canvasSettings,
              baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
            }}
          />
        ) : (
          // ── VIDEO MODE: Remotion Player with timeline ─────────────
          <Player
            component={RemotionDeviceFrame as any}
            inputProps={{
              mediaUrl: mediaPreviewUrl,
              mediaType: mediaType,
              settings: {
                ...canvasSettings,
                baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
              },
            }}
            durationInFrames={300}
            compositionWidth={dimensions.width}
            compositionHeight={dimensions.height}
            fps={30}
            style={{ width: '100%', height: '100%' }}
            controls
            autoPlay={false}
            loop
            acknowledgeRemotionLicense={true}
          />
        )}
      </div>
    </div>
  );
};
