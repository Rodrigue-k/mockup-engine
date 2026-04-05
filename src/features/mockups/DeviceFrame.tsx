import React from 'react';
import { Video, staticFile } from 'remotion';
import { CanvasSettings, MOCKUPS } from '@/features/mockups/definitions';

interface DeviceFrameProps {
  mediaUrl: string | null;
  mediaType: 'video' | 'image' | null;
  settings: CanvasSettings;
  baseUrl?: string;
  className?: string;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  mediaUrl,
  mediaType,
  settings: canvasSettings,
  className = '',
}) => {
  const mockup = MOCKUPS[canvasSettings.mockupType] || MOCKUPS['iphone-17-pro'];
  const isLandscape = canvasSettings.deviceOrientation === 'landscape';

  const bodyUrl = staticFile(`assets/mockups/${mockup.frameId}/body.png`);
  const maskUrl = staticFile(`assets/mockups/${mockup.frameId}/display.svg`);
  const screen = mockup.screenConfig || {
    top: '2.2926%',
    left: '5.3571%',
    width: '89.7321%',
    height: '95.4148%',
  };

  const perspectiveTransform = `perspective(2000px) rotateX(${canvasSettings.mockupTilt.x}deg) rotateY(${canvasSettings.mockupTilt.y}deg)`;

  const parsedScreenWidth = parseFloat(screen.width) / 100;
  const parsedScreenHeight = parseFloat(screen.height) / 100;
  const screenPxWidth = mockup.width * parsedScreenWidth;
  const screenPxHeight = mockup.height * parsedScreenHeight;

  // Correcting media rotation for landscape mode
  // Since the whole frame is rotated -90deg, the media needs +90deg to be upright.
  // And its dimensions must be precisely swapped based on the screen's actual physical area.
  const mediaGeometry: React.CSSProperties = isLandscape ? {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${(screenPxHeight / screenPxWidth) * 100}%`,
    height: `${(screenPxWidth / screenPxHeight) * 100}%`,
    transform: 'translate(-50%, -50%) rotate(90deg)',
    maxWidth: 'none',
    maxHeight: 'none',
  } : {
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
  };

  const isMac = mockup.id.includes('macbook');
  const finalRadius = isMac ? 0 : (isLandscape ? 40 : 20);

  const deviceLayers = (
    <>
      {/* Layer 0: Black background seal */}
      <div
        className="absolute z-0 bg-black pointer-events-none"
        style={{
          top: screen.top,
          left: screen.left,
          width: screen.width,
          height: screen.height,
          borderRadius: finalRadius,
        }}
      />

      {/* Layer 1: Masked screen content */}
      <div
        className={`absolute overflow-hidden bg-black ${isMac ? 'z-30' : 'z-10'}`}
        style={{
          top: screen.top,
          left: screen.left,
          width: screen.width,
          height: screen.height,
          borderRadius: finalRadius,
        }}
      >
        {mediaUrl ? (
          <div className="w-full h-full relative">
            {mediaType === 'video' ? (
              <Video
                key={`video-${canvasSettings.videoFit}`}
                src={mediaUrl.startsWith('/') ? staticFile(mediaUrl.slice(1)) : mediaUrl}
                className="pointer-events-none"
                style={{
                  ...mediaGeometry,
                  objectFit: canvasSettings.videoFit as any,
                }}
              />
            ) : (
              <div
                style={{
                  ...mediaGeometry,
                  backgroundImage: `url(${mediaUrl.startsWith('/') ? staticFile(mediaUrl.slice(1)) : mediaUrl})`,
                  backgroundSize: canvasSettings.videoFit === 'contain' ? 'contain' : (canvasSettings.videoFit === 'fill' ? '100% 100%' : 'cover'),
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: finalRadius,
                }}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-[#FAFAFA]" />
        )}
      </div>

      {/* Layer 2: Device chassis */}
      <img
        src={bodyUrl}
        alt="Device Frame"
        className="absolute inset-0 w-full h-full block pointer-events-none z-20 object-contain"
        crossOrigin="anonymous"
      />
    </>
  );

  if (isLandscape) {
    const innerWidthPercent = (mockup.width / mockup.height) * 100;
    return (
      <div className={`flex items-center justify-center h-full w-full ${className}`}>
        <div
          className="relative flex-shrink-0 select-none"
          style={{
            height: '100%',
            width: 'auto',
            aspectRatio: `${mockup.height} / ${mockup.width}`,
            filter: `drop-shadow(0 ${30 * canvasSettings.shadowIntensity}px ${60 * canvasSettings.shadowIntensity}px rgba(0,0,0,${0.2 * canvasSettings.shadowIntensity}))`,
          }}
        >
          <div
            className="absolute transition-transform duration-500 ease-out"
            style={{
              width: `${innerWidthPercent}%`,
              height: 'auto',
              aspectRatio: `${mockup.width} / ${mockup.height}`,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) ${perspectiveTransform} rotate(-90deg)`,
              transformOrigin: 'center center',
              transformStyle: 'preserve-3d',
            }}
          >
            {deviceLayers}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center h-full w-full ${className}`}>
      <div
        className="relative h-full w-auto flex-shrink-0 select-none transition-transform duration-500 ease-out"
        style={{
          aspectRatio: `${mockup.width} / ${mockup.height}`,
          transform: perspectiveTransform,
          filter: `drop-shadow(0 ${30 * canvasSettings.shadowIntensity}px ${60 * canvasSettings.shadowIntensity}px rgba(0,0,0,${0.2 * canvasSettings.shadowIntensity}))`,
          transformStyle: 'preserve-3d',
        }}
      >
        {deviceLayers}
      </div>
    </div>
  );
};
