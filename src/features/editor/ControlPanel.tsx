'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { PREMIUM_BACKGROUNDS, AspectRatio } from '@/config/studio-constants';
import { MOCKUPS } from '@/features/mockups/definitions';
import { getCanvasRefs } from './PreviewCanvas';
import { exportToPng } from './useImageExport';
// ── Available Mockup Frames ────────────────────────────────────────────────
const AVAILABLE_FRAMES = [
  { id: 'iphone-17-pro-silver', name: 'iPhone 17 Pro Silver', category: 'Mobile', available: true },
  { id: 'iphone-17-pro-orange', name: 'iPhone 17 Pro Cosmic Orange', category: 'Mobile', available: true },
  { id: 'iphone-17-pro-deepblue', name: 'iPhone 17 Pro Deep Blue', category: 'Mobile', available: true },
];

export const ControlPanel = () => {
  const {
    canvasSettings,
    updateCanvasSettings,
    setMediaFile,
    mediaFile,
    mediaType,
    exportStatus,
    exportProgress,
    setExportStatus,
    updateExportProgress,
    finishExport,
    exportError,
  } = useStudioStore();


  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMediaFile(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Unified Export Function ───────────────────────────────────────
  const startExport = async (type: 'image' | 'video') => {
    if (!mediaFile) return;

    try {
      setExportStatus('exporting');
      updateExportProgress(0);

      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('exportType', type);
      formData.append('settings', JSON.stringify(canvasSettings));

      const response = await fetch('/api/export', { method: 'POST', body: formData });
      const startData = await response.json();

      if (!response.ok || !startData.success) {
        throw new Error(startData.error || "Erreur lors de l'initialisation de l'export.");
      }

      const jobId = startData.jobId;
      let retryCount = 0;
      const MAX_RETRIES = 5;

      const poll = async () => {
        try {
          const statusRes = await fetch(`/api/export/status?id=${jobId}`);
          const statusData = await statusRes.json();

          if (!statusRes.ok || !statusData.success) {
            throw new Error(statusData.error || "Erreur lors du suivi de l'export.");
          }

          retryCount = 0;
          updateExportProgress(statusData.progress);

          if (statusData.status === 'completed') {
            if (statusData.url) {
              const link = document.createElement('a');
              link.href = statusData.url;
              const ext = type === 'image' ? 'png' : 'mp4';
              link.download = `mockup-${Date.now()}.${ext}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            finishExport();
            return;
          }

          if (statusData.status === 'error') {
            throw new Error(statusData.error || 'Le rendu a échoué sur le serveur.');
          }

          setTimeout(poll, 2000);
        } catch (err: any) {
          if (
            (err instanceof TypeError && err.message === 'Failed to fetch') ||
            err.name === 'AbortError'
          ) {
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              setTimeout(poll, 5000);
              return;
            }
          }
          exportError(err.message);
        }
      };

      poll();
    } catch (err: any) {
      exportError(err.message);
      alert(`Erreur d'export: ${err.message}`);
    }
  };

  const handlePngExport = async () => {
    // 1. Determine if we can use the fast local capture
    // If tilt is 0, local capture is almost pixel-perfect and much faster.
    const hasTilt = Math.abs(canvasSettings.mockupTilt.x) > 0.1 || Math.abs(canvasSettings.mockupTilt.y) > 0.1;

    if (!hasTilt) {
      const refs = getCanvasRefs();
      if (refs?.fullRef) {
        try {
          // Instant local capture
          await exportToPng({ current: refs.fullRef }, {
            isTransparent: canvasSettings.backgroundPreset === 'none'
          });
          return;
        } catch (err) {
          console.warn("Local capture failed, falling back to studio render...", err);
          // Fallback to server if local fails
        }
      }
    }

    // 2. High fidelity studio render (server-side)
    // Required when 3D tilt/perspective/shaders need to be exactly preserved.
    return startExport('image');
  };
  const handleVideoExport = () => startExport('video');

  const isImageMode = mediaType === 'image' || mediaType === null;
  const isVideoMode = mediaType === 'video';

  return (
    <div className="flex flex-col h-full bg-studio-card font-sans">

      {/* ── Media Import ──────────────────────────────────────────── */}
      <div className="p-6 border-b border-studio-border bg-studio-bg/50">
        <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block mb-4">
          Média Source
        </label>
        <div className="relative group overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
          <div
            className={`p-5 rounded-2xl border-2 border-dashed border-studio-border text-center transition-all group-hover:border-studio-accent group-hover:bg-studio-accent/[0.02] ${
              mediaFile ? 'bg-studio-accent/5 border-studio-accent' : 'bg-studio-card'
            }`}
          >
            <div className="text-xs font-semibold text-studio-text mb-1 truncate">
              {mediaFile ? mediaFile.name : 'Importer un Média'}
            </div>
            <p className="text-[10px] text-studio-muted">
              {isVideoMode ? '🎬 Vidéo' : isImageMode && mediaFile ? '🖼️ Image' : 'MP4, PNG, JPG (max 100MB)'}
            </p>
          </div>
        </div>

        {/* Mode badge & Remove button */}
        {mediaFile && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <span
                className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  isVideoMode
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isVideoMode ? '⚡ Mode Vidéo' : '✦ Mode Image'}
              </span>
            </div>
            
            <button
              onClick={handleRemoveMedia}
              className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-100"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* ── Frame Selection ──────────────────────────────────────── */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block">
            Frame / Appareil
          </label>
          <div className="space-y-2">
            {AVAILABLE_FRAMES.map((frame) => (
              <button
                key={frame.id}
                disabled={!frame.available}
                onClick={() => frame.available && updateCanvasSettings({ mockupType: frame.id as any })}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  canvasSettings.mockupType === frame.id
                    ? 'border-studio-accent bg-studio-accent/5 text-studio-accent shadow-sm ring-1 ring-studio-accent/10'
                    : frame.available
                    ? 'border-studio-border bg-studio-card hover:border-studio-muted/30 text-studio-text'
                    : 'border-studio-border/50 bg-studio-bg/50 text-studio-muted/40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Mini phone icon */}
                  <div
                    className={`w-5 h-8 rounded-[3px] border-2 flex items-center justify-center ${
                      canvasSettings.mockupType === frame.id
                        ? 'border-studio-accent'
                        : 'border-current opacity-50'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold">{frame.name}</div>
                    <div className="text-[9px] opacity-60 uppercase tracking-wider">{frame.category}</div>
                  </div>
                </div>
                {canvasSettings.mockupType === frame.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-studio-accent" />
                )}
                {!frame.available && (
                  <span className="text-[8px] uppercase tracking-wider opacity-40">Bientôt</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Orientation Toggle ────────────────────────────────────── */}
        <section className="space-y-4 border-t border-studio-border pt-6">
          <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block">
            Orientation
          </label>
          <div className="flex bg-studio-bg p-1 rounded-xl gap-1">
            {/* Portrait */}
            <button
              onClick={() => updateCanvasSettings({ deviceOrientation: 'portrait' })}
              className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                canvasSettings.deviceOrientation === 'portrait'
                  ? 'bg-studio-card text-studio-accent shadow-sm ring-1 ring-black/5'
                  : 'text-studio-muted hover:text-studio-text'
              }`}
            >
              {/* Portrait phone icon */}
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <rect x="0.5" y="0.5" width="9" height="15" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <rect x="3" y="2" width="4" height="0.8" rx="0.4" fill="currentColor" opacity="0.5" />
              </svg>
              <span className="text-[10px] font-bold">Portrait</span>
            </button>

            {/* Landscape */}
            <button
              onClick={() => updateCanvasSettings({ deviceOrientation: 'landscape' })}
              className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                canvasSettings.deviceOrientation === 'landscape'
                  ? 'bg-studio-card text-studio-accent shadow-sm ring-1 ring-black/5'
                  : 'text-studio-muted hover:text-studio-text'
              }`}
            >
              {/* Landscape phone icon (rotated) */}
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <rect x="0.5" y="0.5" width="15" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <rect x="2" y="3" width="0.8" height="4" rx="0.4" fill="currentColor" opacity="0.5" />
              </svg>
              <span className="text-[10px] font-bold">Paysage</span>
            </button>
          </div>

          {canvasSettings.deviceOrientation === 'landscape' && (
            <p className="text-[9px] text-studio-muted bg-studio-bg/80 rounded-lg px-3 py-2">
              Idéal pour les screenshots de jeux, apps horizontales ou le partage d'écran PC.
            </p>
          )}
        </section>

        {/* ── Layout Settings ───────────────────────────────────────── */}
        <section className="space-y-6 border-t border-studio-border pt-6">
          <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block">
            Réglages Studio
          </label>

          {/* Aspect format */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-semibold text-studio-muted uppercase tracking-wider block">
              <span>Format Canvas</span>
            </div>
            <div className="grid grid-cols-4 gap-2 bg-studio-bg p-1 rounded-xl">
              {(['9:16', '16:9', '1:1', '4:5'] as AspectRatio[]).map((format) => (
                <button
                  key={format}
                  onClick={() => updateCanvasSettings({ format })}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    canvasSettings.format === format
                      ? 'bg-studio-card text-studio-accent shadow-sm ring-1 ring-black/5'
                      : 'text-studio-muted hover:text-studio-text'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Fit mode */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-semibold text-studio-muted uppercase tracking-wider block">
                Recadrage Écran
              </label>
              {canvasSettings.deviceOrientation === 'landscape' && (
                <span className="text-[9px] text-studio-accent font-medium animate-pulse">
                  Astuce : Utilisez "Étaler" pour remplir tout l'écran
                </span>
              )}
            </div>
            <div className="flex bg-studio-bg p-1 rounded-xl gap-1">
              {[
                { id: 'contain', label: 'Adapter' },
                { id: 'cover', label: 'Remplir' },
                { id: 'fill', label: 'Étaler' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updateCanvasSettings({ videoFit: mode.id as any })}
                  className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg transition-all ${
                    canvasSettings.videoFit === mode.id
                      ? 'bg-studio-card text-studio-accent shadow-sm ring-1 ring-black/5'
                      : 'text-studio-muted hover:text-studio-text'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Padding */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] font-medium text-studio-text">
              <span>Padding</span>
              <span className="text-studio-muted">{canvasSettings.padding}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={canvasSettings.padding}
              onChange={(e) => updateCanvasSettings({ padding: parseInt(e.target.value) })}
              className="w-full h-1 bg-studio-bg rounded-full appearance-none cursor-pointer accent-studio-accent"
            />
          </div>

          {/* Shadow */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] font-medium text-studio-text">
              <span>Ombre Portée</span>
              <span className="text-studio-muted">
                {(canvasSettings.shadowIntensity * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={canvasSettings.shadowIntensity * 100}
              onChange={(e) =>
                updateCanvasSettings({ shadowIntensity: parseInt(e.target.value) / 100 })
              }
              className="w-full h-1 bg-studio-bg rounded-full appearance-none cursor-pointer accent-studio-accent"
            />
          </div>

          {/* Tilt */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] font-medium text-studio-text">
              <span>Inclinaison (Tilt)</span>
              <span className="text-studio-muted">{canvasSettings.mockupTilt.y}º</span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              value={canvasSettings.mockupTilt.y}
              onChange={(e) =>
                updateCanvasSettings({
                  mockupTilt: { ...canvasSettings.mockupTilt, y: parseInt(e.target.value) },
                })
              }
              className="w-full h-1 bg-studio-bg rounded-full appearance-none cursor-pointer accent-studio-accent"
            />
          </div>
        </section>

        {/* ── Background Selection ────────────────────────────────────── */}
        <section className="space-y-6 border-t border-studio-border pt-6">

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-studio-muted uppercase tracking-widest block">
              Style d'arrière-plan
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PREMIUM_BACKGROUNDS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() =>
                    updateCanvasSettings({
                      bgType: config.type as any,
                      bgValue: config.value,
                      backgroundPreset: key,
                    })
                  }
                  className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all p-2 text-left group ${
                    canvasSettings.backgroundPreset === key
                      ? 'border-studio-accent bg-studio-accent/5 ring-1 ring-studio-accent/20'
                      : 'border-studio-border bg-studio-card hover:border-studio-muted/30'
                  }`}
                >
                  <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                    {config.type === 'solid' || config.type === 'gradient' ? (
                      <div style={{ background: config.value, width: '100%', height: '100%' }} />
                    ) : key === 'none' ? (
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                          backgroundSize: '10px 10px',
                          backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          backgroundImage:
                            config.type === 'pattern_dots'
                              ? `radial-gradient(${config.value} 1px, transparent 1px)`
                              : `linear-gradient(to right, ${config.value} 1px, transparent 1px), linear-gradient(to bottom, ${config.value} 1px, transparent 1px)`,
                          backgroundSize:
                            config.type === 'pattern_dots' ? '10px 10px' : '15px 15px',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    )}
                  </div>
                  <span
                    className={`relative text-[10px] font-bold uppercase tracking-wider block ${
                      canvasSettings.backgroundPreset === key
                        ? 'text-studio-accent'
                        : 'text-studio-text'
                    }`}
                  >
                    {key === 'none' 
                      ? 'Transparent' 
                      : key
                        .replace('solid_', '')
                        .replace('gradient_', '')
                        .replace('pattern_', '')
                        .replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Export Footer ─────────────────────────────────────────── */}
      <div className="p-6 border-t border-studio-border bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)] space-y-3">

        {isImageMode ? (
          // IMAGE MODE EXPORT
          <>


            {/* PNG Export button */}
            <button
              onClick={handlePngExport}
              disabled={!mediaFile || exportStatus === 'exporting'}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all ${
                mediaFile && exportStatus !== 'exporting'
                  ? 'bg-studio-text text-white hover:bg-black shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-studio-bg text-studio-muted cursor-not-allowed'
              }`}
            >
              {exportStatus === 'exporting' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                  </svg>
                  Export en cours...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exporter en PNG
                </>
              )}
            </button>
          </>
        ) : exportStatus === 'exporting' ? (
          // VIDEO EXPORT IN PROGRESS
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
          // VIDEO EXPORT BUTTON
          <button
            onClick={handleVideoExport}
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

      {/* Branding */}
      <div className="py-4 border-t border-studio-border bg-studio-bg/10 flex justify-center">
        <p className="text-[9px] text-studio-muted font-bold tracking-[0.3em] uppercase opacity-40">
          High-End Rendering Platform
        </p>
      </div>
    </div>
  );
};
