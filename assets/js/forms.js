$(document).ready(function(){
    $('#cpf').mask('000.000.000-00', {reverse: true});
    $('#telefone').mask('(00) 00000-0000');
    $('#cep').mask('00000-000');
});

// Lógica do menu mobile (hambúrguer)
const menuButton = document.getElementById('mobile-menu-button');
const navMenu = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Função de busca de CEP
async function buscarEnderecoPorCep(cep) {
    cep = cep.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
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

        // BUSCAR CIDADE AO COLOCAR O CEP ATRAVÉS DO SELECT

        // Pega o nome da cidade retornado pela API
        const nomeCidadeApi = dados.localidade; 
        
        // Pega o select da cidade
        const selectCidade = document.getElementById('CidadeBeneficiario'); 
        
        let cidadeEncontrada = false;
        
        // Procura a cidade dentro das  options 
        for (let i = 0; i < selectCidade.options.length; i++) {
            const option = selectCidade.options[i];
            
            // Aqui ele vai comparar um os textos da option (ignorando se ter maiúsculas ou minúsculas) com o nome da cidade da API de cep
            if (option.text.toUpperCase() === nomeCidadeApi.toUpperCase()) {
                
                selectCidade.value = option.value; 
                cidadeEncontrada = true;
                break; 
            }
        }
        
        // Aviso de não encontrada, como por exemplo o cep 000.000.000-00
        if (!cidadeEncontrada && nomeCidadeApi) {
            alert(`A cidade "${nomeCidadeApi}" retornada pelo CEP não foi encontrada na lista de opções. Por favor, selecione manualmente.`);
            selectCidade.value = "0"; // Volta para "Selecione"
        }
        document.getElementById('uf').value = dados.uf || '';
    } catch (erro) {
        alert("Erro ao buscar CEP.");
        console.error(erro);
    }
}

function nextSection(currentSection) {
    if (validateSection(currentSection)) {
        document.getElementById(`section${currentSection}`).classList.remove('active');
        document.getElementById(`section${currentSection + 1}`).classList.add('active');
        updateStepIndicator(currentSection, currentSection + 1);
        updateProgressBar(currentSection);
    }
}

function prevSection(currentSection) {
    document.getElementById(`section${currentSection}`).classList.remove('active');
    document.getElementById(`section${currentSection - 1}`).classList.add('active');
    updateStepIndicator(currentSection, currentSection - 1);
    updateProgressBar(currentSection - 2);
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
                radioGroup.forEach(radio => radio.closest('.form-check').classList.add('is-invalid'));
            }
        } else if (input.type === 'file') {
            if (input.id === 'photo' && !document.getElementById('croppedPhoto').value) {
                 isFieldValid = false;
                 input.closest('.upload-area').classList.add('is-invalid');
            } else if (input.id !== 'photo' && input.files.length === 0) {
                 isFieldValid = false;
                 input.closest('.upload-area').classList.add('is-invalid');
            }
        } else {
            if (!input.value.trim()) {
                isFieldValid = false;
                input.classList.add('is-invalid');
            }
        }
        if (input.id === 'confirmEmail' && input.value !== document.getElementById('email').value) {
            alert('Os e-mails não coincidem.');
            isFieldValid = false;
            input.classList.add('is-invalid');
            document.getElementById('email').classList.add('is-invalid');
        }
        if (!isFieldValid) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = input;
        }
    }
    if (!isValid && firstInvalidField) {
        alert('Por favor, preencha todos os campos obrigatórios marcados em vermelho.');
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return isValid;
}

function updateStepIndicator(current, next) {
    const currentIndicator = document.getElementById(`step${current}-indicator`);
    const nextIndicator = document.getElementById(`step${next}-indicator`);
    currentIndicator.classList.remove('active');
    if (next > current) {
        currentIndicator.classList.add('completed');
    } else {
        currentIndicator.classList.remove('completed');
    }
    nextIndicator.classList.add('active');
    nextIndicator.classList.remove('completed');
}
function updateProgressBar(currentSection) {
    const progress = ((currentSection) / 3) * 100;
    document.getElementById('form-progress').style.width = `${progress}%`;
}



document.addEventListener('DOMContentLoaded', () => {


    document.getElementById('btnBuscarCep').addEventListener('click', () => {
        const cep = document.getElementById('cep').value;
        if(cep) buscarEnderecoPorCep(cep);
    });
    document.getElementById('cep').addEventListener('blur', (e) => buscarEnderecoPorCep(e.target.value));

    document.querySelectorAll('input[type="file"]:not(#photo)').forEach(input => {
        input.addEventListener('change', function() {
            const fileNameDisplay = document.getElementById(`${this.id}Name`);
            if (fileNameDisplay) {
                fileNameDisplay.textContent = this.files.length > 0 ? this.files[0].name : '';
            }
        });
    });

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

    // Botões de acessibilidade
    const accessibilityMenu = document.querySelector('.accessibility-menu');
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    accessibilityToggle.addEventListener('click', () => {
        accessibilityMenu.classList.toggle('active');
    });

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
    if (savedFontSize) applyFontSize(parseInt(savedFontSize));

    
    // Aqui segue a função para o corte das foto 3x4
    const cropModalElement = document.getElementById('cropModal');
    if (cropModalElement) {
        const cropModal = new bootstrap.Modal(cropModalElement);
        const imageToCrop = document.getElementById('image-to-crop');
        const fileInput = document.getElementById('photo');
        const cropButton = document.getElementById('crop-button');
        
        const photoPreview = document.getElementById('photo-preview');
        const photoPreviewContainer = document.getElementById('photo-preview-container');
        const hiddenInput = document.getElementById('croppedPhoto');
        let cropper;

        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imageToCrop.src = event.target.result;
                    cropModal.show();
                };
                reader.readAsDataURL(files[0]);
            }
        });

        cropModalElement.addEventListener('shown.bs.modal', () => {
            if (cropper) cropper.destroy();
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 3 / 4,
                viewMode: 1,
                dragMode: 'move',
                background: false,
                autoCropArea: 0.9,
            });
        });

        cropModalElement.addEventListener('hidden.bs.modal', () => {
            if (cropper) cropper.destroy();
            cropper = null;
            fileInput.value = '';
        });

        cropButton.addEventListener('click', () => {
            if (cropper) {
                const canvas = cropper.getCroppedCanvas({ width: 300, height: 400 });
                const croppedImageDataURL = canvas.toDataURL('image/jpeg');
                photoPreview.src = croppedImageDataURL;
                photoPreviewContainer.style.display = 'block';
                hiddenInput.value = croppedImageDataURL;
                cropModal.hide();
            }
        });
    }
});