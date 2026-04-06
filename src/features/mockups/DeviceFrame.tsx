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

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  mediaUrl,
  mediaType,
  settings,
  className = '',
}) => {
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
      const s = isLandscape 
        ? rect.width / mockup.width 
        : rect.height / mockup.height;
      setScale(s);
    };

    const obs = new ResizeObserver(updateScale);
    obs.observe(containerRef.current);
    updateScale();
    return () => obs.disconnect();
  }, [mockup.width, mockup.height, isLandscape]);

  const { borderRadius: r } = mockup.viewport;
  const shadowFilter = `drop-shadow(0 ${30 * settings.shadowIntensity}px ${60 * settings.shadowIntensity}px rgba(0,0,0,${0.2 * settings.shadowIntensity}))`;
  const perspectiveTransform = `perspective(2000px) rotateX(${settings.mockupTilt.x}deg) rotateY(${settings.mockupTilt.y}deg)`;

  const deviceLayers = (
    <div 
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
          border: '2px solid #000',
          boxSizing: 'border-box',
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
              crossOrigin="anonymous"
            />
          )
        ) : (
          <img
            src={placeholderUrl}
            alt="Screen Placeholder"
            className="w-full h-full object-cover block"
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
        crossOrigin="anonymous"
      />
    </div>
  );

  return (
    <div className={`flex items-center justify-center h-full w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative h-full flex-shrink-0 select-none transition-transform duration-500 ease-out"
        style={{
          aspectRatio: `${mockup.width} / ${mockup.height}`,
          transform: perspectiveTransform,
          filter: shadowFilter,
          transformStyle: 'preserve-3d',
        }}
      >
        {deviceLayers}
      </div>
    </div>
  );
};
