import { api } from "../../services/api.js";
import Swal from "https://esm.sh/sweetalert2@11";

document.addEventListener('DOMContentLoaded', () => {
    // Limpa qualquer sessão anterior ao abrir a tela de login
    localStorage.removeItem('user_id'); 

    const loginForm = document.getElementById('login-form');


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

            const cpf = cpfInput.value.replace(/\D/g, '');
            const dataDigitada = dataInput.value;

            // Converter Data (DD/MM/AAAA -> AAAA-MM-DD para a API)
            const partes = dataDigitada.split('/');
            if (partes.length !== 3) {
                // alert("Data incompleta.");
                Swal.fire({
                    title: 'Data incompleta',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }
            const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;

            console.log('Data selecionada:', dataFormatada);
            console.log('CPF:', cpf);
            try {
                // Busca na API
                const response = await api.get(`/beneficiarios/cpf/${cpf}/${dataFormatada}`);
                console.log('API Response:', response.data);
                const usuario = response.data;

                if (usuario) {

                    window.location.href = `../beneficiario/?cpf=${cpf}&datanasc=${dataFormatada}`;

                } else {
                    // alert("Dados incorretos. Verifique CPF e Data de Nascimento.");
                    Swal.fire({
                        title: 'Dados incorretos',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }

            } catch (error) {
                console.error("Erro API:", error);
                // alert("Erro ao conectar com o servidor.");
                Swal.fire({
                    title: 'Erro ao conectar com o servidor',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    }
});