'use client';

import React, { forwardRef } from 'react';
import { DeviceFrame } from '@/features/mockups/DeviceFrame';
import { CanvasSettings } from '@/features/mockups/definitions';
import { PREMIUM_BACKGROUNDS } from '@/config/studio-constants';

interface ImageMockupCanvasProps {
  mediaUrl: string | null;
  settings: CanvasSettings;
  // fullRef exposed via forwardRef for background+device capture
}

/**
 * Pure HTML canvas for IMAGE mode — no Remotion, no timeline.
 * Clean, static, ready for PNG export.
 * 
 * Use forwardRef to expose the container ref for html-to-image capture.
 */
export const ImageMockupCanvas = forwardRef<
  { fullRef: HTMLDivElement | null; deviceRef: HTMLDivElement | null },
  ImageMockupCanvasProps
>(function ImageMockupCanvas({ mediaUrl, settings }, ref) {
  const fullRef = React.useRef<HTMLDivElement>(null);
  const deviceRef = React.useRef<HTMLDivElement>(null);

  // Expose both refs to parent
  React.useImperativeHandle(ref, () => ({
    get fullRef() { return fullRef.current; },
    get deviceRef() { return deviceRef.current; },
  }));

  // Resolve background style from current settings
  const getBackgroundStyle = (): React.CSSProperties => {
    const preset = PREMIUM_BACKGROUNDS[settings.backgroundPreset as keyof typeof PREMIUM_BACKGROUNDS];
    const type = preset?.type ?? settings.bgType;
    const value = preset?.value ?? settings.bgValue;

    switch (type) {
      case 'solid':
      case 'gradient':
        return { background: value };
      case 'pattern_dots':
        return {
          backgroundColor: '#F8FAFC',
          backgroundImage: `radial-gradient(${value} 2px, transparent 2px)`,
          backgroundSize: '30px 30px',
        };
      case 'pattern_grid':
        return {
          backgroundColor: '#F8FAFC',
          backgroundImage: `linear-gradient(to right, ${value} 1px, transparent 1px), linear-gradient(to bottom, ${value} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        };
      default:
        // Transparency checkerboard pattern
        return {
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        };
    }
  };

  return (
    // ── Full canvas (background included) ──────────────────────────
    <div
      ref={fullRef}
      className="relative w-full h-full overflow-hidden"
      style={getBackgroundStyle()}
    >
      {/* Device frame area with padding */}
      <div
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Device-only ref (transparent bg for export without background) */}
        <div className="h-full w-full flex items-center justify-center">
          <DeviceFrame
            ref={deviceRef}
            mediaUrl={mediaUrl}
            mediaType="image"
            settings={settings}
          />
        </div>
      </div>
    </div>
  );
});
