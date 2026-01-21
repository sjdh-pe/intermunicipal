class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
<!--            <link rel="stylesheet" href="../styles/style.css">-->
            <link rel="stylesheet" href="../../styles/style.css">
            
            <style>
                /* Layout base do Header */
                header {
                    /* Cor de fundo definida no style.css, aqui garantimos layout */
                    width: 100%;
                    box-sizing: border-box;
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 5%; /* Alinhado com seu CSS original */
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .header-logo img {
                    height: 50px;
                    width: auto;
                    display: block;
                }

                /* Menu Desktop */
                .main-nav {
                    display: flex;
                    gap: 20px;
                }

                .main-nav a {
                    text-decoration: none;
                    color: #fff; /* Garante branco no fundo azul */
                    font-weight: bold;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    transition: opacity 0.3s;
                }

                .main-nav a:hover {
                    opacity: 0.8;
                }

                /* Botão Mobile (Hambúrguer) */
                .mobile-menu-button {
                    display: none; /* Escondido no desktop */
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    flex-direction: column;
                    gap: 5px;
                    padding: 5px;
                    z-index: 1001;
                }

                .bar {
                    width: 25px;
                    height: 3px;
                    background-color: #fff; /* Barras brancas para fundo azul */
                    border-radius: 2px;
                    transition: 0.3s;
                }

                /* --- RESPONSIVIDADE (Mobile) --- */
                @media (max-width: 900px) {
                    .header-top {
                        padding: 15px 20px;
                    }

                    .mobile-menu-button {
                        display: flex;
                    }

                    .main-nav {
                        display: none; /* Esconde menu padrão */
                        flex-direction: column;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 100%;
                        background-color: #21409A; /* Mesma cor do header */
                        padding: 20px 0;
                        z-index: 1000;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        border-top: 1px solid rgba(255,255,255,0.1);
                    }

                    /* Classe ativa pelo JS */
                    .main-nav.active {
                        display: flex;
                    }

                    .main-nav a {
                        padding: 15px;
                        text-align: center;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        width: 100%;
                        box-sizing: border-box;
                    }
                }
            </style>

            <header>
                <div class="header-top">
                    <div class="header-logo">
                        <a href="#">
                            <img src="../../assets/images/logo-sjdh2.png" 
                                 alt="Logo Secretaria de Justiça, Direitos Humanos e Prevenção a Violência">
                        </a>
                    </div>
            
                    <button id="mobile-menu-button" class="mobile-menu-button" aria-label="Menu">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </button>
            
                    <nav class="main-nav" id="main-nav">
                        <a href="https://www.pe.gov.br/">PERNAMBUCO</a>
                        <a href="https://www.sjdh.pe.gov.br">SECRETARIA</a>
                        <a href="https://www.pe.gov.br/noticias">AÇÕES GOVERNO</a>
                        <a href="https://www.expressocidadao.pe.gov.br">EXPRESSO CIDADÃO</a>
                        <a href="https://www.sjdh.pe.gov.br/transparencia-2">TRANSPARÊNCIA</a>
                    </nav>
                </div>
            </header>
        `;

        // Lógica do Menu Mobile
        const btnMobile = this.shadowRoot.getElementById('mobile-menu-button');
        const navList = this.shadowRoot.getElementById('main-nav');

        if(btnMobile && navList) {
            btnMobile.addEventListener('click', () => {
                navList.classList.toggle('active');
            });
        }
    }
}
customElements.define('custom-navbar', CustomNavbar);