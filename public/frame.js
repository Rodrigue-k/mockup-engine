(function() {
  // Définitions géométriques précises pour iPhone 17 Pro
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

  // Détection robuste de l'URL de base pour les assets (images des téléphones)
  const SCRIPT_TAG = document.currentScript;
  let BASE_URL = window.location.origin + '/assets/mockups';

  if (SCRIPT_TAG && SCRIPT_TAG.src) {
    const scriptUrl = SCRIPT_TAG.src;
    // On prend le dossier contenant le script et on ajoute assets/mockups
    const folderPath = scriptUrl.substring(0, scriptUrl.lastIndexOf('/'));
    BASE_URL = folderPath + '/assets/mockups';
    
    // Cas spécial pour JSDelivr qui peut ne pas avoir le bon path relatif sans cette correction
    if (scriptUrl.includes('jsdelivr.net')) {
       BASE_URL = scriptUrl.replace('/public/frame.js', '/public/assets/mockups');
       if (BASE_URL.includes('/gh/')) {
          BASE_URL = BASE_URL.replace('/gh/', '/gh/').split('/public/')[0] + '/public/assets/mockups';
       }
    }
  }

  class FacetFrame extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._observer = null;
    }

    connectedCallback() {
      this.render();
      this._setupObserver();
    }

    disconnectedCallback() {
      if (this._observer) {
        this._observer.disconnect();
      }
    }

    _setupObserver() {
      if (this._observer) this._observer.disconnect();
      
      this._observer = new ResizeObserver(() => {
        // Use requestAnimationFrame to ensure we measure after layout
        requestAnimationFrame(() => this._updateScale());
      });
      
      const wrapper = this.shadowRoot.querySelector('.wrapper');
      if (wrapper) this._observer.observe(wrapper);
    }

    _updateScale() {
      const wrapper = this.shadowRoot.querySelector('.wrapper');
      const container = this.shadowRoot.querySelector('.frame-target');
      if (!wrapper || !container) return;

      const rect = wrapper.getBoundingClientRect();
      const deviceId = this.getAttribute('device') || 'iphone-17-pro-silver';
      const mockup = MOCKUPS[deviceId] || MOCKUPS['iphone-17-pro-silver'];
      const orientation = this.getAttribute('orientation') || 'portrait';
      const isLandscape = orientation === 'landscape';

      const targetW = isLandscape ? mockup.height : mockup.width;
      const targetH = isLandscape ? mockup.width : mockup.height;

      // Protection contre divisions par zéro ou rect non défini
      if (rect.width === 0 || rect.height === 0 || targetW === 0 || targetH === 0) return;

      const scaleX = rect.width / targetW;
      const scaleY = rect.height / targetH;
      const scale = Math.min(scaleX, scaleY);

      container.style.transform = `scale(${scale})`;
    }

    static get observedAttributes() {
      return ['device', 'src', 'background', 'tilt', 'orientation'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal !== newVal) {
        this.render();
      }
    }

    render() {
      const device = this.getAttribute('device') || 'iphone-17-pro-silver';
      const src = this.getAttribute('src');
      const background = this.getAttribute('background') || '#000000';
      const tilt = parseFloat(this.getAttribute('tilt') || '0');
      const orientation = this.getAttribute('orientation') || 'portrait';

      const isLandscape = orientation === 'landscape';
      const m = MOCKUPS[device] || MOCKUPS['iphone-17-pro-silver'];
      
      const viewport = isLandscape ? {
          x: m.viewport.y,
          y: m.viewport.x,
          width: m.viewport.height,
          height: m.viewport.width,
          r: m.viewport.borderRadius
      } : {
          ...m.viewport,
          r: m.viewport.borderRadius
      };

      const frameWidth = isLandscape ? m.height : m.width;
      const frameHeight = isLandscape ? m.width : m.height;

      const bodyUrl = `${BASE_URL}/${m.frameId}/body.png`;

      this.shadowRoot.innerHTML = `
        <style>
          :host { 
            display: block; 
            width: 100%; 
            height: 100%; 
          }
          .wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${background};
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .stage {
            perspective: 1200px;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .frame-target {
            position: relative;
            width: ${frameWidth}px;
            height: ${frameHeight}px;
            transform-origin: center center;
            transform-style: preserve-3d;
            transition: transform 0.1s ease-out;
          }
          .rotate-container {
            width: 100%;
            height: 100%;
            transform: rotateY(${tilt}deg);
            transform-style: preserve-3d;
          }
          .screen-layer {
            position: absolute;
            top: ${viewport.y}px;
            left: ${viewport.x}px;
            width: ${viewport.width}px;
            height: ${viewport.height}px;
            background: #000;
            border-radius: ${viewport.r}px;
            overflow: hidden;
            z-index: 10;
            box-shadow: 0 0 0 1.5px #000;
          }
          .media {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .chassis {
            position: absolute;
            top: 50%;
            left: 50%;
            width: ${m.width}px;
            height: ${m.height}px;
            transform: translate(-50%, -50%) ${isLandscape ? 'rotate(-90deg)' : ''};
            pointer-events: none;
            z-index: 50;
          }
        </style>

        <div class="wrapper">
          <div class="stage">
            <div class="frame-target">
              <div class="rotate-container">
                <div class="screen-layer">
                  ${src ? `<img class="media" src="${src}" />` : ''}
                </div>
                <img class="chassis" src="${bodyUrl}" />
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Update scale after render
      requestAnimationFrame(() => this._updateScale());
      
      // We need to re-setup the observer target if innerHTML was changed
      this._setupObserver();
    }
  }

  if (!customElements.get('facet-frame')) {
    customElements.define('facet-frame', FacetFrame);
  }
})();
