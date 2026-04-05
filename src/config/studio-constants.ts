export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export const FORMAT_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
};

export const PREMIUM_BACKGROUNDS = {
  none: { type: 'none', value: 'transparent' },
  solid_white: { type: 'solid', value: '#FFFFFF' },
  solid_dark: { type: 'solid', value: '#0F172A' },
  gradient_hyper: { type: 'gradient', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  gradient_ocean: { type: 'gradient', value: 'linear-gradient(to top, #4facfe 0%, #00f2fe 100%)' },
  gradient_mesh: { type: 'gradient', value: 'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%)' },
  pattern_dots: { type: 'pattern_dots', value: '#94A3B8' }, // Couleur des points
  pattern_grid: { type: 'pattern_grid', value: '#E2E8F0' }, // Couleur de la grille
};
