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

export const MOCKUPS: Record<string, any> = {
  'iphone-15-pro': {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
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
};
