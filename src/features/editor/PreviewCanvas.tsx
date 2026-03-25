'use client';

import React from 'react';
import { useStudioStore, BACKGROUND_PRESETS } from '@/store/useStudioStore';
import { MOCKUPS } from '@/features/mockups/definitions';
import { DeviceFrame } from '../mockups/DeviceFrame';

export const PreviewCanvas: React.FC = () => {
  const { canvasSettings, mediaPreviewUrl, mediaType } = useStudioStore();
  const mockup = MOCKUPS[canvasSettings.mockupType];

  return (
    <div className="relative z-10 flex items-center justify-center">
      {/* Studio Stage - Full Viewport Height focused */}
      <div 
        className="relative flex items-center justify-center max-h-[95vh] h-[95vh] aspect-[9/16] bg-white shadow-studio-2xl rounded-[3rem] overflow-hidden border border-studio-border/20 select-none"
      >
        {/* Abstract Smart Background Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-700">
          {BACKGROUND_PRESETS[canvasSettings.backgroundPreset].map((shape, i) => (
            <div 
              key={i}
              className="absolute rounded-full transition-all duration-1000 ease-in-out opacity-60 mix-blend-multiply"
              style={{
                backgroundColor: shape.color,
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                filter: `blur(${shape.blur}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Subtle Canvas Grain Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-10" style={{backgroundImage: 'radial-gradient(#111827 0.5px, transparent 0.5px)', backgroundSize: '15px 15px'}} />
        
        {/* Padded Work Area for Mockup */}
        <div 
          className="relative w-full h-full flex items-center justify-center z-20"
          style={{ padding: `${canvasSettings.padding}px` }}
        >
          <DeviceFrame 
            mediaUrl={mediaPreviewUrl} 
            mediaType={mediaType}
            className="h-full w-auto"
          />
        </div>
      </div>
    </div>
  );
};
