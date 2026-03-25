import { create } from 'zustand';

export type MockupType = 'iphone-15-pro';

export interface CanvasSettings {
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  shadowIntensity: number;
  shadowSpread: number;
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
  backgroundColor: '#F5F5F7',
  padding: 80,
  borderRadius: 48,
  shadowIntensity: 0.1,
  shadowSpread: 40,
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

  exportState: 'idle',
  exportProgress: 0,
  setExportState: (exportState) => set({ exportState }),
  setExportProgress: (exportProgress) => set({ exportProgress }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
