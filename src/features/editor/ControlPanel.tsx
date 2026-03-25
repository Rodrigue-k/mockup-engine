'use client';

import React from 'react';
import { useStudioStore, MockupType } from '@/store/useStudioStore';
import { MOCKUPS } from '@/features/mockups/definitions';

export const ControlPanel = () => {
  const { 
    canvasSettings, 
    updateCanvasSettings, 
    setMediaFile,
    mediaFile,
    exportState,
    exportProgress,
    setExportState
  } = useStudioStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMediaFile(file);
  };

  const handleMockupChange = (type: MockupType) => {
    updateCanvasSettings({ mockupType: type });
  };

  return (
    <div className="flex flex-col h-full bg-studio-card font-sans">
      {/* File Upload Section */}
      <div className="p-6 border-b border-studio-border bg-studio-bg/50">
        <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block mb-4">Média Source</label>
        <div className="relative group overflow-hidden">
          <input 
            type="file" 
            accept="video/*,image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
          <div className={`p-5 rounded-2xl border-2 border-dashed border-studio-border text-center transition-all group-hover:border-studio-accent group-hover:bg-studio-accent/[0.02] ${mediaFile ? 'bg-studio-accent/5 border-studio-accent' : 'bg-studio-card'}`}>
            <div className="text-xs font-semibold text-studio-text mb-1 truncate">
              {mediaFile ? mediaFile.name : 'Importer un Média'}
            </div>
            <p className="text-[10px] text-studio-muted">MP4, PNG, JPG (max 100MB)</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Appareil Choice (Static for now since only iPhone remains) */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block">Appareil</label>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-studio-accent bg-studio-accent/5 text-studio-accent shadow-sm ring-1 ring-studio-accent/10">
              <span className="text-xs font-medium">iPhone 15 Pro</span>
              <div className="w-1.5 h-1.5 rounded-full bg-studio-accent" />
            </div>
          </div>
        </section>

        {/* Layout Settings */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block pt-2 border-t border-studio-border pt-6">Réglages Studio</label>
          
          <div className="space-y-3">
             <div className="flex justify-between items-center text-[11px] font-medium text-studio-text">
                <span>Padding</span>
                <span className="text-studio-muted">{canvasSettings.padding}px</span>
             </div>
             <input 
                type="range" min="0" max="200" value={canvasSettings.padding}
                onChange={(e) => updateCanvasSettings({ padding: parseInt(e.target.value) })}
                className="w-full h-1 bg-studio-bg rounded-full appearance-none cursor-pointer accent-studio-accent"
             />
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center text-[11px] font-medium text-studio-text">
                <span>Ombre Portée</span>
                <span className="text-studio-muted">{(canvasSettings.shadowIntensity * 100).toFixed(0)}%</span>
             </div>
             <input 
                type="range" min="0" max="100" value={canvasSettings.shadowIntensity * 100}
                onChange={(e) => updateCanvasSettings({ shadowIntensity: parseInt(e.target.value) / 100 })}
                className="w-full h-1 bg-studio-bg rounded-full appearance-none cursor-pointer accent-studio-accent"
             />
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center text-[11px] font-medium text-studio-text">
                <span>Rotation (Tilt)</span>
                <span className="text-studio-muted">{canvasSettings.mockupTilt.y}º</span>
             </div>
             <input 
                type="range" min="-15" max="15" value={canvasSettings.mockupTilt.y}
                onChange={(e) => updateCanvasSettings({ mockupTilt: { ...canvasSettings.mockupTilt, y: parseInt(e.target.value) } })}
                className="w-full h-1 bg-studio-bg rounded-full appearance-none cursor-pointer accent-studio-accent"
             />
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
           <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block border-t border-studio-border pt-6">Arrière-plan</label>
           <div className="flex flex-wrap gap-2.5">
              {['#F9F9FB', '#FFFFFF', '#F3F4F6', '#E5E7EB', '#DBEAFE', '#FDF2F8', '#111827'].map((c) => (
                <button 
                   key={c}
                   onClick={() => updateCanvasSettings({ backgroundColor: c })}
                   style={{ backgroundColor: c }}
                   className={`w-7 h-7 rounded-full border border-studio-border ring-1 ring-offset-2 transition-all ${
                     canvasSettings.backgroundColor === c ? 'ring-studio-accent scale-110 shadow-sm' : 'ring-transparent opacity-80'
                   }`}
                />
              ))}
           </div>
        </section>

      </div>
      
      {/* Export Section */}
      <div className="p-6 border-t border-studio-border bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        {exportState === 'rendering' ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-studio-muted uppercase tracking-wider">
              <span>Génération du rendu...</span>
              <span>{Math.round(exportProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-studio-bg rounded-full overflow-hidden">
              <div 
                className="h-full bg-studio-accent transition-all duration-300 ease-out"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setExportState('rendering')}
            disabled={!mediaFile}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all ${
              mediaFile 
              ? 'bg-studio-text text-white hover:bg-black shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-studio-bg text-studio-muted cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter en 4K Studio
          </button>
        )}
      </div>

      {/* Branding / Footer */}
      <div className="py-4 border-t border-studio-border bg-studio-bg/10 flex justify-center">
         <p className="text-[9px] text-studio-muted font-bold tracking-[0.3em] uppercase opacity-40">High-End Rendering Platform</p>
      </div>
    </div>
  );
};
