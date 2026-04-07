import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DeviceFrame } from '../features/mockups/DeviceFrame';
import { BACKGROUND_PRESETS, CanvasSettings } from '../features/mockups/definitions';

interface StudioCompositionProps {
  mediaUrl: string | null;
  mediaType: 'video' | 'image' | null;
  settings: CanvasSettings;
}

export const StudioComposition: React.FC<StudioCompositionProps> = ({ 
  mediaUrl, 
  mediaType, 
  settings 
}) => {
  const backgroundShapes = BACKGROUND_PRESETS[settings.backgroundPreset] || [];

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      {/* Background Shapes */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {backgroundShapes.map((shape, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              backgroundColor: shape.color,
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              filter: `blur(${shape.blur}px)`,
              borderRadius: '50%',
              opacity: 0.6,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Main Content */}
      <AbsoluteFill style={{ padding: settings.padding }}>
        <DeviceFrame 
          mediaUrl={mediaUrl} 
          mediaType={mediaType} 
          settings={settings} 
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
