'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { PREMIUM_BACKGROUNDS, AspectRatio } from '@/config/studio-constants';
import { MOCKUPS, MockupType } from '@/features/mockups/definitions';
import { getCanvasRefs } from './PreviewCanvas';
import { exportToPng } from './useImageExport';


const SectionLabel = ({ label }: { label: string }) => (
  <span className="text-[11px] text-f-secondary mb-2 block font-medium">{label}</span>
);

const Slider = ({ value, min, max, onChange, unit = '' }: any) => (
  <div className="flex items-center gap-3 h-6">
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="flex-1 appearance-none cursor-grab active:cursor-grabbing"
    />
    <span className="text-f-secondary text-[10px] font-mono min-w-[32px] text-right">
      {value}{unit}
    </span>
  </div>
);

const ButtonGroup = ({ options, activeValue, onSelect }: any) => (
  <div className="flex gap-1 bg-f-base/50 p-0.5 rounded">
    {options.map((opt: any) => (
      <button
        key={opt.id}
        onClick={() => onSelect(opt.id)}
        className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
          activeValue === opt.id
            ? 'bg-f-elevated text-f-primary border border-f-border'
            : 'text-f-secondary hover:text-f-primary hover:bg-white/5'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const ControlPanel = () => {
  const {
    canvasSettings,
    updateCanvasSettings,
    mediaPreviewUrl,
  } = useStudioStore();

  const [showEmbed, setShowEmbed] = useState(false);

  const getLabel = (type: MockupType) => {
    switch(type) {
      case 'iphone-17-pro-silver': return 'Silver';
      case 'iphone-17-pro-orange': return 'Orange';
      case 'iphone-17-pro-deepblue': return 'Deep Blue';
      default: return '';
    }
  };



  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Section 1 — Device */}
        <section className="px-5 py-4 space-y-4">
          <div>
            <SectionLabel label="Model" />
            <div className="flex gap-3">
              {(['iphone-17-pro-silver', 'iphone-17-pro-orange', 'iphone-17-pro-deepblue'] as MockupType[]).map((type) => {
                const m = MOCKUPS[type];
                const isActive = canvasSettings.mockupType === type;
                return (
                  <div key={type} className="flex flex-col items-center">
                    <button
                      onClick={() => updateCanvasSettings({ mockupType: type })}
                      className={`relative rounded-lg overflow-hidden transition-all ${isActive ? 'ring-2 ring-f-accent' : 'opacity-50 hover:opacity-80'}`}
                      style={{ width: '64px', height: '80px', background: '#0C0C0C' }}
                    >
                      <img
                        src={`/assets/mockups/${m.frameId}/body.png`}
                        alt={m.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </button>
                    <span className="text-[10px] text-f-secondary text-center mt-1 block">
                      {getLabel(type)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <SectionLabel label="Orientation" />
            <ButtonGroup
              options={[{ id: 'portrait', label: 'PORTRAIT' }, { id: 'landscape', label: 'LANDSCAPE' }]}
              activeValue={canvasSettings.deviceOrientation}
              onSelect={(val: any) => updateCanvasSettings({ deviceOrientation: val })}
            />
          </div>
        </section>

        {/* Section 2 — Canvas */}
        <section className="px-5 py-4 border-t border-f-border space-y-4">
          <div>
            <SectionLabel label="Format" />
            <ButtonGroup
              options={[
                { id: '9:16', label: '9:16' },
                { id: '16:9', label: '16:9' },
                { id: '1:1', label: '1:1' },
                { id: '4:5', label: '4:5' }
              ]}
              activeValue={canvasSettings.format}
              onSelect={(val: any) => updateCanvasSettings({ format: val })}
            />
          </div>
          <div>
            <SectionLabel label="Padding" />
            <Slider
              value={canvasSettings.padding}
              min={0}
              max={100}
              onChange={(val: number) => updateCanvasSettings({ padding: val })}
            />
          </div>
        </section>

        {/* Section 3 — Screen */}
        <section className="px-5 py-4 border-t border-f-border space-y-4">
          <div>
            <SectionLabel label="Fit Mode" />
            <ButtonGroup
              options={[
                { id: 'contain', label: 'CONTAIN' },
                { id: 'cover', label: 'COVER' },
                { id: 'fill', label: 'FILL' }
              ]}
              activeValue={canvasSettings.videoFit}
              onSelect={(val: any) => updateCanvasSettings({ videoFit: val })}
            />
          </div>
          <div>
            <SectionLabel label="Tilt" />
            <Slider
              value={canvasSettings.mockupTilt.y}
              min={-15}
              max={15}
              unit="°"
              onChange={(val: number) => updateCanvasSettings({ mockupTilt: { ...canvasSettings.mockupTilt, y: val } })}
            />
          </div>
        </section>

        {/* Section 4 — Shadow */}
        <section className="px-5 py-4 border-t border-f-border">
          <SectionLabel label="Shadow Intensity" />
          <Slider
            value={Math.round(canvasSettings.shadowIntensity * 100)}
            min={0}
            max={100}
            unit="%"
            onChange={(val: number) => updateCanvasSettings({ shadowIntensity: val / 100 })}
          />
        </section>

        {/* Section 5 — Background */}
        <section className="px-5 py-4 border-t border-f-border">
          <SectionLabel label="Background" />
          <div className="grid grid-cols-5 gap-2">
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
                className={`aspect-square rounded-sm border transition-all ${
                  canvasSettings.backgroundPreset === key
                    ? 'border-f-accent ring-2 ring-f-accent/20'
                    : 'border-f-border hover:border-f-secondary/50'
                }`}
                style={{ 
                  background: config.type === 'solid' || config.type === 'gradient' ? config.value : '#1f1f1f',
                  backgroundImage: config.type === 'pattern_dots' ? `radial-gradient(${config.value} 1px, transparent 1px)` : 
                                   config.type === 'pattern_grid' ? `linear-gradient(to right, ${config.value} 1px, transparent 1px), linear-gradient(to bottom, ${config.value} 1px, transparent 1px)` : undefined,
                  backgroundSize: config.type === 'pattern_dots' ? '4px 4px' : '6px 6px'
                }}
                title={key}
              />
            ))}
          </div>
        </section>

        <section className="px-5 py-6 border-t border-f-border">
          <button
            onClick={() => setShowEmbed(true)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '8px',
              background: 'transparent',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: '#888',
              fontSize: '13px',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            GET EMBED CODE
          </button>
        </section>
      </div>

      <EmbedModal 
        isOpen={showEmbed} 
        onClose={() => setShowEmbed(false)} 
        settings={canvasSettings}
        mediaUrl={mediaPreviewUrl}
      />
    </div>
  );
};

const EmbedModal = ({ isOpen, onClose, settings, mediaUrl }: any) => {
  const [tab, setTab] = useState<'wc' | 'iframe'>('wc');
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  const currentDevice = settings.mockupType;
  const currentBg = encodeURIComponent(settings.bgValue);
  const currentTilt = settings.mockupTilt.y;
  const currentOrientation = settings.deviceOrientation;
  const currentSrc = mediaUrl || 'YOUR_IMAGE_URL';

  const wcCode = `<script src="https://cdn.jsdelivr.net/gh/Rodrigue-k/mockup-engine@latest/public/frame.js"></script>\n\n<facet-frame\n  device="${currentDevice}"\n  src="${currentSrc}"\n  background="${settings.bgValue}"\n  tilt="${currentTilt}"\n  orientation="${currentOrientation}"\n/>`;

  const iframeCode = `<iframe\n  src="${origin}/embed?device=${currentDevice}&bg=${currentBg}&tilt=${currentTilt}&orientation=${currentOrientation}&src=${encodeURIComponent(currentSrc)}"\n  width="300"\n  height="600"\n  frameborder="0"\n/>`;

  if (!isOpen) return null;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '440px',
          background: 'rgba(21, 21, 21, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '0.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          padding: '24px',
          color: '#F0F0F0',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em', fontWeight: 700 }}>EMBED PRO</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: '#888', 
              cursor: 'pointer', 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}
          >
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '10px', marginBottom: '20px', border: '0.5px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => { setTab('wc'); setCopied(false); }}
            style={{ 
              flex: 1, padding: '8px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', border: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: tab === 'wc' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: tab === 'wc' ? '#fff' : '#666',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.08em'
            }}
          >WEB COMPONENT</button>
          <button 
            onClick={() => { setTab('iframe'); setCopied(false); }}
            style={{ 
              flex: 1, padding: '8px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', border: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: tab === 'iframe' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: tab === 'iframe' ? '#fff' : '#666',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.08em'
            }}
          >IFRAME FALLBACK</button>
        </div>

        <div style={{ position: 'relative' }}>
          <pre style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '16px', 
            borderRadius: '12px', 
            fontSize: '11px', 
            fontFamily: "'JetBrains Mono', monospace", 
            overflowX: 'auto',
            border: '0.5px solid rgba(255,255,255,0.05)',
            margin: '0 0 20px 0',
            color: '#999',
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {tab === 'wc' ? wcCode : iframeCode}
          </pre>
        </div>

        <button 
          onClick={() => copy(tab === 'wc' ? wcCode : iframeCode)}
          style={{
            width: '100%',
            padding: '12px',
            background: copied ? '#4ade80' : '#F0F0F0',
            color: '#000',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.08em',
            transition: 'all 0.2s ease'
          }}
        >
          {copied ? 'COPIED TO CLIPBOARD' : 'COPY EMBED CODE'}
        </button>
      </div>
    </div>
  );
};
