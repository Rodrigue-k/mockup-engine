import React from 'react';
import { AbsoluteFill, Img, Video, staticFile } from 'remotion';
import { CanvasSettings, MOCKUPS } from '../features/mockups/definitions';
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
  const mockup = MOCKUPS[settings.mockupType] || MOCKUPS['iphone-17-pro'];
  const isLandscape = settings.deviceOrientation === 'landscape';

  const screen = mockup.screenConfig || {
    top: '2.2926%',
    left: '5.3571%',
    width: '89.7321%',
    height: '95.4148%',
  };

  const bodyUrl = staticFile(`assets/mockups/${mockup.frameId}/body.png`);
  const maskUrl = staticFile(`assets/mockups/${mockup.frameId}/display.svg`);
  const resolvedMediaUrl = mediaUrl
    ? mediaUrl.startsWith('/')
      ? staticFile(mediaUrl.slice(1))
      : mediaUrl
    : null;

  const perspectiveTransform = `perspective(2000px) rotateX(${settings.mockupTilt.x}deg) rotateY(${settings.mockupTilt.y}deg)`;

  const parsedScreenWidth = parseFloat(screen.width) / 100;
  const parsedScreenHeight = parseFloat(screen.height) / 100;
  const screenPxWidth = mockup.width * parsedScreenWidth;
  const screenPxHeight = mockup.height * parsedScreenHeight;

  // Correcting media rotation for landscape mode
  // The phone asset is portrait. In landscape mode, we rotate the whole phone -90deg.
  // To have the media appear upright relative to the landscape-held phone,
  // we rotate the media +90deg inside its portrait container and perfectly scale it.
  const isMac = mockup.id.includes('macbook');
  const finalRadius = isMac ? 0 : (isLandscape ? 40 : 20);

  const mediaStyle: React.CSSProperties = isLandscape ? {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${(screenPxHeight / screenPxWidth) * 100}%`,
    height: `${(screenPxWidth / screenPxHeight) * 100}%`,
    transform: 'translate(-50%, -50%) rotate(90deg)',
    objectFit: settings.videoFit as any,
    maxWidth: 'none',
    maxHeight: 'none',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  } : {
    width: '100%',
    height: '100%',
    objectFit: settings.videoFit as any,
    maxWidth: 'none',
    maxHeight: 'none',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const deviceLayers = (
    <>
      <div
        style={{
          position: 'absolute',
          top: screen.top,
          left: screen.left,
          width: screen.width,
          height: screen.height,
          backgroundColor: 'black',
          borderRadius: finalRadius,
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: screen.top,
          left: screen.left,
          width: screen.width,
          height: screen.height,
          overflow: 'hidden',
          backgroundColor: 'black',
          borderRadius: finalRadius,
          zIndex: isMac ? 30 : 10,
        }}
      >
        {resolvedMediaUrl &&
          (mediaType === 'video' ? (
            <Video
              key={`video-${settings.videoFit}`}
              src={resolvedMediaUrl}
              style={mediaStyle}
            />
          ) : (
            <Img
              key={`img-${settings.videoFit}`}
              src={resolvedMediaUrl}
              style={{
                ...mediaStyle,
                borderRadius: finalRadius,
              }}
              crossOrigin="anonymous"
            />
          ))}
      </div>

      <Img
        src={bodyUrl}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 20,
          objectFit: 'contain',
        }}
        crossOrigin="anonymous"
      />
    </>
  );

  const shadowFilter = `drop-shadow(0 ${30 * settings.shadowIntensity}px ${60 * settings.shadowIntensity}px rgba(0,0,0,${0.2 * settings.shadowIntensity}))`;
  const innerWidthPercent = (mockup.width / mockup.height) * 100;

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
          {isLandscape ? (
            <div
              style={{
                position: 'relative',
                height: '100%',
                width: 'auto',
                aspectRatio: `${mockup.height} / ${mockup.width}`,
                filter: shadowFilter,
              }}
            >
              <div
                style={{
                  position: 'absolute',
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
          ) : (
            <div
              style={{
                position: 'relative',
                height: '100%',
                width: 'auto',
                aspectRatio: `${mockup.width} / ${mockup.height}`,
                transform: perspectiveTransform,
                filter: shadowFilter,
                transformStyle: 'preserve-3d',
              }}
            >
              {deviceLayers}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
