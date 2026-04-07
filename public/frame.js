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

    static get observedAttributes() {
      return ['device', 'src', 'background', 'tilt', 'orientation', 'fit'];
    }

    attributeChangedCallback() {
      this.render();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      const deviceId = this.getAttribute('device') || 'iphone-17-pro-silver';
      const src = this.getAttribute('src') || null;
      const background = this.getAttribute('background') || '#000000';
      const tilt = parseFloat(this.getAttribute('tilt') || '0');
      const orientation = this.getAttribute('orientation') || 'portrait';
      const fit = this.getAttribute('fit') || 'cover';

      const mockup = MOCKUPS[deviceId] || MOCKUPS['iphone-17-pro-silver'];
      const { width, height, viewport: vp, frameId } = mockup;

      const isLandscape = orientation === 'landscape';
      const W = isLandscape ? height : width;
      const H = isLandscape ? width : height;

      const screenLeft = `${(vp.x / width) * 100}%`;
      const screenTop = `${(vp.y / height) * 100}%`;
      const screenWidth = `${(vp.width / width) * 100}%`;
      const screenHeight = `${(vp.height / height) * 100}%`;
      const radius = vp.borderRadius;

      const bodyUrl = `${BASE_URL}/${frameId}/body.png`;

      const perspectiveTransform = `perspective(1200px) rotateY(${tilt}deg)`;
      const landscapeTransform = isLandscape ? 'rotate(-90deg)' : '';

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            width: 100%;
            height: 100%;
          }
          .stage {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${background};
            box-sizing: border-box;
          }
          .device {
            position: relative;
            height: 100%;
            width: auto;
            aspect-ratio: ${W} / ${H};
            transform: ${perspectiveTransform};
          }
          .inner {
            position: absolute;
            inset: 0;
            transform: ${landscapeTransform};
            transform-origin: center center;
          }
          .screen-layer {
            position: absolute;
            top: ${screenTop};
            left: ${screenLeft};
            width: ${screenWidth};
            height: ${screenHeight};
            overflow: hidden;
            border-radius: ${radius}px;
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
