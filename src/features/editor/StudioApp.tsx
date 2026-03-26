'use client';

import React from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { PreviewCanvas } from './PreviewCanvas';
import { ControlPanel } from './ControlPanel';
export default function StudioApp() {
  const { isSidebarOpen } = useStudioStore();

  return (
    <main className="flex h-screen overflow-hidden bg-[#f6f5f3] selection:bg-studio-accent/20">
      {/* Central Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-8 transition-colors duration-700 ease-in-out overflow-hidden">
        {/* Subtle Surface Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{backgroundImage: 'radial-gradient(#111827 0.5px, transparent 0.5px)', backgroundSize: '15px 15px'}} />
        
        {/* Title Overlay (Elegance Factor) */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-center pointer-events-none select-none z-0">
           <h2 className="text-[140px] font-serif text-studio-text/5 tracking-tighter mix-blend-multiply italic">
             Studio
           </h2>
        </div>

        <PreviewCanvas />
      </div>

      {/* Right Sidebar - High-density control */}
      <aside 
        className={`w-[340px] border-l border-studio-border bg-studio-card transition-all duration-500 ease-in-out shadow-[-20px_0_50px_rgba(0,0,0,0.03)] z-20 ${
          isSidebarOpen ? 'mr-0' : '-mr-[340px]'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand Section in Sidebar */}
          <div className="px-8 py-6 border-b border-studio-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-studio-accent flex items-center justify-center shadow-lg shadow-studio-accent/20">
                <div className="w-3 h-3 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-xs font-black tracking-widest text-studio-text uppercase">
                  Universal <span className="text-studio-accent">Engine</span>
                </h1>
                <p className="text-[8px] font-bold text-studio-muted uppercase tracking-[0.2em] -mt-0.5">V1.0 High-End Render</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ControlPanel />
          </div>
        </div>
      </aside>
    </main>
  );
}
