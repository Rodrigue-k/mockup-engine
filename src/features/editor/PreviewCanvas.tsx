'use client';

import React from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { MOCKUPS } from '@/features/mockups/definitions';
import { DeviceFrame } from '../mockups/DeviceFrame';

export const PreviewCanvas: React.FC = () => {
  const { canvasSettings, mediaPreviewUrl, mediaType } = useStudioStore();
  const mockup = MOCKUPS[canvasSettings.mockupType];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#fdfcfa] p-12 overflow-hidden">
      {/* Studio Stage */}
      <div 
        className="relative flex flex-col items-center justify-center h-[78vh] aspect-[9/16] bg-[#f9f9fb] shadow-studio-2xl rounded-[2.5rem] overflow-hidden border border-studio-border/40"
        style={{ backgroundColor: canvasSettings.backgroundColor }}
      >
        {/* Subtle Canvas Grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" style={{backgroundImage: 'radial-gradient(#111827 0.5px, transparent 0.5px)', backgroundSize: '15px 15px'}} />
        
        {/* Padded Work Area */}
        <div 
          className="relative w-full h-full flex items-center justify-center z-10"
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
