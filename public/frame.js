(function() {
  const MOCKUPS = {
    'iphone-17-pro-silver': {
      width: 448, height: 916,
      frameId: 'iphone17-silver',
      viewport: { x: 22, y: 20, width: 404, height: 876, borderRadius: 57 }
    },
    'iphone-17-pro-orange': {
      width: 448, height: 916,
      frameId: 'iphone17-orange',
      viewport: { x: 22, y: 20, width: 404, height: 876, borderRadius: 57 }
    },
    'iphone-17-pro-deepblue': {
      width: 448, height: 916,
      frameId: 'iphone17-deepblue',
      viewport: { x: 22, y: 20, width: 404, height: 876, borderRadius: 57 }
    },
  };

  // Spécifications techniques extraites de definitions.ts pour un rendu au pixel près
  const MOCKUPS_DATA = {
    'iphone-17-pro': {
      width: 448,
      height: 916,
      viewport: { x: 22, y: 20, width: 404, height: 876, r: 57 }
    }
  };

  // Détection dynamique de l'URL de base pour les assets (images des téléphones)
  const SCRIPT_URL = document.currentScript ? document.currentScript.src : '';
  let BASE_URL = window.location.origin + '/assets/mockups';

  if (SCRIPT_URL.includes('jsdelivr.net')) {
    BASE_URL = SCRIPT_URL.replace('/public/frame.js', '/public/assets/mockups');
  }

  class FacetFrame extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.render();
    }

    static get observedAttributes() {
      return ['device', 'src', 'background', 'tilt', 'orientation'];
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      const device = this.getAttribute('device') || 'iphone-17-pro-silver';
      const src = this.getAttribute('src');
      const background = this.getAttribute('background') || '#000000';
      const tilt = this.getAttribute('tilt') || '0';
      const orientation = this.getAttribute('orientation') || 'portrait';

      const isLandscape = orientation === 'landscape';
      
      // On récupère les données de base pour l'iPhone 17 Pro
      const data = MOCKUPS_DATA['iphone-17-pro'];
      const frameId = device.includes('silver') ? 'iphone17-silver' : 
                      device.includes('orange') ? 'iphone17-orange' : 'iphone17-deepblue';

      const bodyUrl = `${BASE_URL}/${frameId}/body.png`;

      this.shadowRoot.innerHTML = `
        <style>
          :host { 
            display: block; 
            width: 100%; 
            height: 100%; 
            --bg-color: ${background};
          }
          .wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-color);
            overflow: hidden;
          }
          .frame-container {
            position: relative;
            width: ${data.width}px;
            height: ${data.height}px;
            transform: perspective(1200px) rotateY(${tilt}deg);
            transform-style: preserve-3d;
            transition: transform 0.4s ease-out;
          }
          .device-body {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 20;
            pointer-events: none;
            ${isLandscape ? 'transform: rotate(-90deg);' : ''}
          }
          .screen {
            position: absolute;
            top: ${data.viewport.y}px;
            left: ${data.viewport.x}px;
            width: ${data.viewport.width}px;
            height: ${data.viewport.height}px;
            background: #000;
          }
          .media {
            width: 100%;
            height: 100%;
            object-fit: ${fit};
            display: block;
          }
          .chassis {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            z-index: 10;
            pointer-events: none;
          }
        </style>

        <div class="stage">
          <div class="device">
            <div class="inner">
              <div class="screen-layer">
                ${src ? `<img class="media" src="${src}" crossorigin="anonymous" />` : ''}
              </div>
              <img class="chassis" src="${bodyUrl}" crossorigin="anonymous" />
            </div>
          </div>
        </div>
      `;
    }
  }

  if (!customElements.get('facet-frame')) {
    customElements.define('facet-frame', FacetFrame);
  }
})();
