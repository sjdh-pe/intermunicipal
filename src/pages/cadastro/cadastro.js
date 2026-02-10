
import {
    cadastrarBeneficiario,
    cadastrarResponsavelBeneficiario, validarArquivo, uploadArquivoBeneficiario
} from "../../services/beneficiariosService.js";

// Estado do beneficiário deve iniciar nulo para permitir a checagem correta
let beneficiario = null;
let responsavel = {};
let p = {};
let endereco = {};
let croppedFile = null;

// Lógica do menu mobile (hambúrguer)
const menuButton = document.getElementById('mobile-menu-button');
const navMenu = document.querySelector('.main-nav');



document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('responsavel').addEventListener('change', (e) => {
        if (e.target.checked) {
            document.getElementById('divResponsavel').style.display = 'block';
            document.getElementById('divFilesResponsavel').style.display = 'block';
        } else {
            document.getElementById('divResponsavel').style.display = 'none';
            document.getElementById('divFilesResponsavel').style.display = 'none';
        }
    });
});


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

const isMinor = (birthDate) => {
    // birthDate em formato YYYY-MM-DD
    const d = new Date(birthDate + 'T00:00:00');
    if (isNaN(d.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    const dayDiff = today.getDate() - d.getDate();

    // Ajusta a idade se ainda não fez aniversário no ano atual
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age < 18;
};


function validateSection(sectionNumber) {

    let erros = [];

    const section = document.getElementById(`section${sectionNumber}`);
    section.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    // section 1
    if(sectionNumber === 1) {


        p.nome = document.getElementById('fullName').value.trim();
        if (!p.nome || p.nome.length < 3){
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
        if (isMinor(p.dataNascimento)){
            if(!document.getElementById('responsavel').checked){
                erros.push('Beneficiário menor de idade. É obrigatório o preenchimento dos dados do responsável.');
                validarCampo(document.getElementById('responsavel'), {valueMissing:erros[0].toString()});
                document.getElementById('responsavel').checked = true;
                document.getElementById('divResponsavel').style.display = 'block';
                document.getElementById('divFilesResponsavel').style.display = 'block';
                return false;
            }

        }

        p.nomeMae = document.getElementById('nomeMae').value.trim();
        if (!p.nomeMae || p.nomeMae.length < 3){
            erros.push('Nome da mãe é obrigatório e deve ter ao menos 3 caracteres.');
            validarCampo(document.getElementById('nomeMae'), {valueMissing:erros[0].toString()});
            document.getElementById('nomeMae').focus();
            return false;
        }
        p.rg = document.getElementById('rg').value.trim();

        responsavel.sim = document.getElementById('responsavel').checked;
        if (responsavel.sim) {

            responsavel.nomeResponsavel = document.getElementById('nomeResponsavel').value.trim();
            if (!responsavel.nomeResponsavel || responsavel.nomeResponsavel.length < 3){
                erros.push('Nome do Responsavél é obrigatório e deve ter ao menos 3 caracteres.');
                validarCampo(document.getElementById('nomeResponsavel'), {valueMissing:erros[0].toString()});
                document.getElementById('nomeResponsavel').focus();
                return false;
            }
            const cpfRawRes = document.getElementById('cpfResponsavel').value.trim();
            responsavel.cpf = onlyDigits(cpfRawRes);
            if(!responsavel.cpf || responsavel.cpf.length !== 11){
                erros.push('CPF é obrigatório.');
                validarCampo(document.getElementById('cpfResponsavel'),
                    {valueMissing: "Informe o CPF do Responsavél.",
                        patternMismatch: "CPF inválido do Responsavél."});

                document.getElementById('cpfResponsavel').focus();
                return false;
            }
            if(responsavel.cpf === p.cpf){
                erros.push('CPF do Responsavél não pode ser igual ao do Beneficiário.');
                validarCampo(document.getElementById('cpfResponsavel'),
                    {valueMissing: erros[0].toString()});

                document.getElementById('cpfResponsavel').focus();
                return false;
            }
            responsavel.rg = document.getElementById('rgResponsavel').value.trim();
            if (!responsavel.rg || responsavel.rg.length > 20) {
                erros.push('RG é obrigatório  do Responsavél.');
                validarCampo(document.getElementById('rgResponsavel'), {valueMissing:erros[0].toString()});
                document.getElementById('rgResponsavel').focus();
                return false;
            }

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

        const confirmEmail = document.getElementById('confirmEmail').value.trim();
        if (confirmEmail && p.email && confirmEmail !== p.email){
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
        endereco.complemento = document.getElementById('complemento').value.trim();

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


        return true;
    }

    // section 3
    if (sectionNumber === 3) {


        //     rgFile , cpfFile , comprovanteResidenciaFile , laudoDeficienciaFile , croppedPhoto
        let message = validarArquivo(document.getElementById('rgFile').files[0],
            5,
            ['application/pdf', 'image/jpeg', 'image/png'],
            ['pdf', 'jpg', 'jpeg', 'png']);
        if (message) {
            alert("RG: "+message);
            return false;
        }

        const cpfFileMessage = validarArquivo(document.getElementById('cpfFile').files[0],
            5,
            ['application/pdf', 'image/jpeg', 'image/png'],
            ['pdf', 'jpg', 'jpeg', 'png']);
        if (cpfFileMessage) {
            alert("CPF: "+cpfFileMessage);
            return false;
        }

        const laudoMessage = validarArquivo(document.getElementById('laudoFile').files[0],
            5,
            ['application/pdf', 'image/jpeg', 'image/png'],
            ['pdf', 'jpg', 'jpeg', 'png']);
        if (laudoMessage) {
            alert("Laudo Médico: "+laudoMessage);
            return false;
        }

        const CRFmessage = validarArquivo(document.getElementById('residenceProof').files[0],
            5,
            ['application/pdf', 'image/jpeg', 'image/png'],
            ['pdf', 'jpg', 'jpeg', 'png']);
        if (CRFmessage) {
            alert("Comprovante de Residência: "+CRFmessage);
            return false;
        }



        const fotoMessage = validarFoto();
        if (fotoMessage) {
            alert("Foto 3x4: "+fotoMessage);
            return false;
        }

        if(document.getElementById('responsavel').checked) {
            const rgFileResponsavelMessage = validarArquivo(document.getElementById('rgFileResponsavel').files[0],
                5,
                ['application/pdf', 'image/jpeg', 'image/png'],
                ['pdf', 'jpg', 'jpeg', 'png']);
            if (rgFileResponsavelMessage) {
                alert("RG do Responsável: " + rgFileResponsavelMessage);
                return false;
            }

            const cpfFileResponsavelMessage = validarArquivo(document.getElementById('cpfFileResponsavel').files[0],
                5,
                ['application/pdf', 'image/jpeg', 'image/png'],
                ['pdf', 'jpg', 'jpeg', 'png']);
            if (cpfFileResponsavelMessage) {
                alert("CPF do Responsável: " + cpfFileResponsavelMessage);
                return false;
            }
        }



        return true;
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

    // ATUALIZAÇÃO: ÍCONE VERDE AO ANEXAR
    document.querySelectorAll('input[type="file"]:not(#photo)').forEach(input => {
        input.addEventListener('change', function() {
            const fileNameDisplay = document.getElementById(`${this.id}Name`);
            if (fileNameDisplay) {
                if (this.files.length > 0) {
                    // Adiciona o ícone de Check Verde + Nome do Arquivo
                    fileNameDisplay.innerHTML = `
                        <div class="d-flex align-items-center text-success border border-success bg-light p-2 rounded">
                            <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                            <span>${this.files[0].name}</span>
                        </div>
                    `;
                } else {
                    fileNameDisplay.innerHTML = '';
                }
            }
        });
    });

    // form-beneficiary-documents
    document.getElementById('beneficiary-form')
        .addEventListener('submit', async function (e) {

            e.preventDefault();
            e.stopPropagation();

            const sec1 = validateSection(1);
             const sec2 = validateSection(2);

            if (sec1 && sec2) {
                const payload = {
                    nome: p.nome,
                    cpf: p.cpf,
                    dataNascimento: p.dataNascimento,
                    nomeMae: p.nomeMae,
                    rg: p.rg,
                    responsavelId: null,
                    tipoDeficienciaId: p.tipoDeficienciaId,
                    sexoId: p.sexoId,
                    etniaId: p.etniaId,
                    email: p.email,
                    telefone: p.telefone,
                    cidadeId: endereco.cidadeId,
                    localRetiradaId: p.localRetiradaId,
                    statusBeneficioId: p.statusBeneficioId,
                    vemLivreAcessoRmr: false,
                    endereco: {
                        cep: endereco.cep,
                        endereco: endereco.logradouro,
                        numero: endereco.numero,
                        complemento: endereco.complemento,
                        bairro: endereco.bairro,
                        cidadeId: endereco.cidadeId,
                        uf: endereco.uf
                    }
                };

                if(document.getElementById('responsavel').checked) {
                    if(!payload.responsavelId){
                        const payloadResponsavel = {
                            nome: responsavel.nomeResponsavel,
                            rg:responsavel.rg,
                            cpf:responsavel.cpf
                        }
                        const idResponsavel = await cadastrarResponsavelBeneficiario(payloadResponsavel);
                        payload.responsavelId = idResponsavel.id;

                        if(beneficiario){
                            beneficiario.responsavelId = idResponsavel.id;
                            nextSection(2);
                        }
                    }
                }

                // Cadastra apenas se ainda não existir um beneficiário salvo neste fluxo
                if(!beneficiario){
                    beneficiario = await cadastrarBeneficiario(payload);
                    nextSection(2);
                }

            } else {
                alert('Existem erros no formulário. Por favor, verifique todas as etapas.');
            }
        });
        
    // form-beneficiary-documents
    document.getElementById('form-beneficiary-documents')
        .addEventListener('submit', async function (e) {

            e.preventDefault();
            e.stopPropagation();
            const ValidoBeneficiaryDocuments = validateSection(3);

            if (beneficiario && beneficiario.id && ValidoBeneficiaryDocuments) {
                try {
                    // Upload dos arquivos
                    const rgFile = document.getElementById('rgFile').files[0];
                    await uploadArquivoBeneficiario(beneficiario.id, 1, rgFile);

                    const cpfFile = document.getElementById('cpfFile').files[0];
                    await uploadArquivoBeneficiario(beneficiario.id, 2, cpfFile);

                    const comprovanteResidenciaFile = document.getElementById('residenceProof').files[0];
                    await uploadArquivoBeneficiario(beneficiario.id, 5, comprovanteResidenciaFile);

                    const laudoDeficienciaFile = document.getElementById('laudoFile').files[0];
                    await uploadArquivoBeneficiario(beneficiario.id, 6, laudoDeficienciaFile);


                    await uploadArquivoBeneficiario(beneficiario.id, 3, croppedFile);

                    // Redirecionar ou atualizar a página conforme necessário
                    alert('Cadastro concluido com sucesso!');


                } catch (error) {
                    alert('Erro ao enviar os documentos.'+ (error.message || ''));
                }
            }
        });

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
            if (!cropper) return;

            const canvas = cropper.getCroppedCanvas({ width: 300, height: 400 });

            canvas.toBlob((blob) => {
                if (!blob) {
                    alert("Erro ao gerar a imagem.");
                    return;
                }

                croppedFile = new File([blob], "foto-3x4.jpg", { type: "image/jpeg" });

                // preview opcional:
                photoPreview.src = canvas.toDataURL("image/jpeg");
                photoPreviewContainer.style.display = 'block';

                cropModal.hide();
            }, "image/jpeg", 0.9);
        });
    }
});

function validarFoto() {
    if (!croppedFile) return "Nenhuma foto foi carregada.";

    if (croppedFile.size > 2 * 1024 * 1024) {
        return "Foto maior que 2MB.";
    }

    if (!["image/jpeg", "image/png"].includes(croppedFile.type)) {
        return "Formato inválido.";
    }

    return null;
}


function validarCampo(campo, mensagensCustom = {}) {
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

    // console.log(campo.checkValidity())
    // // se válido → nada a fazer
    // if (campo.checkValidity()) {
    //     return true;
    // }
    // // pega o tipo de erro encontrado
    const validity = campo.validity;
    let mensagem = "Campo inválido."; // padrão
    if (!validity.valueMissing) {
        mensagem = mensagensCustom.valueMissing || "Este campo é obrigatório.";
    }
    else if (!validity.patternMismatch) {
        mensagem = mensagensCustom.patternMismatch || "Formato inválido.";
    }
    else if (!validity.tooShort) {
        mensagem = mensagensCustom.tooShort || `Mínimo de ${campo.minLength} caracteres.`;
    }
    else if (!validity.tooLong) {
        mensagem = mensagensCustom.tooLong || `Máximo de ${campo.maxLength} caracteres.`;
    }
    else if (!validity.typeMismatch) {
        mensagem = mensagensCustom.typeMismatch || "Valor inválido.";
    }
    // aplica erro
    campo.classList.add("is-invalid");
    feedback.textContent = mensagem;

    return false;
}