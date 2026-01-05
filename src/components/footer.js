class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../styles/style.css">
            <link rel="stylesheet" href="../../styles/style.css">
            
            <style>
                :host {
                    display: block;
                    width: 100%;
                    margin-top: auto;
                }

                footer {
                    background-color: #f3f3f3; /* Cor original */
                    color: #000;
                    padding: 20px 0;
                    font-family: 'Roboto', sans-serif;
                    border-top: 1px solid #e5e7eb;
                }

                .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                /* Parte Superior do Footer */
                .footer-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                }

                .footer-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .footer-info img {
                    height: 50px;
                    width: auto;
                }

                .footer-info div h4 {
                    margin: 0;
                    color: #21409A;
                    font-size: 1.1rem;
                }
                
                .footer-info div p {
                    margin: 5px 0 0;
                    font-size: 0.9rem;
                    color: #666;
                }

                .footer-social h4 {
                    margin: 0 0 10px;
                    font-size: 1rem;
                }

                .footer-social a {
                    color: #21409A;
                    text-decoration: none;
                    font-weight: bold;
                }

                /* Parte Inferior do Footer */
                .footer-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    color: #555;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .footer-bottom a {
                    color: #21409A;
                    text-decoration: none;
                }

                /* --- RESPONSIVIDADE --- */
                @media (max-width: 768px) {
                    .footer-top {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }

                    .footer-info {
                        flex-direction: column;
                    }

                    .footer-bottom {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            </style>

            <footer>
                <div class="footer-container">
                    <div class="footer-top">
                        <div class="footer-info">
                            <a href="#">
                                <img src="../../assets/images/logo-sjdh2.png" alt="Logo Governo de Pernambuco">
                            </a>
                            <div>
                                <h4>INTERMUNICIPAL</h4>
                                <p>Secretaria de Justiça e Direitos Humanos</p>
                            </div>
                        </div>

                        <div class="footer-social">
                            <h4>Redes Sociais</h4>
                            <a href="https://www.instagram.com/secdireitoshumanospe" target="_blank">
                                Instagram
                            </a>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <span>Desenvolvido por: <strong>SUPTI - SJDH</strong></span>
                        <span>© Copyright 2025. <strong>SJDH</strong></span>
                    </div>
                </div>
            </footer>
        `;
    }
}
customElements.define('custom-footer', CustomFooter);