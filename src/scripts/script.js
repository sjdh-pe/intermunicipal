//Seleciona o botão e o menu de navegação
const menuButton = document.getElementById('mobile-menu-button');
const navMenu = document.querySelector('.main-nav');

if (menuButton && navMenu) {
  menuButton.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}


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

    if (contrastToggle) {
      contrastToggle.addEventListener('click', () => {
          body.classList.toggle('high-contrast');
          if (body.classList.contains('high-contrast')) {
              localStorage.setItem('highContrast', 'enabled');
          } else {
              localStorage.setItem('highContrast', 'disabled');
          }
      });

      applyContrast();
    }


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
    if (fontIncrease) {
      fontIncrease.addEventListener('click', () => {
          if (currentFontSize < maxFontSize) {
              applyFontSize(currentFontSize + step);
          }
      });
    }

    //Botão de diminuir fonte
    if (fontDecrease) {
      fontDecrease.addEventListener('click', () => {
          if (currentFontSize > minFontSize) {
              applyFontSize(currentFontSize - step);
          }
      });
    }

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

    if (accessibilityToggle && accessibilityMenu) {
      accessibilityToggle.addEventListener('click', () => {
          accessibilityMenu.classList.toggle('active');
      });
    }


    //Alto contraste
    const contrastToggle = document.getElementById('contrast-toggle');

    //Tamanho da fonte
    const fontIncrease = document.getElementById('font-increase');
});
