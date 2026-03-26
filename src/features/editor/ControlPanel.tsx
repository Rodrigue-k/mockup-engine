'use client';

import React from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { PREMIUM_BACKGROUNDS, AspectRatio } from '@/config/studio-constants';

export const ControlPanel = () => {
  const { 
    canvasSettings, 
    updateCanvasSettings, 
    setBackgroundPreset,
    setMediaFile,
    mediaFile,
    mediaType,
    exportStatus,
    exportProgress,
    setExportStatus,
    updateExportProgress,
    finishExport,
    exportError
  } = useStudioStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMediaFile(file);
  };

  const handleExport = async () => {
    if (!mediaFile) return;

    try {
      setExportStatus('exporting');
      updateExportProgress(0);

      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('mediaType', mediaFile.type.startsWith('video/') ? 'video' : 'image');
      formData.append('settings', JSON.stringify(canvasSettings));

      const response = await fetch('/api/export', {
        method: 'POST',
        body: formData,
      });

      const startData = await response.json();
      if (!response.ok || !startData.success) {
        throw new Error(startData.error || "Erreur lors de l'initialisation de l'export.");
      }

      const jobId = startData.jobId;

      // Système de Polling résilient pour suivre la progression du rendu Remotion
      let retryCount = 0;
      const MAX_RETRIES = 5;

      const poll = async () => {
        try {
          const statusResponse = await fetch(`/api/export/status?id=${jobId}`);
          const statusData = await statusResponse.json();

          if (!statusResponse.ok || !statusData.success) {
            throw new Error(statusData.error || "Erreur lors du suivi de l'export.");
          }

          // Reset retries on any successful network call
          retryCount = 0;
          updateExportProgress(statusData.progress);

          if (statusData.status === 'completed') {
            if (statusData.url) {
              const link = document.createElement('a');
              link.href = statusData.url;
              link.download = `mockup-export-${Date.now()}.mp4`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            finishExport();
            return;
          }

          if (statusData.status === 'error') {
            throw new Error(statusData.error || "Le rendu a échoué sur le serveur.");
          }

          // Planifier la prochaine vérification avec un intervalle stable
          setTimeout(poll, 2500);

        } catch (err: any) {
          // Gestion des redémarrages serveur Turbopack (Failed to fetch)
          if ((err instanceof TypeError && err.message === 'Failed to fetch') || err.name === 'AbortError') {
             if (retryCount < MAX_RETRIES) {
                retryCount++;
                console.warn(`[Studio] Connexion interrompue, tentative ${retryCount}/${MAX_RETRIES} dans 5s...`);
                setTimeout(poll, 5000);
                return;
             }
          }

          exportError(err.message);
          console.error("Erreur polling fatale:", err);
        }
      };

      // Démarrer le polling
      poll();

    } catch (err: any) {
      exportError(err.message);
      alert(`Erreur d'export: ${err.message}`);
    }
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
        
        {/* Appareil Choice */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block">Appareil</label>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-studio-accent bg-studio-accent/5 text-studio-accent shadow-sm ring-1 ring-studio-accent/10">
              <span className="text-xs font-medium">iPhone 17 Pro</span>
              <div className="w-1.5 h-1.5 rounded-full bg-studio-accent" />
            </div>
          </div>
        </section>

        {/* Layout Settings */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block pt-2 border-t border-studio-border pt-6">Réglages Studio</label>
          
          <div className="space-y-4">
             <label className="text-[10px] font-semibold text-studio-muted uppercase tracking-wider block">Format Vidéo</label>
              <div className="flex bg-studio-bg p-1 rounded-xl">
                {(['contain', 'cover', 'fill'] as const).map((mode) => (
                  <button 
                    key={mode}
                    onClick={() => updateCanvasSettings({ videoFit: mode })}
                    className={`flex-1 py-1.5 px-3 text-[10px] font-bold rounded-lg transition-all capitalize
                      ${canvasSettings.videoFit === mode 
                        ? 'bg-studio-card text-studio-accent shadow-sm ring-1 ring-black/5' 
                        : 'text-studio-muted hover:text-studio-text'
                      }`}
                  >
                    {mode === 'fill' ? 'stretch' : mode}
                  </button>
                ))}
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-semibold text-studio-muted uppercase tracking-wider block">Format Vidéo</label>
              <div className="grid grid-cols-4 gap-2 bg-studio-bg p-1 rounded-xl">
                {(['9:16', '16:9', '1:1', '4:5'] as AspectRatio[]).map((format) => (
                  <button 
                    key={format}
                    onClick={() => updateCanvasSettings({ format })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all
                      ${canvasSettings.format === format 
                        ? 'bg-studio-card text-studio-accent shadow-sm ring-1 ring-black/5' 
                        : 'text-studio-muted hover:text-studio-text'
                      }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
           </div>

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

        {/* Background Presets */}
        <section className="space-y-4">
           <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block border-t border-studio-border pt-6">Arrière-plan (Smart)</label>
           <div className="grid grid-cols-2 gap-3">
              {Object.entries(PREMIUM_BACKGROUNDS).map(([key, config]) => (
                <button 
                  key={key}
                  onClick={() => updateCanvasSettings({ 
                    bgType: config.type as any, 
                    bgValue: config.value,
                    backgroundPreset: key 
                  })}
                  className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all p-2 text-left group
                    ${canvasSettings.backgroundPreset === key 
                      ? 'border-studio-accent bg-studio-accent/5 ring-1 ring-studio-accent/20' 
                      : 'border-studio-border bg-studio-card hover:border-studio-muted/30'
                    }`}
                >
                  <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                    {config.type === 'solid' || config.type === 'gradient' ? (
                      <div style={{ background: config.value, width: '100%', height: '100%' }} />
                    ) : (
                      <div 
                        style={{ 
                          backgroundColor: '#F8FAFC',
                          backgroundImage: config.type === 'pattern_dots' 
                            ? `radial-gradient(${config.value} 1px, transparent 1px)` 
                            : `linear-gradient(to right, ${config.value} 1px, transparent 1px), linear-gradient(to bottom, ${config.value} 1px, transparent 1px)`,
                          backgroundSize: config.type === 'pattern_dots' ? '10px 10px' : '15px 15px',
                          width: '100%', 
                          height: '100%' 
                        }} 
                      />
                    )}
                  </div>
                  
                  <span className={`relative text-[10px] font-bold uppercase tracking-wider block
                    ${canvasSettings.backgroundPreset === key ? 'text-studio-accent' : 'text-studio-text'}
                  `}>
                    {key.replace('solid_', '').replace('gradient_', '').replace('pattern_', '').replace('_', ' ')}
                  </span>
                </button>
              ))}
           </div>
        </section>

      </div>
      
      {/* Export Section */}
      <div className="p-6 border-t border-studio-border bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        {exportStatus === 'exporting' ? (
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
            onClick={handleExport}
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
