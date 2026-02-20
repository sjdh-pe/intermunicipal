import { api } from "../../services/api.js";

document.addEventListener('DOMContentLoaded', () => {
    // Limpa qualquer sessão anterior ao abrir a tela de login
    localStorage.removeItem('user_id'); 

    const loginForm = document.getElementById('login-form');

    // Máscaras
    if ($ && $.fn.mask) {
        $('.cpf-masck').mask('00000000000');
        $('.date-mask').mask('00/00/0000');
    }

    const togglePassword = document.querySelector('#togglePassword');
    const dataInput = document.querySelector('#datanasc');
    
    if (togglePassword && dataInput) {
        const icon = togglePassword.querySelector('i');
        togglePassword.addEventListener('click', function () {
            const type = dataInput.getAttribute('type') === 'password' ? 'text' : 'password';
            dataInput.setAttribute('type', type);
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }


    const btnCalendar = document.getElementById('btn-open-calendar');
    const hiddenDatePicker = document.getElementById('hidden-date-picker');

    if (btnCalendar && hiddenDatePicker) {
        // Ao clicar no ícone do calendário, abre o calendário do input escondido
        btnCalendar.addEventListener('click', () => {
            if ('showPicker' in hiddenDatePicker) {
                try {
                    hiddenDatePicker.showPicker();
                } catch (error) {
                    hiddenDatePicker.focus();
                }
            } else {
                hiddenDatePicker.focus();
            }
        });

        // Quando o usuário seleciona uma data no calendário...
        hiddenDatePicker.addEventListener('change', function() {
            if (this.value) {
                // A data vem no formato AAAA-MM-DD. Precisamos converter para DD/MM/AAAA
                const partes = this.value.split('-');
                if (partes.length === 3) {
                    dataInput.value = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cpfInput = document.getElementById('cpf');

            if (!loginForm.checkValidity()) {
                e.stopPropagation();
                loginForm.classList.add('was-validated');
                return;
            }

            const cpf = cpfInput.value;
            const dataDigitada = dataInput.value;

            // Converter Data (DD/MM/AAAA -> AAAA-MM-DD para a API)
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
                    
                    // Salvamos no navegador
                    localStorage.setItem('user_id', usuario.id);
                    localStorage.setItem('user_nome', usuario.nome); 
                    
                    console.log("Login salvo. Redirecionando...");
                    
                    // Redireciona
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