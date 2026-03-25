import { create } from 'zustand';

export type MockupType = 'iphone-15-pro';

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
  padding: number;
  borderRadius: number;
  shadowIntensity: number;
  shadowSpread: number;
  videoFit: 'contain' | 'cover' | 'fill';
  mockupType: MockupType;
  mockupTilt: { x: number; y: number; z: number };
}

export type ExportState = 'idle' | 'rendering' | 'finished' | 'error';

interface StudioState {
  // Media Source (Video or Image)
  mediaFile: File | null;
  mediaPreviewUrl: string | null;
  mediaType: 'video' | 'image' | null;
  setMediaFile: (file: File | null) => void;

  // Canvas View Configuration
  canvasSettings: CanvasSettings;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  setBackgroundPreset: (preset: string) => void;

  // Export/Rendering State
  exportState: ExportState;
  exportProgress: number;
  setExportState: (state: ExportState) => void;
  setExportProgress: (progress: number) => void;

  // Global UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const DEFAULT_SETTINGS: CanvasSettings = {
  backgroundPreset: 'aurora-soft',
  padding: 80,
  borderRadius: 48,
  shadowIntensity: 0.1,
  shadowSpread: 40,
  videoFit: 'contain',
  mockupType: 'iphone-15-pro',
  mockupTilt: { x: 0, y: 0, z: 0 },
};

export const useStudioStore = create<StudioState>((set) => ({
  mediaFile: null,
  mediaPreviewUrl: null,
  mediaType: null,
  setMediaFile: (file) => set((state) => {
    // Revoke old URL if any to avoid memory leaks
    if (state.mediaPreviewUrl) {
      URL.revokeObjectURL(state.mediaPreviewUrl);
    }
    
    // Determine media type
    let mediaType: 'image' | 'video' | null = null;
    if (file) {
      if (file.type.startsWith('video/')) mediaType = 'video';
      else if (file.type.startsWith('image/')) mediaType = 'image';
    }

    return {
      mediaFile: file,
      mediaPreviewUrl: file ? URL.createObjectURL(file) : null,
      mediaType
    };
  }),

  canvasSettings: DEFAULT_SETTINGS,
  updateCanvasSettings: (settings) => set((state) => ({
    canvasSettings: { ...state.canvasSettings, ...settings },
  })),
  setBackgroundPreset: (backgroundPreset) => set((state) => ({
    canvasSettings: { ...state.canvasSettings, backgroundPreset }
  })),

  exportState: 'idle',
  exportProgress: 0,
  setExportState: (exportState) => set({ exportState }),
  setExportProgress: (exportProgress) => set({ exportProgress }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
