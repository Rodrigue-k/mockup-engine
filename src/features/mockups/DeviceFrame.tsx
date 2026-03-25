'use client';
import React from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { MOCKUPS } from '@/features/mockups/definitions';

interface DeviceFrameProps {
  mediaUrl: string | null;
  mediaType: 'video' | 'image' | null;
  className?: string;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ mediaUrl, mediaType, className = "" }) => {
  const { canvasSettings } = useStudioStore();
  const mockup = MOCKUPS[canvasSettings.mockupType] || MOCKUPS['iphone-15-pro'];

  const bodyUrl = `/assets/mockups/${mockup.frameId}/body.png`;
  const maskUrl = `/assets/mockups/${mockup.frameId}/display.svg`;
  
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
        
        {/* Layer 1: La Zone de l'Écran (Vidéo + Masque SVG) */}
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
              {/* Média principal - Fixé en object-cover pour usage personnel */}
              {mediaType === 'video' ? (
                <video 
                  src={mediaUrl} autoPlay loop muted playsInline 
                  className="absolute inset-0 w-full h-full object-cover scale-[1.01] pointer-events-none"
                />
              ) : (
                <img 
                  src={mediaUrl} alt="Preview" 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
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
