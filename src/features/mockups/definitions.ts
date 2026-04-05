/**
 * Universal Mockup Engine - Mockup Definitions
 * Geometric specifications and visual masks for supported devices
 */

export interface MockupDefinition {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  width: number;
  height: number;
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius: number;
  };
  frameId: string;
  screenConfig?: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

export type MockupType = 'iphone-17-pro' | 'macbook-pro-16';
export type DeviceOrientation = 'portrait' | 'landscape';

export type BackgroundShape = { color: string; size: number; x: number; y: number; blur: number };

export const BACKGROUND_PRESETS: { [key: string]: BackgroundShape[] } = {
  'aurora-soft': [
    { color: '#D4E6F1', size: 600, x: 20, y: 10, blur: 120 }, // Bleu très clair
    { color: '#FADBD8', size: 500, x: 70, y: 60, blur: 100 }, // Rose très clair
  ],
  'sunset-mist': [
    { color: '#FDEBD0', size: 650, x: 10, y: 50, blur: 130 }, // Orange pâle
    { color: '#D5F5E3', size: 450, x: 80, y: 20, blur: 90 },  // Vert pâle
  ],
  'carbon-clean': [] // Fond gris très clair uni pour le mode minimaliste
};

export interface CanvasSettings {
  backgroundPreset: string;
  bgType: 'solid' | 'gradient' | 'pattern_dots' | 'pattern_grid';
  bgValue: string;
  format: string;
  padding: number;
  borderRadius: number;
  shadowIntensity: number;
  shadowSpread: number;
  videoFit: 'contain' | 'cover' | 'fill';
  mockupType: MockupType;
  mockupTilt: { x: number; y: number; z: number };
  deviceOrientation: DeviceOrientation;
  exportBackground: boolean;
  baseUrl?: string;
}

export const MOCKUPS: Record<string, any> = {
  'iphone-17-pro': {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    type: 'mobile',
    width: 448,
    height: 916,
    viewport: {
      x: 19,
      y: 21,
      width: 402,
      height: 874,
      borderRadius: 57,
    },
    screenConfig: {
      top: '2.17%',     // Slightly expanded to seal edges
      left: '5.20%',    // Slightly expanded to seal edges
      width: '90.1%',   // Slightly expanded to seal edges
      height: '95.7%'   // Slightly expanded to seal edges
    },
    frameId: 'iphone17',
  },
  'macbook-pro-16': {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16',
    type: 'desktop',
    width: 2401,
    height: 1376,
    viewport: {
      x: 252,
      y: 56,
      width: 1908,
      height: 1190,
      borderRadius: 0,
    },
    screenConfig: {
      top: '4.07%',
      left: '10.50%',
      width: '79.47%',
      height: '86.48%'
    },
    frameId: 'macbook16',
  },
};
