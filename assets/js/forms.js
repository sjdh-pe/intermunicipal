$(document).ready(function(){
    $('#cpf').mask('000.000.000-00');
    $('#birthdate').mask('00/00/0000');
});

// Seleciona o formulário de login
const loginForm = document.getElementById('login-form');

// Adiciona um evento de 'submit' ao formulário
loginForm.addEventListener('submit', function(event) {
    // Impede o comportamento padrão do formulário (que é recarregar a página)
    event.preventDefault();

    // Pega os valores dos campos de input
    const birthdate = document.getElementById('birthdate').value;
    const cpf = document.getElementById('cpf').value;

    //AUTENTICAÇÃO (API DE AUTENTICAÇÃO)
    if (cpf.trim() !== '' && birthdate.trim() !== '') {
        
        alert('Login bem-sucedido! Redirecionando...');
        window.location.href = 'forms2.html';

    } else {
        alert('Por favor, preencha todos os campos.');
    }
});

//Seleciona o botão e o menu de navegação
const menuButton = document.getElementById('mobile-menu-button');
const navMenu = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
   
    navMenu.classList.toggle('active');
});


//Contraste
document.addEventListener('DOMContentLoaded', () => {
    
    const contrastToggle = document.getElementById('contrast-toggle');
    const body = document.body;

    const applyContrast = () => {
        const isContrastEnabled = localStorage.getItem('highContrast') === 'enabled';
        if (isContrastEnabled) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
    };

    contrastToggle.addEventListener('click', () => {
        body.classList.toggle('high-contrast');
        if (body.classList.contains('high-contrast')) {
            localStorage.setItem('highContrast', 'enabled');
        } else {
            localStorage.setItem('highContrast', 'disabled');
        }
    });

    applyContrast();


    //Tamanho da fonte
    const fontIncrease = document.getElementById('font-increase');
    const fontDecrease = document.getElementById('font-decrease');
    const root = document.documentElement;

    let currentFontSize = 16;
    const minFontSize = 12;
    const maxFontSize = 22;
    const step = 2;

    const applyFontSize = (size) => {
        root.style.fontSize = `${size}px`;
        currentFontSize = size;
        localStorage.setItem('fontSize', size);
    };
    
    //Botão de aumentar fonte
    fontIncrease.addEventListener('click', () => {
        if (currentFontSize < maxFontSize) {
            applyFontSize(currentFontSize + step);
        }
    });

    //Botão de diminuir fonte
    fontDecrease.addEventListener('click', () => {
        if (currentFontSize > minFontSize) {
            applyFontSize(currentFontSize - step);
        }
    });
    
    //Tamanho da fonte salvo ao carregar a página
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        applyFontSize(parseInt(savedFontSize));
    }
});

//Botão Acessibilidade 
document.addEventListener('DOMContentLoaded', () => {

    const accessibilityMenu = document.querySelector('.accessibility-menu');
    const accessibilityToggle = document.getElementById('accessibility-toggle');

    accessibilityToggle.addEventListener('click', () => {
        accessibilityMenu.classList.toggle('active');
    });

    
    //Alto contraste
    const contrastToggle = document.getElementById('contrast-toggle');
    

    //Tamanho da fonte
    const fontIncrease = document.getElementById('font-increase');
});