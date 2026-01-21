class GlobalLoader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: none;
                }

                .backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                }

                .content {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    color: #fff;
                    font-size: 1rem;
                }
            </style>

            <div class="backdrop"></div>
            <div class="content">
                <div class="spinner-border" role="status"></div>
                <span class="mt-2">Carregando...</span>
            </div>
        `;
    }

    show() {
        this.style.display = "block";
    }

    hide() {
        this.style.display = "none";
    }
}

customElements.define("global-loader", GlobalLoader);