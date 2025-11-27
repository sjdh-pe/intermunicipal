class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `

            <link rel="stylesheet" href="../styles/footer.css">
            <link rel="stylesheet" href="../../styles/footer.css">
            <style>
                .footer-link:hover {
                    color: #2563eb;
                }
            </style>
               <footer>
<!-- 
                  <div class="footer-top">
                    
                        <a href="" aria-label=" " ><img src="/assets/images/logo-sjdh2.png" alt="Logo do Governo de Pernambuco"></a>
                    <div class="footer-top-content">
                    
                    
                    <div>
                      <h4>Redes sociais</h4>
                      <a href="https://www.instagram.com/secdireitoshumanospe" target="_blank" aria-label="Link para o Instagram"
                        ><i class="fa fa-instagram" aria-hidden="true"></i
                      ></a>
                    </div>
                  </div>
-->            
                  <div class="footer-bottom">
                    <span>
                      <strong>Desenvolvido por: SUPTI - SJDH</strong>
                    </span>
                    <span>
                      © Copyright 2025.
<!--                      <a href="https://www.instagram.com/secdireitoshumanospe" aria-label="Link para o Instagram" target="_blank"><strong>SJDH</strong></a>-->
                    </span>
                  </div>
                </footer>
        `;
    }
}
customElements.define('custom-footer', CustomFooter);
