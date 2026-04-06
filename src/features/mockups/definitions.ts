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
}

export type MockupType =
  | 'iphone-17-pro-silver'
  | 'iphone-17-pro-orange'
  | 'iphone-17-pro-deepblue';

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

/**
 * Computes the screen positioning styles based on viewport coordinates.
 */
export function getScreenStyle(mockup: MockupDefinition): {
  top: string;
  left: string;
  width: string;
  height: string;
} {
  return {
    top: `${(mockup.viewport.y / mockup.height) * 100}%`,
    left: `${(mockup.viewport.x / mockup.width) * 100}%`,
    width: `${(mockup.viewport.width / mockup.width) * 100}%`,
    height: `${(mockup.viewport.height / mockup.height) * 100}%`,
  };
}

/**
 * Returns fixed pixel values for precision rendering.
 */
export function getAbsoluteScreenStyle(mockup: MockupDefinition): {
  top: string;
  left: string;
  width: string;
  height: string;
} {
  return {
    top: `${mockup.viewport.y}px`,
    left: `${mockup.viewport.x}px`,
    width: `${mockup.viewport.width}px`,
    height: `${mockup.viewport.height}px`,
  };
}


/**
 * Helper to return a mockup especification for landscape mode.
 */
export function getLandscapeMockup(mockup: MockupDefinition): MockupDefinition {
  return {
    ...mockup,
    width: mockup.height,
    height: mockup.width,
    viewport: {
      x: mockup.viewport.y,
      y: mockup.viewport.x,
      width: mockup.viewport.height,
      height: mockup.viewport.width,
      borderRadius: mockup.viewport.borderRadius,
    },
  };
}

export const MOCKUPS: Record<MockupType, MockupDefinition> = {
  'iphone-17-pro-silver': {
    id: 'iphone-17-pro-silver',
    name: 'iPhone 17 Pro Silver',
    type: 'mobile',
    width: 448,
    height: 916,
    viewport: { x: 22, y: 20, width: 404, height: 876, borderRadius: 57 },
    frameId: 'iphone17-silver',
  },
  'iphone-17-pro-orange': {
    id: 'iphone-17-pro-orange',
    name: 'iPhone 17 Pro Cosmic Orange',
    type: 'mobile',
    width: 448,
    height: 916,
    viewport: { x: 22, y: 20, width: 404, height: 876, borderRadius: 57 },
    frameId: 'iphone17-orange',
  },
  'iphone-17-pro-deepblue': {
    id: 'iphone-17-pro-deepblue',
    name: 'iPhone 17 Pro Deep Blue',
    type: 'mobile',
    width: 448,
    height: 916,
    viewport: { x: 22, y: 20, width: 404, height: 876, borderRadius: 57 },
    frameId: 'iphone17-deepblue',
  },
};
