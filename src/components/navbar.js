class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@500&display=swap');

            /* Header */
            header {
                width: 100%;
                background: linear-gradient(to right, #21409A, #2C67FF);
                box-sizing: border-box;
                position: relative; /* ESSENCIAL PARA O MENU MOBILE FUNCIONAR */
                z-index: 1000; /* Garante que o menu fique acima do conteúdo da página */
            }

            .header-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 22px 5%;
                max-width: 1200px;
                margin: 0 auto;
            }

            /* Logo */
            .header-logo img {
                height: 62px;
                width: auto;
                display: block;
            }

            /* Desktop Nav */
            .main-nav {
                display: flex;
                gap: 20px;
            }

            .main-nav a {
                font-family: 'Open Sans', sans-serif;
                font-size: 15px;
                font-weight: 600;
                color: #ffffff;
                text-decoration: none;
                text-transform: capitalize;
                letter-spacing: 0.5px;
                transition: opacity 0.3s ease;
            }

            .main-nav a:hover {
                opacity: 0.8;
            }

            /* Botão Hamburguer Mobile */
            .mobile-menu-button {
                display: none;
                background: transparent;
                border: none;
                cursor: pointer;
                flex-direction: column;
                gap: 5px;
                padding: 5px;
                z-index: 1001; /* Fica acima do menu aberto */
            }

            .bar {
                width: 25px;
                height: 3px;
                background-color: #ffffff;
                border-radius: 2px;
                transition: all 0.3s ease; /* Transição suave para a animação */
            }

            /* Responsividade (Mobile) */
            @media (max-width: 900px) {
                .mobile-menu-button {
                    display: flex;
                }

                .main-nav {
                    display: none;
                    flex-direction: column;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: linear-gradient(to right, #21409A, #2C67FF);
                    padding: 0;
                    box-shadow: 0px 4px 10px rgba(0,0,0,0.1); /* Sombra para destacar o menu */
                }

                /* Estado Ativo do Menu */
                .main-nav.active {
                    display: flex;
                    animation: slideDown 0.3s ease-out; /* Animação de descida */
                }

                .main-nav a {
                    padding: 15px 5%;
                    text-align: left;
                    font-size: 16px; /* Aumentei a fonte para toque no mobile */
                    border-top: 1px solid rgba(255, 255, 255, 0.1); /* Linha divisória */
                }

                /* Animação do Ícone (Vira um X) */
                .mobile-menu-button.active .bar:nth-child(1) {
                    transform: translateY(8px) rotate(45deg);
                }
                .mobile-menu-button.active .bar:nth-child(2) {
                    opacity: 0;
                }
                .mobile-menu-button.active .bar:nth-child(3) {
                    transform: translateY(-8px) rotate(-45deg);
                }
            }

            /* Keyframe para animação de descida */
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>

        <header>
            <div class="header-top">
                <div class="header-logo">
                    <a href="#">
                        <img src="../../assets/images/logo-sjdh2.png"
                             alt="Secretaria de Justiça, Direitos Humanos e Prevenção à Violência">
                    </a>
                </div>

                <button id="mobile-menu-button" class="mobile-menu-button" aria-label="Menu">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>

                <nav class="main-nav" id="main-nav">
                    <a href="https://www.pe.gov.br/">Pernambuco</a>
                    <a href="https://www.sjdh.pe.gov.br">Secretaria</a>
                    <a href="https://www.pe.gov.br/noticias">Ações governo</a>
                    <a href="https://www.expressocidadao.pe.gov.br">Expresso cidadão</a>
                    <a href="https://www.sjdh.pe.gov.br/transparencia-2">Transparência</a>
                </nav>
            </div>
        </header>
        `;

        const btnMobile = this.shadowRoot.getElementById('mobile-menu-button');
        const navList = this.shadowRoot.getElementById('main-nav');

        // Lógica do clique
        btnMobile.addEventListener('click', () => {
            navList.classList.toggle('active'); // Mostra/esconde o menu
            btnMobile.classList.toggle('active'); // Faz a animação do ícone 'X'
        });

        // Opcional: Fechar o menu ao clicar em um link
        const links = this.shadowRoot.querySelectorAll('.main-nav a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                btnMobile.classList.remove('active');
            });
        });
    }
}

customElements.define('custom-navbar', CustomNavbar);