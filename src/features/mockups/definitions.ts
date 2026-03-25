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
      top: '2.1926%',
      left: '5.2571%',
      width: '89.9321%',
      height: '95.6148%'
    },
    frameId: 'iphone17',
  },
};
