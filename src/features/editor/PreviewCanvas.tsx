'use client';

import React, { useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { RemotionDeviceFrame } from '@/remotion/RemotionDeviceFrame';
import { ImageMockupCanvas } from './ImageMockupCanvas';
import { useStudioStore } from '@/store/useStudioStore';
import { FORMAT_DIMENSIONS, AspectRatio } from '@/config/studio-constants';

export type CanvasRefs = {
  fullRef: HTMLDivElement | null;
  deviceRef: HTMLDivElement | null;
};

let _canvasRefs: CanvasRefs | null = null;
export const getCanvasRefs = () => _canvasRefs;

export const PreviewCanvas: React.FC = () => {
  const { mediaPreviewUrl, mediaType, canvasSettings, setMediaFile } = useStudioStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatKey = (canvasSettings.format as AspectRatio) || '9:16';
  const dimensions = FORMAT_DIMENSIONS[formatKey] || FORMAT_DIMENSIONS['9:16'];
  const imageMockupRef = useRef<{ fullRef: HTMLDivElement | null; deviceRef: HTMLDivElement | null }>(null);

  React.useEffect(() => {
    _canvasRefs = imageMockupRef.current;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setMediaFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setMediaFile(file);
    }
  };

  const clearMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaFile(null);
  };

  const isImageMode = mediaType === 'image' || mediaType === null;

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Aspect Ratio Container */}
      <div
        className="relative flex items-center justify-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden bg-f-surface group"
        style={{
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          height: 'min(90%, 800px)',
          background: canvasSettings.bgType === 'solid' || canvasSettings.bgType === 'gradient' ? canvasSettings.bgValue : '#161616'
        }}
      >
        {/* Pattern Overlays */}
        {canvasSettings.bgType === 'pattern_dots' && (
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(${canvasSettings.bgValue} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        )}
        {canvasSettings.bgType === 'pattern_grid' && (
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, ${canvasSettings.bgValue} 1px, transparent 1px), linear-gradient(to bottom, ${canvasSettings.bgValue} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        )}

        <div
          className="relative w-full h-full flex items-center justify-center"
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={!mediaPreviewUrl ? () => fileInputRef.current?.click() : undefined}
          style={{ cursor: mediaPreviewUrl ? 'default' : 'pointer' }}
        >
          {isImageMode ? (
            <div className="h-full w-full">
              <ImageMockupCanvas
                ref={imageMockupRef}
                mediaUrl={mediaPreviewUrl}
                settings={{
                  ...canvasSettings,
                  baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
                }}
                isEmpty={!mediaPreviewUrl}
              />
            </div>
          ) : (
            <Player
              component={RemotionDeviceFrame as any}
              inputProps={{
                mediaUrl: mediaPreviewUrl,
                mediaType: mediaType,
                settings: {
                  ...canvasSettings,
                  baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
                },
                isEmpty: !mediaPreviewUrl,
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
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Clear Button */}
          {mediaPreviewUrl && (
            <button
              onClick={clearMedia}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80 z-50 transition-all opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
