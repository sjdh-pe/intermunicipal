// --- LÓGICA PRINCIPAL E EVENTOS GLOBAIS ---

// Aplica máscaras aos inputs quando o documento estiver pronto
$(document).ready(function(){
    $('#cpf').mask('000.000.000-00');
    $('#birthdate').mask('00/00/0000');
});

// Seleciona o formulário de login e adiciona o evento de submit
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const birthdate = document.getElementById('birthdate').value;
    const cpf = document.getElementById('cpf').value;

    // SIMULAÇÃO DE AUTENTICAÇÃO
    if (cpf.trim() !== '' && birthdate.trim() !== '') {
        alert('Login bem-sucedido! Redirecionando...');
        window.location.href = 'forms2.html'; // Página de destino
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});

// --- EVENT LISTENER UNIFICADO PARA ACESSIBILIDADE E OUTRAS FUNÇÕES ---
// Este bloco corrige o problema do menu que não abre
document.addEventListener('DOMContentLoaded', () => {

    // Lógica do menu mobile (se existir nesta página)
    const menuButton = document.getElementById('mobile-menu-button');
    const navMenu = document.querySelector('.main-nav');
    if (menuButton && navMenu) {
        menuButton.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Botão Acessibilidade Expansível
    const accessibilityMenu = document.querySelector('.accessibility-menu');
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    accessibilityToggle.addEventListener('click', () => {
        accessibilityMenu.classList.toggle('active');
    });

    // Lógica do Alto Contraste
    const contrastToggle = document.getElementById('contrast-toggle');
    const body = document.body;
    const applyContrast = () => {
        if (localStorage.getItem('highContrast') === 'enabled') {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
    };
    contrastToggle.addEventListener('click', () => {
        body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', body.classList.contains('high-contrast') ? 'enabled' : 'disabled');
    });
    applyContrast();

    // Lógica do Tamanho da Fonte
    const fontIncrease = document.getElementById('font-increase');
    const fontDecrease = document.getElementById('font-decrease');
    const root = document.documentElement;
    let currentFontSize = 16;
    const minFontSize = 12, maxFontSize = 22, step = 2;
    const applyFontSize = (size) => {
        root.style.fontSize = `${size}px`;
        currentFontSize = size;
        localStorage.setItem('fontSize', size);
    };
    fontIncrease.addEventListener('click', () => {
        if (currentFontSize < maxFontSize) applyFontSize(currentFontSize + step);
    });
    fontDecrease.addEventListener('click', () => {
        if (currentFontSize > minFontSize) applyFontSize(currentFontSize - step);
    });
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        applyFontSize(parseInt(savedFontSize));
    }
});