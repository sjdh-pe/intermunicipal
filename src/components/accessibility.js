class CustomAccessibility extends HTMLElement {
    constructor() {
        super();
        this.currentFontSize = 100;
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });

        // 1. INJETAR ESTILOS GLOBAIS NA PÁGINA
        if (!document.getElementById('acc-global-styles')) {
            const globalStyles = document.createElement('style');
            globalStyles.id = 'acc-global-styles';
            globalStyles.textContent = `
                body.acc-high-contrast { filter: contrast(150%) saturate(150%); }
                body.acc-monochrome { filter: grayscale(100%); }
                body.acc-light-contrast { filter: contrast(80%) brightness(110%); }
                
                body.acc-big-cursor, body.acc-big-cursor * { 
                    cursor: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJibGFjayIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBkPSJNNS41IDMuMjFsMTAuMDggMTAuMDgtNC4yIDEuNjMgMy45NyA2Ljg4LTIuNiAxLjUtMy45Ny02Ljg4LTIuOTIgMi45MlYzLjIxeiIvPjwvc3ZnPg=='), auto !important; 
                }
            `;
            document.head.appendChild(globalStyles);
        }

        // 2. ESTRUTURA VISUAL
        this.shadowRoot.innerHTML = `
        <style>
            :host { font-family: sans-serif; }

            /* Botão Flutuante */
            #accessibility-trigger {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                background: #0055ff;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                transition: transform 0.2s;
                /* Centralizar o ícone */
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
            }
            #accessibility-trigger:hover { transform: scale(1.1); }
            
            /* Ícone SVG ou Imagem dentro do botão */
            #accessibility-trigger svg, #accessibility-trigger img {
                width: 32px;
                height: 32px;
                fill: white; /* Cor do SVG */
            }

            /* Janela do Widget */
            #acc-widget {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 320px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 10000;
                overflow: hidden;
                transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s;
                opacity: 0;
                transform: translateY(20px);
                visibility: hidden;
            }

            #acc-widget.active {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
            }

            .acc-header {
                background: #0055ff;
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
            }
            .acc-header-text { display: flex; flex-direction: column; }
            .acc-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
            .acc-header h5 { margin: 2px 0 0 0; font-size: 11px; font-weight: 400; opacity: 0.9; }
            
            #acc-close { background: none; border: none; color: white; font-size: 28px; cursor: pointer; line-height: 1; }

            .acc-body { padding: 15px; background: #f8f9fa; }
            .acc-section-title { font-weight: bold; font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 10px; }
            
            .acc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
            .acc-card { 
                background: white; border-radius: 8px; padding: 12px; 
                text-align: center; border: 1px solid #eee; cursor: pointer; font-size: 13px;
                display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px;
                transition: 0.2s;
                user-select: none;
            }
            .acc-card:hover { border-color: #0055ff; background: #f0f5ff; }
            .acc-card.active-card { background: #0055ff; color: white; }

            .acc-controls { display: flex; align-items: center; gap: 10px; background: #eee; border-radius: 20px; padding: 2px 8px; color: #333; }
            .acc-controls button { border: none; background: #0055ff; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold; }

            .acc-icon { font-size: 20px; }

            #accessibility-trigger img {
            width: 55px; /* Tamanho da imagem */
            height: auto;
            object-fit: contain;
            }

            #accessibility-trigger {
            display: flex; /* Para centralizar */
            align-items: center;
            justify-content: center;
            }
        </style>

        <button id="accessibility-trigger" aria-label="Abrir opções de acessibilidade">
            <img src="/assets/images/iconacessibilidade.png">
        </button>

        <div id="acc-widget">
            <div class="acc-header">
                <div class="acc-header-text">
                    <h3>Acessibilidade</h3>
                    <h5>Desenvolvido por SUPTI - SJDH</h5>
                </div>
                <button id="acc-close" aria-label="Fechar">&times;</button>
            </div>

            <div class="acc-body">
                <p class="acc-section-title">Conteúdo</p>
                <div class="acc-grid">
                    <div class="acc-card" style="cursor: default;">
                        <span>Tamanho da Fonte</span>
                        <div class="acc-controls">
                            <button id="btn-font-minus">-</button>
                            <span id="font-size-label">100%</span>
                            <button id="btn-font-plus">+</button>
                        </div>
                    </div>
                    <div class="acc-card" id="btn-cursor">
                        <span>Cursor Grande</span>
                        <div class="acc-icon">↗️</div>
                    </div>
                </div>

                <p class="acc-section-title">Visual</p>
                <div class="acc-grid">
                    <div class="acc-card" id="btn-light">☀️ Contraste Claro</div>
                    <div class="acc-card" id="btn-high">🌓 Alto Contraste</div>
                    <div class="acc-card" id="btn-mono">🏁 Monocromático</div>
                    <div class="acc-card" id="btn-reset">🔄 Resetar Tudo</div>
                </div>
            </div>
        </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const sr = this.shadowRoot;
        const widget = sr.getElementById('acc-widget');
        const trigger = sr.getElementById('accessibility-trigger');
        const closeBtn = sr.getElementById('acc-close');

        // Toggle
        trigger.addEventListener('click', () => widget.classList.toggle('active'));
        closeBtn.addEventListener('click', () => widget.classList.remove('active'));

        // Fonte
        sr.getElementById('btn-font-plus').addEventListener('click', () => this.changeFontSize(10));
        sr.getElementById('btn-font-minus').addEventListener('click', () => this.changeFontSize(-10));

        // Cursor
        const btnCursor = sr.getElementById('btn-cursor');
        btnCursor.addEventListener('click', () => {
            document.body.classList.toggle('acc-big-cursor');
            btnCursor.classList.toggle('active-card');
        });

        // Contraste
        sr.getElementById('btn-light').addEventListener('click', () => this.setContrast('acc-light-contrast'));
        sr.getElementById('btn-high').addEventListener('click', () => this.setContrast('acc-high-contrast'));
        sr.getElementById('btn-mono').addEventListener('click', () => this.setContrast('acc-monochrome'));
        
        // Reset
        sr.getElementById('btn-reset').addEventListener('click', () => this.resetAll());
    }

    changeFontSize(delta) {
        if (this.currentFontSize + delta < 80 || this.currentFontSize + delta > 150) return;
        this.currentFontSize += delta;
        document.documentElement.style.fontSize = this.currentFontSize + '%';
        this.shadowRoot.getElementById('font-size-label').innerText = this.currentFontSize + '%';
    }

    setContrast(className) {
        document.body.classList.remove('acc-high-contrast', 'acc-monochrome', 'acc-light-contrast');
        document.body.classList.add(className);
    }

    resetAll() {
        document.body.classList.remove('acc-high-contrast', 'acc-monochrome', 'acc-light-contrast', 'acc-big-cursor');
        this.shadowRoot.getElementById('btn-cursor').classList.remove('active-card');
        this.currentFontSize = 100;
        document.documentElement.style.fontSize = '100%';
        this.shadowRoot.getElementById('font-size-label').innerText = '100%';
    }
}

customElements.define('custom-accessibility', CustomAccessibility);