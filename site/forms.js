//Trouxe todos os scripts e que estavam no HTML para o JS, assim o código fica mais limpo
//Aplica máscaras aos inputs quando o documento estiver pronto
$(document).ready(function(){
    $('#cpf').mask('000.000.000-00', {reverse: true});
    $('#telefone').mask('(00) 00000-0000');
    $('#cep').mask('00000-000');
});

document.getElementById('cep').addEventListener('blur', function () {
    buscarEnderecoPorCep(this.value);
});

document.getElementById('btnBuscarCep').addEventListener('click', function () {
    const cep = document.getElementById('cep').value;
    if(cep){
        buscarEnderecoPorCep(cep);
    }
});

document.getElementById('rgFile').addEventListener('change', function(e) {
    if (this.files.length > 0) document.getElementById('rgFileName').textContent = this.files[0].name;
});
document.getElementById('cpfFile').addEventListener('change', function(e) {
    if (this.files.length > 0) document.getElementById('cpfFileName').textContent = this.files[0].name;
});
document.getElementById('laudoFile').addEventListener('change', function(e) {
    if (this.files.length > 0) document.getElementById('laudoFileName').textContent = this.files[0].name;
});
document.getElementById('residenceProof').addEventListener('change', function(e) {
    if (this.files.length > 0) document.getElementById('residenceProofName').textContent = this.files[0].name;
});
document.getElementById('photo').addEventListener('change', function(e) {
    if (this.files.length > 0) document.getElementById('photoName').textContent = this.files[0].name;
});


//Função de busca de CEP
async function buscarEnderecoPorCep(cep) {
    cep = cep.replace(/\D/g, '');

    if (!cep || cep.length !== 8) {
        alert("CEP inválido. Use 8 dígitos numéricos.");
        return;
    }

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            alert("CEP não encontrado.");
            return;
        }
        
        document.getElementById('logradouro').value = dados.logradouro || '';
        document.getElementById('bairro').value = dados.bairro || '';
        document.getElementById('cidade').value = dados.localidade || '';
        document.getElementById('uf').value = dados.uf || '';

    } catch (erro) {
        alert("Erro ao buscar CEP.");
        console.error(erro);
    }
}

function validateSection(sectionNumber) {
    const section = document.getElementById(`section${sectionNumber}`);
    const inputs = section.querySelectorAll('[required]');
    let firstInvalidField = null;
    let isValid = true;

    section.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    for (const input of inputs) {
        let isFieldValid = true;

        if (input.type === 'radio') {
            const radioGroup = section.querySelectorAll(`input[name="${input.name}"]`);
            if (![...radioGroup].some(radio => radio.checked)) {
                isFieldValid = false;
                //Adiciona a classe de erro
                radioGroup.forEach(radio => radio.closest('.form-check').classList.add('is-invalid'));
            }
        } else if (input.type === 'file') {
            if (input.files.length === 0) {
                isFieldValid = false;
                //Adiciona a classe de erro na área de upload
                input.closest('.upload-area').classList.add('is-invalid');
            }
        } else {
            if (!input.value.trim()) {
                isFieldValid = false;
                input.classList.add('is-invalid');
            }
        }
        
        //Validação extra para emails
        if (input.id === 'confirmEmail' && input.value !== document.getElementById('email').value) {
            alert('Os e-mails não coincidem.');
            isFieldValid = false;
            input.classList.add('is-invalid');
            document.getElementById('email').classList.add('is-invalid');
        }

        if (!isFieldValid) {
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = input;
            }
        }
    }

    if (!isValid && firstInvalidField) {
        alert('Por favor, preencha todos os campos obrigatórios marcados em vermelho.');
        //Foca e rola a tela até o primeiro campo inválido
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return isValid;
}


//Funções de navegação
function nextSection(currentSection) {
    if (validateSection(currentSection)) {
        document.getElementById(`section${currentSection}`).classList.remove('active');
        document.getElementById(`section${currentSection + 1}`).classList.add('active');
        
        document.getElementById('form-progress').style.width = `${((currentSection + 1) / 3) * 100}%`;
        
        document.getElementById(`step${currentSection}-indicator`).classList.remove('active');
        document.getElementById(`step${currentSection}-indicator`).classList.add('completed');
        document.getElementById(`step${currentSection + 1}-indicator`).classList.add('active');
    }
}

function prevSection(currentSection) {
    document.getElementById(`section${currentSection}`).classList.remove('active');
    document.getElementById(`section${currentSection - 1}`).classList.add('active');
    
    document.getElementById('form-progress').style.width = `${((currentSection - 1) / 3) * 100}%`;
    
    document.getElementById(`step${currentSection}-indicator`).classList.remove('active');
    document.getElementById(`step${currentSection - 1}-indicator`).classList.add('active');
    document.getElementById(`step${currentSection - 1}-indicator`).classList.remove('completed');
}

//Submissão do formulário
document.getElementById('beneficiary-form').addEventListener('submit', function(e) {
    e.preventDefault();

    if (validateSection(1) && validateSection(2) && validateSection(3)) {
        alert('Cadastro enviado com sucesso!');
        this.reset();
        window.location.reload(); 
    } else {
        alert('Existem erros no formulário. Por favor, verifique todas as etapas.');
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


    //Tamanho da Fonte
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