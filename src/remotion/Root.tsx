import React from 'react';
import { Composition, CalculateMetadataFunction, registerRoot } from 'remotion';
import { RemotionDeviceFrame } from './RemotionDeviceFrame';
import { FORMAT_DIMENSIONS, AspectRatio } from '@/config/studio-constants';
import { MOCKUPS, getLandscapeMockup, MockupType } from '@/features/mockups/definitions';

// Fonction exécutée par Chromium AVANT le rendu pour définir la taille
const calculateMetadata: CalculateMetadataFunction<any> = ({ props }) => {
  const settings = props.settings;
  const isTightCrop = settings?.tightCrop;

  if (isTightCrop) {
    const mockupType = (settings?.mockupType as MockupType) || 'iphone-17-pro-silver';
    const baseMockup = MOCKUPS[mockupType] || MOCKUPS['iphone-17-pro-silver'];
    const isLandscape = settings?.deviceOrientation === 'landscape';
    const mockup = isLandscape ? getLandscapeMockup(baseMockup) : baseMockup;

    return {
      width: mockup.width,
      height: mockup.height,
    };
  }

  const formatKey = (settings?.format as AspectRatio) || '9:16';
  const dimensions = FORMAT_DIMENSIONS[formatKey] || FORMAT_DIMENSIONS['9:16'];
  
  return {
    width: dimensions.width,
    height: dimensions.height,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="StudioExport"
      component={RemotionDeviceFrame as any}
      durationInFrames={300}
      fps={30}
      width={1080} // Valeur par défaut, écrasée par calculateMetadata
      height={1920}
      calculateMetadata={calculateMetadata} // NOUVEAU : Injection des dimensions dynamiques
      defaultProps={{
        mediaUrl: null,
        mediaType: 'video',
        settings: { 
          mockupType: 'iphone-17-pro', 
          bgType: 'solid', 
          bgValue: '#FFFFFF', 
          padding: 80, 
          format: '9:16',
          mockupTilt: { x: 0, y: 0, z: 0 },
          shadowIntensity: 0.1,
          videoFit: 'contain'
        }
      }}
    />
  );
};

registerRoot(RemotionRoot);
