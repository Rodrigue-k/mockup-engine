'use client';

import React from 'react';
import { PreviewCanvas } from './PreviewCanvas';
import { ControlPanel } from './ControlPanel';
import { ExportButton } from './ExportButton';

export default function StudioApp() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0C0C0C' }}>
      <main className="w-full h-full flex items-center justify-center" style={{ paddingRight: '300px' }}>
        <PreviewCanvas />
      </main>

      <div
        className="custom-scrollbar"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          bottom: '16px',
          width: '268px',
          background: 'rgba(18, 18, 18, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '0.5px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 50,
        }}
      >
        <header style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
            <rect x="0.5" y="0.5" width="15" height="21" rx="2.5" stroke="rgba(240,240,240,0.2)" strokeWidth="1"/>
            <rect x="3" y="4" width="10" height="14" rx="1.5" fill="#D0021B"/>
          </svg>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '0.12em', color: '#F0F0F0' }}>FACET</span>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }} className="custom-scrollbar">
          <ControlPanel />
        </div>

        <footer style={{ padding: '12px 16px', borderTop: '0.5px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <ExportButton />
        </footer>
      </div>
    </div>
  );
}
