'use client';

import React from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { getCanvasRefs } from './PreviewCanvas';
import { exportToPng } from './useImageExport';

export const ExportButton = () => {
  const {
    canvasSettings,
    mediaFile,
    mediaType,
    exportStatus,
    exportProgress,
    setExportStatus,
    updateExportProgress,
    finishExport,
    exportError,
  } = useStudioStore();

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
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Export failed');

      const poll = async () => {
        const res = await fetch(`/api/export/status?id=${data.jobId}`);
        const status = await res.json();
        updateExportProgress(status.progress);
        if (status.status === 'completed') {
          const downloadUrl = `/api/export/download/${encodeURIComponent(status.url.split('/').pop()!)}/mockup-${Date.now()}.mp4`;
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.click();
          finishExport();
        } else if (status.status === 'error') {
          throw new Error(status.error);
        } else {
          setTimeout(poll, 2000);
        }
      };
      poll();
    } catch (err: any) {
      exportError(err.message);
    }
  };

  const handleExport = () => {
    if (mediaType === 'video') startExport('video');
    else {
      const hasTilt = Math.abs(canvasSettings.mockupTilt.x) > 0.1 || Math.abs(canvasSettings.mockupTilt.y) > 0.1;
      if (!hasTilt) {
        const refs = getCanvasRefs();
        if (refs?.fullRef) {
          setExportStatus('exporting');
          exportToPng({ current: refs.fullRef }, { isTransparent: canvasSettings.backgroundPreset === 'none' })
            .then(finishExport)
            .catch(() => startExport('image'));
          return;
        }
      }
      startExport('image');
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!mediaFile || exportStatus === 'exporting'}
      className={`w-full py-3 font-semibold tracking-widest rounded-lg transition-all active:scale-[0.98] ${
        !mediaFile || exportStatus === 'exporting'
          ? 'bg-white/5 text-white/20 cursor-not-allowed'
          : 'bg-f-accent hover:bg-f-accent-hover text-white shadow-lg shadow-f-accent/20'
      }`}
      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', letterSpacing: '0.1em' }}
    >
      {exportStatus === 'exporting' 
        ? `EXPORTING ${Math.round(exportProgress)}%` 
        : mediaType === 'video' ? 'EXPORT 4K STUDIO' : 'EXPORT PNG'}
    </button>
  );
};
