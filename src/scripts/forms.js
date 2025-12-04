$(document).ready(function(){
    $('#cpf').mask('000.000.000-00', {reverse: true});
    $('#telefone').mask('(00) 00000-0000');
    $('#cep').mask('00000-000');
});

// Lógica do menu mobile (hambúrguer)
const menuButton = document.getElementById('mobile-menu-button');
const navMenu = document.querySelector('.main-nav');
if (menuButton) {
  menuButton.addEventListener('click', () => {
      navMenu.classList.toggle('active');
  });
}

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
            validarCampo(document.getElementById("cep"),"Erro ao buscar CEP.");
            return;
        }
        document.getElementById('logradouro').value = dados.logradouro || '';
        document.getElementById('bairro').value = dados.bairro || '';

        const nomeCidadeApi = dados.localidade;
        const selectCidade = document.getElementById('cidade');
        let cidadeEncontrada = false;
        for (let i = 0; i < selectCidade.options.length; i++) {
            const option = selectCidade.options[i];
            if (option.text.toUpperCase() === nomeCidadeApi.toUpperCase()) {
                selectCidade.value = option.value;
                cidadeEncontrada = true;
                break;
            }
        }
        if (!cidadeEncontrada && nomeCidadeApi) {
            alert(`A cidade "${nomeCidadeApi}" retornada pelo CEP não foi encontrada na lista de opções. Por favor, selecione manualmente.`);
            selectCidade.value = "0";
        }
        document.getElementById('uf').value = dados.uf || '';
    } catch (erro) {
        validarCampo(document.getElementById("uf"),"Erro ao buscar CEP.");
    }
}


function getBoolFromRadio(name, yesValue = 'sim'){
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) return null;
    return (checked.value || '').toLowerCase() === yesValue;
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

// Expose to global scope for HTML onclick handlers
window.nextSection = nextSection;
window.prevSection = prevSection;

// Utilidades de normalização e validação
const onlyDigits = (v) => (v || '').replace(/\D+/g, '');
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
const isValidCEP = (v) => /^\d{5}-?\d{3}$/.test(v || '');
const isValidUF = (v) => /^[A-Z]{2}$/.test((v || '').toUpperCase());
const isValidDateISO = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
const isPastDate = (v) => {
    // v em formato YYYY-MM-DD
    const d = new Date(v + 'T00:00:00');
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    // Zera horário para comparar somente a data
    today.setHours(0, 0, 0, 0);
    return d < today;
}


