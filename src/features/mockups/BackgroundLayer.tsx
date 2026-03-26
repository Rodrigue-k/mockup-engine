import React from 'react';
import { AbsoluteFill } from 'remotion';

interface BackgroundLayerProps {
  type: 'solid' | 'gradient' | 'pattern_dots' | 'pattern_grid';
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
      default:
        return { background: '#FFFFFF' };
    }
  };

  return <AbsoluteFill style={getStyle()} />;
};
