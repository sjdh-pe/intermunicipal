import { api } from "../../services/api.js";

document.addEventListener('DOMContentLoaded', () => {
    // Limpa qualquer sessão anterior ao abrir a tela de login
    localStorage.removeItem('user_id'); 

    const loginForm = document.getElementById('login-form');

    // Máscaras
    if ($ && $.fn.mask) {
        $('.cpf-masck').mask('000.000.000-00');
        $('.date-mask').mask('00/00/0000');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cpfInput = document.getElementById('cpf');
            const dataInput = document.getElementById('datanasc');

            if (!loginForm.checkValidity()) {
                e.stopPropagation();
                loginForm.classList.add('was-validated');
                return;
            }

            const cpf = cpfInput.value;
            const dataDigitada = dataInput.value;

            // Converter Data
            const partes = dataDigitada.split('/');
            if (partes.length !== 3) {
                alert("Data incompleta.");
                return;
            }
            const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;

            try {
                // Busca na API
                const response = await api.get(`/beneficiarios?cpf=${cpf}&datanasc=${dataFormatada}`);
                const usuarios = response.data;

                if (usuarios.length > 0) {
                    const usuario = usuarios[0];
                    
                    // Em vez de mandar na URL, salvamos no navegador
                    localStorage.setItem('user_id', usuario.id);
                    localStorage.setItem('user_nome', usuario.nome); // Opcional, para boas vindas rápida
                    
                    console.log("Login salvo. Redirecionando...");
                    
                    // Redireciona SEM precisar do ?id=...
                    window.location.href = '../beneficiario/index.html';
                } else {
                    alert("Dados incorretos. Verifique CPF e Data de Nascimento.");
                }

            } catch (error) {
                console.error("Erro API:", error);
                alert("Erro ao conectar com o servidor.");
            }
        });
    }
});