'use client';

import React from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { PreviewCanvas } from './PreviewCanvas';
import { ControlPanel } from './ControlPanel';

export default function StudioApp() {
  const { isSidebarOpen, canvasSettings } = useStudioStore();

  return (
    <main className="flex flex-1 h-screen overflow-hidden bg-studio-bg selection:bg-studio-accent/20">
      {/* Dynamic Main Workspace */}
      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header / Intro */}
        <header className="flex items-center justify-between h-16 px-8 border-b border-studio-border bg-studio-card/80 backdrop-blur-sm z-10 font-sans shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-studio-accent/10 flex items-center justify-center border border-studio-accent/20">
              <div className="w-4 h-4 rounded-full border-2 border-studio-accent box-content" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <h1 className="text-sm font-bold tracking-tight text-studio-text">
                Universal <span className="text-studio-accent opacity-80">Mockup</span> Studio
              </h1>
              <p className="text-[9px] font-bold text-studio-muted uppercase tracking-[0.2em] opacity-60">Engine v1.0 • Hardware Accel.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
             <button className="px-5 py-2 text-[11px] font-bold text-studio-text hover:bg-studio-bg transition-colors rounded-xl border border-studio-border uppercase tracking-widest">
               Tutoriel
             </button>
             <button className="px-5 py-2 text-[11px] font-bold text-white bg-studio-text hover:bg-studio-text/90 transition-all rounded-xl shadow-studio uppercase tracking-widest flex items-center space-x-2">
               <span>Exporter</span>
               <div className="w-1 h-1 rounded-full bg-studio-accent animate-pulse" />
             </button>
          </div>
        </header>

        {/* Central Canvas Area */}
        <div 
           className="flex-1 relative flex items-center justify-center p-0 transition-colors duration-700 ease-in-out overflow-hidden"
           style={{ backgroundColor: canvasSettings.backgroundColor }}
        >
          {/* Subtle Surface Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{backgroundImage: 'radial-gradient(#111827 0.5px, transparent 0.5px)', backgroundSize: '15px 15px'}} />
          
          {/* Title Overlay (Elegance Factor) */}
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 text-center pointer-events-none select-none z-0">
             <h2 className="text-6xl lg:text-8xl font-serif text-studio-text/5 tracking-tighter mix-blend-multiply italic">
               Studio de Rendu
             </h2>
          </div>

          <PreviewCanvas />
        </div>
      </div>

      {/* Right Sidebar */}
      <aside 
        className={`w-80 border-l border-studio-border bg-studio-card transition-all duration-500 ease-in-out shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.03)] z-20 ${
          isSidebarOpen ? 'mr-0' : '-mr-80'
        }`}
      >
        <ControlPanel />
      </aside>
    </main>
  );
}
