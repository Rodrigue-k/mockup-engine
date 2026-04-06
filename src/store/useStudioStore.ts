import { create } from 'zustand';

import { 
  MockupType, 
  BackgroundShape, 
  BACKGROUND_PRESETS, 
  CanvasSettings 
} from '@/features/mockups/definitions';

export type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

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
  exportStatus: ExportStatus;
  exportProgress: number;
  setExportStatus: (status: ExportStatus) => void;
  startExport: () => void;
  updateExportProgress: (progress: number) => void;
  finishExport: () => void;
  exportError: (message: string) => void;

  // Global UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const DEFAULT_SETTINGS: CanvasSettings = {
  backgroundPreset: 'aurora-soft',
  bgType: 'solid',
  bgValue: '#FFFFFF',
  format: '9:16',
  padding: 80,
  borderRadius: 48,
  shadowIntensity: 0.1,
  shadowSpread: 40,
  videoFit: 'contain',
  mockupType: 'iphone-17-pro-silver',
  mockupTilt: { x: 0, y: 0, z: 0 },
  deviceOrientation: 'portrait',
  exportBackground: true,
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

  exportStatus: 'idle',
  exportProgress: 0,
  setExportStatus: (exportStatus) => set({ exportStatus }),
  startExport: () => set({ exportStatus: 'exporting', exportProgress: 0 }),
  updateExportProgress: (exportProgress) => set({ exportProgress }),
  finishExport: () => set({ exportStatus: 'success', exportProgress: 100 }),
  exportError: (message) => {
    console.error('Export error:', message);
    set({ exportStatus: 'error' });
  },

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