let p = {};
let endereco = {};
function validateSection(sectionNumber) {

    // Dados Pessoais
    let erros = [];

    console.log(p);
    console.log(endereco);

    const section = document.getElementById(`section${sectionNumber}`);
    section.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    if(sectionNumber === 1) {


        p.nome = document.getElementById('fullName').value.trim();
        if (!p.nome || p.nome < 3){
            erros.push('Nome é obrigatório.');
            validarCampo(document.getElementById("fullName"), {valueMissing:erros[0].toString()});
            document.getElementById("fullName").focus();
            return false;
        }

        const cpfRaw = document.getElementById('cpf').value.trim();
        p.cpf = onlyDigits(cpfRaw);
        if (!p.cpf || p.cpf.length !== 11){
            erros.push('CPF é obrigatório.');
            validarCampo(document.getElementById('cpf'),
                {valueMissing: "Informe o CPF.",
                                 patternMismatch: "CPF inválido."});

            document.getElementById('cpf').focus();
            return false;
        }

        p.dataNascimento = document.getElementById('birthDate').value; // já é YYYY-MM-DD
        if (!p.dataNascimento || !isValidDateISO(p.dataNascimento)){
            erros.push('Data de nascimento inválida.');
            validarCampo(document.getElementById('birthDate'), {valueMissing:erros[0].toString()});
            document.getElementById('birthDate').focus();

            return false;
        }
        else if (!isPastDate(p.dataNascimento)){
            erros.push('Data de nascimento deve ser uma data passada.');
            validarCampo(document.getElementById('birthDate'), {valueMissing:erros[0].toString()});
            document.getElementById('birthDate').focus();
            return false;
        }

        p.nomeMae = document.getElementById('nomeMae').value.trim();
        if (!p.nomeMae || p.nomeMae.length < 3){
            erros.push('Nome da mãe é obrigatório e deve ter ao menos 3 caracteres.');
            validarCampo(document.getElementById('nomeMae'), {valueMissing:erros[0].toString()});
            document.getElementById('nomeMae').focus();
            return false;
        }
        p.rg = document.getElementById('rg').value.trim();
        if (!p.rg || p.rg.length > 20) {
            erros.push('RG é obrigatório e deve ter no máximo.');
            validarCampo(document.getElementById('rg'), {valueMissing:erros[0].toString()});
            document.getElementById('rg').focus();
            return false;
        }
        // Selects (IDs numéricos)
        p.tipoDeficienciaId = Number(document.getElementById('deficiencia').value);
        if (!Number.isInteger(p.tipoDeficienciaId) || p.tipoDeficienciaId <= 0){
            erros.push('Selecione um tipo de deficiência válido.');
            validarCampo(document.getElementById('deficiencia'), {valueMissing:erros[0].toString()});
            document.getElementById('deficiencia').focus();
            return false;
        }
        p.sexoId = Number(document.getElementById('genero').value);
        if (!Number.isInteger(p.sexoId) || p.sexoId <= 0){
            erros.push('Selecione um gênero válido.');
            validarCampo(document.getElementById('genero'), {valueMissing:erros[0].toString()});
            document.getElementById('genero').focus();
            return false;
        }
        p.etniaId = Number(document.getElementById('etnia').value);
        if (!Number.isInteger(p.etniaId) || p.etniaId <= 0){
            erros.push('Selecione uma etnia válida.');
            validarCampo(document.getElementById('etnia'), {valueMissing:erros[0].toString()});
            document.getElementById('etnia').focus();
            return false;
        }

        p.vemLivreAcessoRmr = getBoolFromRadio('vemLivreRm');
        if (p.vemLivreAcessoRmr === null){
            erros.push('Informe se possui VEM Livre Acesso RMR.');
            validarCampo(document.getElementById('vemLivreRm'), {valueMissing:erros[0].toString()});
            document.getElementById('vemLivreRm').focus();
            return false;
        }

        p.vemLivreAcessoRmr = getBoolFromRadio('vemLivreRm');

        if (erros.length > 0) return false;

    }


    // section 2
    if (sectionNumber === 2){

        p.email = document.getElementById('email').value.trim();
        if (!p.email || !isValidEmail(p.email)){
            erros.push('E-mail inválido.');
            validarCampo(document.getElementById('email'), {valueMissing:erros[0].toString()});
            document.getElementById('email').focus();
            return false;
        }


        p.confirmEmail = document.getElementById('confirmEmail').value.trim();
        if (p.confirmEmail && p.email && p.confirmEmail !== p.email){
            erros.push('Confirmação de e-mail não confere.');
            validarCampo(document.getElementById('confirmEmail'), {valueMissing:erros[0].toString()});
            document.getElementById('confirmEmail').focus();
            return false;
        }

        p.telefone = onlyDigits(document.getElementById('telefone').value);
        if (!p.telefone || p.telefone.length < 8 || p.telefone.length > 15) {
            erros.push('Telefone deve conter entre 8 e 15 dígitos.');
            validarCampo(document.getElementById('telefone'), {valueMissing:erros[0].toString()});
            document.getElementById('telefone').focus();
            return false;
        }
        if (erros.length > 0) return false;

        // Endereço
        const cepInput = (document.getElementById('cep').value || '').trim();
        endereco.cep = cepInput.replace(/(\d{5})(\d{3})/, '$1-$2');
        if (!endereco.cep || !isValidCEP(endereco.cep)){
            erros.push('CEP inválido.');
            validarCampo(document.getElementById('cep'), {valueMissing:erros[0].toString()});
            document.getElementById('cep').focus();
            return false;
        }

         endereco.logradouro = document.getElementById('logradouro').value.trim();
        if (!endereco.logradouro){
            erros.push('Endereço (Rua, Av., Logradouro) é obrigatório.');
            validarCampo(document.getElementById('logradouro'), {valueMissing:erros[0].toString()});
            document.getElementById('logradouro').focus();
            return false;
        }

        endereco.numero = document.getElementById('numero').value.trim();

        endereco.bairro = document.getElementById('bairro').value.trim();
        if (!endereco.bairro){
            erros.push('Bairro é obrigatório.');
            validarCampo(document.getElementById('bairro'), {valueMissing:erros[0].toString()});
            document.getElementById('bairro').focus();
            return false;
        }

        endereco.cidadeId = Number(document.getElementById('cidade').value || 0);
        if (!Number.isInteger(endereco.cidadeId) || endereco.cidadeId <= 0){
            erros.push('Selecione uma cidade válida.');
            validarCampo(document.getElementById('cidade'), {valueMissing:erros[0].toString()});
            document.getElementById('cidade').focus();
            return false;
        }
        endereco.uf = (document.getElementById('uf')?.value || '').toUpperCase();
        if (!endereco.uf || !isValidUF(endereco.uf)){
            erros.push('UF inválida (2 letras).');
            validarCampo(document.getElementById('uf'), {valueMissing:erros[0].toString()});
            document.getElementById('uf').focus();
            return false;
        }


        p.localRetiradaId = Number(document.getElementById('localRetirada')?.value || 0);
        if (!Number.isInteger(p.localRetiradaId) || p.localRetiradaId <= 0){
            erros.push('Selecione o local de retirada.');
            validarCampo(document.getElementById('localRetirada'), {valueMissing:erros[0].toString()});
            document.getElementById('localRetirada').focus();
            return false;
        }

        p.statusBeneficioId = 1;


        return false;
    }

    return true;
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
    document.getElementById('beneficiary-form')
        .addEventListener('submit', async function (e) {

            e.preventDefault();
            e.stopPropagation();

            const sec1 = validateSection(1);
            const sec2 = validateSection(2);
            //const sec3 = validateSection(3);

            if (sec1 && sec2) {
                await enviarDados();
                console.log(idBeneficiario);
            } else {
                alert('Existem erros no formulário. Por favor, verifique todas as etapas.');
            }
        });



    // Utilitários da pagína
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

function validarCampo(campo, mensagemsCustom = {}) {

    // encontrar container que tenha invalid-feedback
    const container = campo.closest('.mb-3')
        || campo.parentElement
        || document; // fallback seguro

    const feedback = container.querySelector('.invalid-feedback');

    // Se NÃO achar o feedback → não quebra o script
    if (!feedback) {
        console.warn(`⚠️ Nenhum .invalid-feedback encontrado para #${campo.id}`);
    }

    // limpa erros anteriores
    campo.classList.remove("is-invalid");
    if (feedback) feedback.textContent = "";


    // se válido → nada a fazer
    if (campo.checkValidity()) {
        return true;
    }

    // pega o tipo de erro encontrado
    const validity = campo.validity;

    let mensagem = "Campo inválido."; // padrão

    if (validity.valueMissing) {
        mensagem = mensagemsCustom.valueMissing || "Este campo é obrigatório.";
    }
    else if (validity.patternMismatch) {
        mensagem = mensagemsCustom.patternMismatch || "Formato inválido.";
    }
    else if (validity.tooShort) {
        mensagem = mensagemsCustom.tooShort || `Mínimo de ${campo.minLength} caracteres.`;
    }
    else if (validity.tooLong) {
        mensagem = mensagemsCustom.tooLong || `Máximo de ${campo.maxLength} caracteres.`;
    }
    else if (validity.typeMismatch) {
        mensagem = mensagemsCustom.typeMismatch || "Valor inválido.";
    }

    // aplica erro
    campo.classList.add("is-invalid");
    feedback.textContent = mensagem;

    return false;
}