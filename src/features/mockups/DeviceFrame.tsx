import React, { useState, useRef, useLayoutEffect } from 'react';
import { Video, staticFile } from 'remotion';
import {
  CanvasSettings,
  MOCKUPS,
  getAbsoluteScreenStyle,
  getLandscapeMockup
} from '@/features/mockups/definitions';

interface DeviceFrameProps {
  mediaUrl: string | null;
  mediaType: 'video' | 'image' | null;
  settings: CanvasSettings;
  className?: string;
}

export const DeviceFrame = React.forwardRef<HTMLDivElement, DeviceFrameProps>(({
  mediaUrl,
  mediaType,
  settings,
  className = '',
}, ref) => {
  const isLandscape = settings.deviceOrientation === 'landscape';
  const baseMockup = MOCKUPS[settings.mockupType] || MOCKUPS['iphone-17-pro-silver'];
  
  // Use landscape helper if needed
  const mockup = isLandscape ? getLandscapeMockup(baseMockup) : baseMockup;

  const bodyUrl = staticFile(`assets/mockups/${baseMockup.frameId}/body.png`);
  const placeholderUrl = staticFile(`assets/mockups/${baseMockup.frameId}/screen.webp`);
  
  const screenStyle = getAbsoluteScreenStyle(mockup);

  // Scaling state to maintain pixel-perfect alignment
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // If the container is not yet visible or has no size, skip to avoid NaN
      if (rect.width === 0 || rect.height === 0) return;

      // Normalize padding: treat the padding value as relative to a 1000px reference
      // This ensures the mockup looks the same in preview vs final export
      const REFERENCE_SIZE = 1000;
      const paddingRatio = ((settings.padding || 0) * 2) / REFERENCE_SIZE;
      
      // Protect available space: calculate deduction based on actual container size
      const deductionX = rect.width * paddingRatio;
      const deductionY = rect.height * paddingRatio;
      
      const availableWidth = Math.max(20, rect.width - deductionX);
      const availableHeight = Math.max(20, rect.height - deductionY);
      
      // Calculate scale for both dimensions to fit perfectly
      const scaleX = availableWidth / mockup.width;
      const scaleY = availableHeight / mockup.height;
      
      // Use the smaller scale
      let s = Math.min(scaleX, scaleY);

      // Snap to edges if padding is near zero to eliminate sub-pixel gaps
      // We use 101% scale when padding is 0 to hide the tiny transparent pixels 
      // at the edge of the mockup PNG image files.
      // Snap to edges if padding is near zero to eliminate sub-pixel gaps
      if ((settings.padding || 0) < 1) {
        if (Math.abs(s - scaleX) < 0.1) s = scaleX;
        if (Math.abs(s - scaleY) < 0.1) s = scaleY;
      }
      
      setScale(s);
    };

    const obs = new ResizeObserver(updateScale);
    obs.observe(containerRef.current);
    updateScale();
    return () => obs.disconnect();
  }, [mockup.width, mockup.height, isLandscape, settings.padding]);

  const { borderRadius: r } = mockup.viewport;
  const shadowFilter = `drop-shadow(0 ${30 * settings.shadowIntensity}px ${60 * settings.shadowIntensity}px rgba(0,0,0,${0.2 * settings.shadowIntensity}))`;
  const perspectiveTransform = `perspective(2000px) rotateX(${settings.mockupTilt.x}deg) rotateY(${settings.mockupTilt.y}deg)`;

  const deviceLayers = (
    <div 
      ref={ref}
      className="absolute top-1/2 left-1/2" 
      style={{ 
        width: mockup.width, 
        height: mockup.height,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center'
      }}
    >
      {/* Layer 1: Display Content (Using CSS Masking for Figma fidelity) */}
      <div
        className="absolute bg-black"
        style={{
          ...screenStyle,
          borderRadius: r,
          overflow: 'hidden',
          zIndex: 10,
          boxSizing: 'border-box',
          boxShadow: '0 0 0 1px #000', // Subtle black bleed to hide gaps without thickening the bezel
          transform: 'translateZ(0)', // Force GPU acceleration for smooth rounding
        }}
      >
        {mediaUrl ? (
          mediaType === 'video' ? (
            <Video
              src={mediaUrl.startsWith('/') ? staticFile(mediaUrl.slice(1)) : mediaUrl}
              className="w-full h-full"
              style={{ objectFit: settings.videoFit as any }}
            />
          ) : (
            <img
              src={mediaUrl.startsWith('/') ? staticFile(mediaUrl.slice(1)) : mediaUrl}
              alt="User Media"
              className="w-full h-full block"
              style={{ objectFit: settings.videoFit as any }}
              crossOrigin={mediaUrl.startsWith('blob:') ? undefined : "anonymous"}
            />
          )
        ) : (
            <img
              src={placeholderUrl}
              alt="Screen Placeholder"
              className="w-full h-full object-cover block"
              crossOrigin={placeholderUrl.startsWith('blob:') ? undefined : "anonymous"}
            />
        )}
      </div>

      {/* Layer 2: Chassis (Z-index 50 covers the screen edges) */}
      <img
        src={bodyUrl}
        alt="Device Frame"
        style={{ 
          width: baseMockup.width, 
          height: baseMockup.height,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) ${isLandscape ? 'rotate(-90deg)' : ''}`,
          pointerEvents: 'none',
          zIndex: 50
        }}
      />
    </div>
  );

  return (
    <div className={`flex items-center justify-center h-full w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full h-full select-none transition-transform duration-500 ease-out"
        style={{
          transform: perspectiveTransform,
          filter: shadowFilter,
          transformStyle: 'preserve-3d',
        }}
      >
        {deviceLayers}
      </div>
    </div>
  );
});
