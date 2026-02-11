class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/styles/style.css">
            
            <style>
                :host {
                    display: block;
                    width: 100%;
                    margin-top: auto;
                    font-family: 'Roboto', sans-serif;
                }

                footer {
                    background-color: #fff;
                    color: #000;
                    padding-top: 30px;
                    border-top: 1px solid #e5e7eb;
                }

                .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 30px;
                }

                /* --- ÍCONES SVG --- */
                /* Configuração global para os ícones funcionarem */
                svg {
                    width: 24px;
                    height: 24px;
                    fill: currentColor; /* Pega a cor do texto (azul) */
                    display: inline-block;
                    vertical-align: middle;
                }

                /* 1. Redes Sociais */
                .social-icons {
                    display: flex;
                    gap: 20px;
                }

                .social-icons a {
                    color: #2C67FF; /* Cor Azul dos ícones */
                    transition: transform 0.2s, color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .social-icons a:hover {
                    transform: scale(1.1);
                    color: #1a4bd6;
                }
                
                /* Tamanho específico para redes sociais */
                .social-icons svg {
                    width: 36px;
                    height: 36px;
                }

                /* Divisor */
                .divider {
                    width: 80%;
                    height: 1px;
                    background-color: #e5e7eb;
                    margin: 10px 0;
                }

                /* 2. Informações e Logo */
                .info-section {
                    width: 90%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 30px;
                    padding-bottom: 30px;
                }

                .logos-container {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .logos-container img {
                    height: 78px;
                    width: auto;
                }

                .contact-info {
                    text-align: left;
                    font-size: 0.9rem;
                    color: #2C67FF;
                    line-height: 1.8;
                }

                .contact-info div {
                    display: flex;
                    align-items: flex-start; /* Alinha no topo caso o texto quebre */
                    gap: 10px;
                    margin-bottom: 5px;
                }

                /* Ajuste dos ícones de contato */
                .contact-info svg {
                    width: 18px;
                    height: 18px;
                    margin-top: 4px; /* Pequeno ajuste vertical */
                    flex-shrink: 0; /* Impede o ícone de esmagar */
                }

                /* 3. Copyright */
                .copyright-bar {
                    background-color: #21409A;
                    color: white;
                    text-align: center;
                    padding: 15px 0;
                    font-size: 0.85rem;
                    width: 100%;
                }

                .copyright-bar a {
                    color: white;
                    text-decoration: underline;
                    font-weight: bold;
                }

                /* Responsividade */
                @media (max-width: 900px) {
                    .info-section {
                        flex-direction: column;
                        text-align: center;
                        gap: 20px;
                    }
                    
                    .contact-info {
                        display: flex;
                        flex-direction: column;
                    }

                    .logos-container {
                        justify-content: center;
                        flex-wrap: wrap;
                        text-align: center;
                    }
                    
                    .logos-container div {
                        text-align: center !important;
                        margin-right: 0 !important;
                        margin-bottom: 10px;
                        width: 100%;
                }
            </style>

            <footer>
                <div class="footer-container">
                    
                    <div class="social-icons">
                        <a href="https://www.instagram.com/secdireitoshumanospe" target="_blank" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.5 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
                        </a>
                        <a href="#" target="_blank" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>
                        </a>
                        <a href="#" target="_blank" aria-label="YouTube">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>
                        </a>
                    </div>

                    <div class="divider"></div>

                    <div class="info-section">
                        <div class="logos-container">
                             <div style="display:flex; flex-direction:column; align-items:flex-end; color:#555; font-size:0.7rem; text-align:right; margin-right:10px;">
                             </div>
                             
                             <img src="../../assets/images/logo-sjdh1.png" alt="Brasão Estado de Pernambuco"> 
                        </div>

                        <div class="contact-info">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
                                <span>Telefone: 81 98494 – 1749 | Fixo: 0800 281 9555 / 3182-76075</span>
                            </div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>
                                <span>Endereço: Rua do Bom Jesus Nº 94, Praça do Arsenal - Recife, CEP 50030-170</span>
                            </div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                                <span>Ouvidoria: 0800281 9555 | ouvidoria@sjdh.pe.gov.br</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="copyright-bar">
                    <a href="#">copyright© 2025 – SJDH Desenvolvido por SUPTI</a>
                </div>
            </footer>
        `;
    }
}
customElements.define('custom-footer', CustomFooter);