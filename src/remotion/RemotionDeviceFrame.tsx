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
  settings 
}) => {
  const mockup = MOCKUPS[settings.mockupType] || MOCKUPS['iphone-17-pro'];
  
  // Coordonnées de l'écran
  const screen = mockup.screenConfig || { top: '2.2926%', left: '5.3571%', width: '89.7321%', height: '95.4148%' };

  // Assets statiques résolus via staticFile()
  const bodyUrl = staticFile(`assets/mockups/${mockup.frameId}/body.png`);
  const maskUrl = staticFile(`assets/mockups/${mockup.frameId}/display.svg`);
  
  // Résolution du média (source utilisateur)
  const resolvedMediaUrl = mediaUrl ? (mediaUrl.startsWith('/') ? staticFile(mediaUrl.slice(1)) : mediaUrl) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      {/* 1. Calque d'arrière-plan Premium */}
      <BackgroundLayer type={settings.bgType || 'solid'} value={settings.bgValue || '#FFFFFF'} />

      {/* Device Frame Layer */}
      <AbsoluteFill style={{ padding: settings.padding }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          
          <div 
            style={{ 
              position: 'relative',
              height: '100%',
              width: 'auto',
              aspectRatio: `${mockup.width} / ${mockup.height}`,
              transform: `perspective(2000px) rotateX(${settings.mockupTilt.x}deg) rotateY(${settings.mockupTilt.y}deg)`,
              filter: `drop-shadow(0 ${30 * settings.shadowIntensity}px ${60 * settings.shadowIntensity}px rgba(0,0,0,${0.2 * settings.shadowIntensity}))`,
              transformStyle: 'preserve-3d',
            }}
          >
            
            {/* Layer 0: Background Leak Seal */}
            <div 
              style={{
                position: 'absolute',
                top: screen.top,
                left: screen.left,
                width: screen.width,
                height: screen.height,
                backgroundColor: 'black',
                borderRadius: '54px',
                zIndex: 0,
              }}
            />

            {/* Layer 1: Masked Content Area */}
            <div 
              style={{
                position: 'absolute',
                top: screen.top,
                left: screen.left,
                width: screen.width,
                height: screen.height,
                overflow: 'hidden',
                backgroundColor: 'black',
                maskImage: `url('${maskUrl}')`,
                maskSize: '100% 100%',
                WebkitMaskImage: `url('${maskUrl}')`,
                WebkitMaskSize: '100% 100%',
                zIndex: 10,
              }}
            >
              {resolvedMediaUrl && (
                mediaType === 'video' ? (
                  <Video 
                    src={resolvedMediaUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: settings.videoFit as any
                    }}
                  />
                ) : (
                  <Img 
                    src={resolvedMediaUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: settings.videoFit as any
                    }}
                  />
                )
              )}
            </div>

            {/* Layer 2: Device Chassis */}
            <Img 
              src={bodyUrl} 
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 20,
                objectFit: 'contain'
              }}
            />
            
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
