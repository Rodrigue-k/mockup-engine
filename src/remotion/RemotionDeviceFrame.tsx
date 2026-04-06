import React from 'react';
import { AbsoluteFill, Img, Video, staticFile, useVideoConfig } from 'remotion';
import {
  CanvasSettings,
  MOCKUPS,
  getAbsoluteScreenStyle,
  getLandscapeMockup
} from '../features/mockups/definitions';
import { BackgroundLayer } from '../features/mockups/BackgroundLayer';

interface RemotionDeviceFrameProps {
  mediaUrl: string | null;
  mediaType: 'video' | 'image' | null;
  settings: CanvasSettings;
}

export const RemotionDeviceFrame: React.FC<RemotionDeviceFrameProps> = ({
  mediaUrl,
  mediaType,
  settings,
}) => {
  const { width: compWidth, height: compHeight } = useVideoConfig();
  
  const isLandscape = settings.deviceOrientation === 'landscape';
  const baseMockup = MOCKUPS[settings.mockupType] || MOCKUPS['iphone-17-pro-silver'];
  
  // Use landscape helper if needed
  const mockup = isLandscape ? getLandscapeMockup(baseMockup) : baseMockup;

  const bodyUrl = staticFile(`assets/mockups/${baseMockup.frameId}/body.png`);
  const placeholderUrl = staticFile(`assets/mockups/${baseMockup.frameId}/screen.webp`);
  
  const screenStyle = getAbsoluteScreenStyle(mockup);

  // Calculate scale based on Remotion composition dimensions and padding
  const paddingPx = (settings.padding || 0) * 2;
  const availableHeight = compHeight - paddingPx;
  const availableWidth = compWidth - paddingPx;

  // Use orientation-specific scale calculation
  const scale = isLandscape
    ? Math.min(availableWidth / mockup.width, availableHeight / mockup.height)
    : availableHeight / mockup.height;

  const resolvedMediaUrl = mediaUrl
    ? mediaUrl.startsWith('/')
      ? staticFile(mediaUrl.slice(1))
      : mediaUrl
    : null;

  const perspectiveTransform = `perspective(2000px) rotateX(${settings.mockupTilt.x}deg) rotateY(${settings.mockupTilt.y}deg)`;
  const shadowFilter = `drop-shadow(0 ${30 * settings.shadowIntensity}px ${60 * settings.shadowIntensity}px rgba(0,0,0,${0.2 * settings.shadowIntensity}))`;

  const { borderRadius: r } = mockup.viewport;

  const deviceLayers = (
    <div 
      style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: mockup.width, 
        height: mockup.height,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center'
      }}
    >
      {/* Layer 1: Display Content (CSS Rounding for perfect Figma alignment) */}
      <div
        style={{
          ...screenStyle,
          position: 'absolute',
          borderRadius: r,
          backgroundColor: 'black',
          overflow: 'hidden',
          zIndex: 10,
          border: '2px solid #000',
          boxSizing: 'border-box',
          transform: 'translateZ(0)',
        }}
      >
        {resolvedMediaUrl ? (
          mediaType === 'video' ? (
            <Video
              src={resolvedMediaUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: settings.videoFit as any,
              }}
            />
          ) : (
            <Img
              src={resolvedMediaUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: settings.videoFit as any,
              }}
              crossOrigin="anonymous"
            />
          )
        ) : (
          <Img
            src={placeholderUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      {/* Layer 2: Chassis (Overlays the content edges) */}
      <Img
        src={bodyUrl}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: baseMockup.width,
          height: baseMockup.height,
          transform: `translate(-50%, -50%) ${isLandscape ? 'rotate(-90deg)' : ''}`,
          zIndex: 50,
          pointerEvents: 'none',
        }}
        crossOrigin="anonymous"
      />
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <BackgroundLayer type={settings.bgType || 'solid'} value={settings.bgValue || '#FFFFFF'} />

      <AbsoluteFill style={{ padding: settings.padding }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              height: mockup.height * scale,
              width: mockup.width * scale,
              transform: perspectiveTransform,
              filter: shadowFilter,
              transformStyle: 'preserve-3d',
            }}
          >
            {deviceLayers}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
