import React from 'react';
import { Video, staticFile } from 'remotion';
import { CanvasSettings, MOCKUPS } from '@/features/mockups/definitions';

interface DeviceFrameProps {
  mediaUrl: string | null;
  mediaType: 'video' | 'image' | null;
  settings: CanvasSettings; // Obligatoire
  baseUrl?: string;
  className?: string;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ mediaUrl, mediaType, settings: canvasSettings, baseUrl, className = "" }) => {
  const mockup = MOCKUPS[canvasSettings.mockupType] || MOCKUPS['iphone-17-pro'];
  
  const bodyUrl = staticFile(`assets/mockups/${mockup.frameId}/body.png`);
  const maskUrl = staticFile(`assets/mockups/${mockup.frameId}/display.svg`);
  
  // Coordonnées de l'écran (à définir dans definitions.ts)
  const screen = mockup.screenConfig || { top: '2.2926%', left: '5.3571%', width: '89.7321%', height: '95.4148%' };

  return (
    <div className={`flex items-center justify-center h-full w-full ${className}`}>
      
      {/* Conteneur global verrouillé sur le ratio du téléphone entier */}
      <div 
        className="relative h-full w-auto flex-shrink-0 select-none transition-transform duration-500 ease-out"
        style={{ 
          aspectRatio: `${mockup.width} / ${mockup.height}`,
          transform: `perspective(2000px) rotateX(${canvasSettings.mockupTilt.x}deg) rotateY(${canvasSettings.mockupTilt.y}deg)`,
          filter: `drop-shadow(0 ${30 * canvasSettings.shadowIntensity}px ${60 * canvasSettings.shadowIntensity}px rgba(0,0,0,${0.2 * canvasSettings.shadowIntensity}))`,
          transformStyle: 'preserve-3d',
        }}
      >
        
        {/* Layer 0: La Zone de Fond Solide (Pour boucher les fuites de lumière) */}
        <div 
          className="absolute z-0 bg-black pointer-events-none"
          style={{
            top: screen.top,
            left: screen.left,
            width: screen.width,
            height: screen.height,
            borderRadius: '54px', // Rayon large pour ne pas dépasser des coins du téléphone
          }}
        />

        {/* Layer 1: La Zone Masquée de l'Écran (Vidéo + Masque SVG) */}
        <div 
          className="absolute z-10 overflow-hidden bg-black"
          style={{
            top: screen.top,
            left: screen.left,
            width: screen.width,
            height: screen.height,
            maskImage: `url('${maskUrl}')`,
            maskSize: '100% 100%',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url('${maskUrl}')`,
            WebkitMaskSize: '100% 100%',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
          }}
        >
          {mediaUrl ? (
            <div className="w-full h-full relative">
              {/* Média principal - Dynamic Fit */}
              {mediaType === 'video' ? (
                <Video 
                  src={mediaUrl.startsWith('/') ? staticFile(mediaUrl.slice(1)) : mediaUrl}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ objectFit: canvasSettings.videoFit as any }}
                />
              ) : (
                <img 
                  src={mediaUrl.startsWith('/') ? staticFile(mediaUrl.slice(1)) : mediaUrl} 
                  alt="Preview" 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ objectFit: canvasSettings.videoFit as any }}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-[#FAFAFA]" />
          )}
        </div>

        {/* Layer 2: Le Châssis (body.png) */}
        <img 
          src={bodyUrl} 
          alt="Device Frame" 
          className="absolute inset-0 w-full h-full block pointer-events-none z-20 object-contain"
        />
        
      </div>
    </div>
  );
};
