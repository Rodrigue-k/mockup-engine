import React from 'react';
import { Player } from '@remotion/player';
import { RemotionDeviceFrame } from '@/remotion/RemotionDeviceFrame';
import { useStudioStore } from '@/store/useStudioStore';
import { FORMAT_DIMENSIONS, AspectRatio } from '@/config/studio-constants';

export const PreviewCanvas: React.FC = () => {
  const { mediaPreviewUrl, mediaType, canvasSettings } = useStudioStore();
  
  const formatKey = (canvasSettings.format as AspectRatio) || '9:16';
  const dimensions = FORMAT_DIMENSIONS[formatKey] || FORMAT_DIMENSIONS['9:16'];

  return (
    <div className="relative z-10 flex items-center justify-center w-full h-full p-8">
      {/* Studio Stage - Flexible Container for Aspect Ratio */}
      <div 
        className="relative flex items-center justify-center max-h-full max-w-full bg-white shadow-studio-2xl rounded-[3rem] overflow-hidden border border-studio-border/20 select-none"
        style={{ 
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          height: '100%',
        }}
      >
        <Player
          component={RemotionDeviceFrame as any}
          inputProps={{
            mediaUrl: mediaPreviewUrl,
            mediaType: mediaType,
            settings: { 
              ...canvasSettings, 
              baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000' 
            }
          }}
          durationInFrames={300}
          compositionWidth={dimensions.width}
          compositionHeight={dimensions.height}
          fps={30}
          style={{ width: '100%', height: '100%' }}
          controls
          autoPlay={false}
          loop
          acknowledgeRemotionLicense={true}
        />
      </div>
    </div>
  );
};
