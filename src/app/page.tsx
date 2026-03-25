'use client';

import dynamic from 'next/dynamic';

// On utilise next/dynamic avec ssr: false car StudioApp utilise WebCodecs 
// et des Web Workers qui n'existent pas sur le serveur.
const StudioApp = dynamic(() => import('@/features/editor/StudioApp'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-studio-bg font-sans">
      <div className="w-12 h-12 rounded-2xl bg-studio-card flex items-center justify-center shadow-studio animate-pulse">
        <div className="w-6 h-6 rounded-full border-2 border-studio-accent border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-xs font-semibold text-studio-muted uppercase tracking-[0.2em]">Chargement du Studio...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-studio-bg overflow-hidden flex flex-col">
       <StudioApp />
    </div>
  );
}
