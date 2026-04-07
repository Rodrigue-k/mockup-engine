import React, { Suspense } from 'react';
import { EmbedCanvas } from '@/app/embed/EmbedCanvas';

export default function EmbedPage() {
  return (
    <div style={{ margin: 0, padding: 0, background: 'transparent', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Suspense fallback={null}>
        <EmbedCanvas />
      </Suspense>
    </div>
  );
}
