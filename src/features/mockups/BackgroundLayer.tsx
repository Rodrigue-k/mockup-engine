import React from 'react';
import { AbsoluteFill } from 'remotion';

interface BackgroundLayerProps {
  type: 'solid' | 'gradient' | 'pattern_dots' | 'pattern_grid' | 'none';
  value: string;
  backgroundColor?: string; // Couleur de fond sous le pattern
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ type, value, backgroundColor = '#F8FAFC' }) => {
  const getStyle = (): React.CSSProperties => {
    switch (type) {
      case 'solid':
      case 'gradient':
        return { background: value };
      case 'pattern_dots':
        return {
          backgroundColor,
          backgroundImage: `radial-gradient(${value} 2px, transparent 2px)`,
          backgroundSize: '30px 30px',
        };
      case 'pattern_grid':
        return {
          backgroundColor,
          backgroundImage: `linear-gradient(to right, ${value} 1px, transparent 1px), linear-gradient(to bottom, ${value} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        };
      case 'none':
        return { background: 'transparent' };
      default:
        // Transparency checkerboard pattern
        return {
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        };
    }
  };

  return <AbsoluteFill style={getStyle()} />;
};
