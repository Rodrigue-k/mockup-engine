'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { DeviceFrame } from '@/features/mockups/DeviceFrame';
import { CanvasSettings } from '@/features/mockups/definitions';

export function EmbedCanvas() {
  const params = useSearchParams();
  const device = (params.get('device') || 'iphone-17-pro-silver') as any;
  const src = params.get('src');
  const background = params.get('bg') || '#000000';
  const tilt = parseFloat(params.get('tilt') || '0');
  const orientation = (params.get('orientation') || 'portrait') as any;

  const settings: CanvasSettings = {
    mockupType: device,
    deviceOrientation: orientation,
    mockupTilt: { x: 0, y: tilt, z: 0 },
    bgType: 'solid',
    bgValue: background,
    backgroundPreset: '',
    format: '9:16',
    padding: 0,
    borderRadius: 0,
    shadowIntensity: 0,
    shadowSpread: 0,
    videoFit: 'cover',
    exportBackground: true,
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
      <DeviceFrame
        mediaUrl={src}
        mediaType={src ? 'image' : null}
        settings={settings}
      />
    </div>
  );
}
