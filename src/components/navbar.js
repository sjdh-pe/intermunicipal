class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `

            <link rel="icon" href="/assets/images/iconPELIVRE.png">
            <link rel="stylesheet" href="../styles/forms.css">
            <link rel="stylesheet" href="../../styles/forms.css">
            <link rel="stylesheet" href="../../styles/style.css">
            <style>
                .navbar-link:hover {
                    color: #2563eb;
                }
                .navbar-link:hover svg {
                    stroke: #2563eb;
                }
            </style>
            <nav class="bg-white shadow-sm">
                   <header>
                      <div class="header-top">
                        <div class="header-logo">
                          <img
                            src="/assets/images/logo-sjdh2.png"
                            alt="Logo Secretaria de Justiça, Direitos Humanos e Prevenção a Violência - Governo de Pernambuco"
                          />
                        </div>
                
                        <button id="mobile-menu-button" class="mobile-menu-button">
                          <span class="bar"></span>
                          <span class="bar"></span>
                          <span class="bar"></span>
                        </button>
                
                        <nav class="main-nav">
                          <a href="https://www.pe.gov.br/">PERNAMBUCO</a>
                          <a href="https://www.sjdh.pe.gov.br">SECRETARIA</a>
                          <a href="https://www.pe.gov.br/noticias">AÇÕES GOVERNO</a>
                          <a href="https://www.expressocidadao.pe.gov.br">EXPRESSO CIDADÃO</a>
                          <a href="https://www.sjdh.pe.gov.br/transparencia-2">TRANSPARÊNCIA</a>
                        </nav>
                      </div>
                   </header>
        </nav>
        `;
    }
}
 customElements.define('custom-navbar', CustomNavbar);
