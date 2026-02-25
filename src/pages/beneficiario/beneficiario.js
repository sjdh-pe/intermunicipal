import { api } from "../../services/api.js";
import { enviarEmailViaDigital, uploadArquivoBeneficiario } from "../../services/beneficiariosService.js";
import Swal from "https://esm.sh/sweetalert2@11";

// Variáveis Globais
window.currentDocType = '';
let beneficiarioData = {};
let beneficiario = {};
let cropperInstance = null; // Instância do Cropper

// =================================================================
// 1. FUNÇÕES DOS BOTÕES 
// =================================================================

window.logout = function() {
    console.log("Saindo do sistema...");
    window.location.href = "../login/index.html";
};

window.triggerUpload = function(docType) {
    window.currentDocType = docType;
    const fileInput = document.getElementById('file-input');
    
    if(docType === 'FOTO') {
        fileInput.accept = "image/jpeg, image/png, image/jpg";
    } else {
        fileInput.accept = "image/*, application/pdf";
    }

    if (fileInput) fileInput.click();
};

window.emitirSegundaVia = async function() {
    console.log("emitirSegundaVia");
    await enviarEmailViaDigital(beneficiario);
    Swal.fire({
        title: 'Emissão da 2ª via',
        text: 'A emissão da 2ª via foi enviada para seu e-mail!',
        icon: 'success',
        timer: 5000,
        confirmButtonText: 'OK'
    });
};

window.atualizarInformacoes = function() { 
    Swal.fire({
        title: 'Atualização de informações',
        text: 'Informações atualizadas com sucesso!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
};

// =================================================================
// 2. CARREGAMENTO DOS DADOS DO BENEFICIÁRIO
// =================================================================

document.addEventListener('DOMContentLoaded', async () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const userCpf = urlParams.get('cpf');
    const userDatanasc = urlParams.get('datanasc');
    
    if (!userCpf || !userDatanasc) {
        alert("Sessão inválida. Retornando para a tela de login.");
        window.location.href = "../login/index.html";
        return;
    }

    try {
        const dados = await buscarBeneficiario(userCpf, userDatanasc);
        if (dados) {
            beneficiarioData = dados;
            preencherBeneficiario(beneficiarioData);
        }
    } catch (error) {
        console.error("Erro ao buscar beneficiário:", error);
        alert("Erro ao carregar seus dados.");
        window.location.href = "../login/index.html";
    }

    // =================================================================
    // 3. LÓGICA DE UPLOAD E CROPPER (A MÁGICA ACONTECE AQUI)
    // =================================================================
    const fileInput = document.getElementById('file-input');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if(this.files && this.files.length > 0) {
                const file = this.files[0];
                const userId = beneficiarioData.id;

                if (!userId) {
                    Swal.fire('Erro', 'ID do usuário não encontrado.', 'error');
                    this.value = '';
                    return;
                }

                // Descrobre o ID do Documento
                let tipoArquivoId = 1;
                switch(window.currentDocType) {
                    case 'RG': tipoArquivoId = 1; break;
                    case 'CPF': tipoArquivoId = 2; break;
                    case 'FOTO': tipoArquivoId = 3; break;
                    case 'RESIDENCIA': tipoArquivoId = 5; break;
                    case 'LAUDO': tipoArquivoId = 6; break;
                    case 'CPF_RESP': tipoArquivoId = 7; break;
                }

                // SE FOR FOTO -> ABRE O CROPPER
                if (window.currentDocType === 'FOTO') {
                    if (!file.type.startsWith('image/')) {
                        Swal.fire('Atenção', 'Para a foto 3x4, selecione uma imagem válida (JPG, PNG).', 'warning');
                        this.value = '';
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        const imgToCrop = document.getElementById('image-to-crop');
                        imgToCrop.src = evt.target.result;

                        // Mostra o Modal do Bootstrap
                        const cropModalEl = document.getElementById('cropModal');
                        const cropModal = new bootstrap.Modal(cropModalEl);
                        cropModal.show();

                        // Inicializa o Cropper assim que o modal terminar de abrir
                        cropModalEl.addEventListener('shown.bs.modal', function () {
                            if (cropperInstance) cropperInstance.destroy(); // Limpa se já existir
                            
                            cropperInstance = new Cropper(imgToCrop, {
                                aspectRatio: 3 / 4, // Força a proporção exata de 3x4
                                viewMode: 1,
                                autoCropArea: 1,
                            });
                        }, { once: true });
                    };
                    reader.readAsDataURL(file);

                } else {
                    // SE NÃO FOR FOTO -> MANDA DIRETO PRA API
                    enviarParaApi(userId, tipoArquivoId, file);
                }
            }
        });
    }

    // Ação do Botão "Cortar e Salvar" dentro do Modal
    document.getElementById('crop-button')?.addEventListener('click', function() {
        if (!cropperInstance) return;

        // Pega a imagem cortada no tamanho ideal
        cropperInstance.getCroppedCanvas({
            width: 300,
            height: 400,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        }).toBlob(async (blob) => {
            // Transforma o corte em um novo arquivo File
            const croppedFile = new File([blob], "foto_3x4.jpg", { type: "image/jpeg" });

            // Esconde o modal
            const modalEl = document.getElementById('cropModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            // Destrói o cropper
            cropperInstance.destroy();
            cropperInstance = null;

            // Envia a foto cortada para a API (ID 3 = FOTO)
            const userId = beneficiarioData.id;
            await enviarParaApi(userId, 3, croppedFile);

        }, 'image/jpeg', 0.9);
    });
});

// =================================================================
// 4. FUNÇÃO AUXILIAR CENTRALIZADA DE ENVIO (Com Loading)
// =================================================================
async function enviarParaApi(userId, tipoArquivoId, arquivoFinal) {
    try {
        Swal.fire({
            title: 'Enviando documento...',
            text: 'Aguarde um momento.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        console.log(`Iniciando upload de: ${arquivoFinal.name}...`);
        
        // Chamada real da API
        const resultado = await uploadArquivoBeneficiario(userId, tipoArquivoId, arquivoFinal);
        
        console.log("✅ Upload finalizado!", resultado);

        Swal.fire({
            title: 'Sucesso!',
            text: 'Documento salvo com sucesso no servidor!',
            icon: 'success',
            confirmButtonText: 'OK'
        });

    } catch (error) {
        console.error("❌ Erro no upload:", error);
        Swal.fire({
            title: 'Erro no Envio',
            text: 'Falha ao enviar documento. Tente novamente.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } finally {
        // Limpa o input de arquivo
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = ''; 
    }
}


// =================================================================
// 5. FUNÇÕES AUXILIARES DE BUSCA E PREENCHIMENTO
// =================================================================

async function buscarBeneficiario(cpf, datanasc) {
    const resposta = await api.get(`/beneficiarios/cpf/${cpf}/${datanasc}`);
    beneficiario = resposta.data;
    return resposta.data;
}

function preencherBeneficiario(dados) {
    const setVal = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.value = valor || "";
    };

    const headerName = document.getElementById('header-user-name');
    const headerCpf = document.getElementById('header-user-cpf');
    
    if (headerName && headerCpf) {
        let cpfFormatado = dados.cpf || "";
        if (cpfFormatado.length === 11 && !cpfFormatado.includes('.')) {
            cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }
        const primeiroNome = dados.nome ? dados.nome.split(' ').slice(0, 2).join(' ').toUpperCase() : 'BENEFICIÁRIO';
        headerName.textContent = primeiroNome;
        headerCpf.innerHTML = `<i class="fa-regular fa-address-card" style="margin-right: 5px;"></i> CPF: ${cpfFormatado}`;
    }

    setVal('nome', dados.nome);
    setVal('cpf', dados.cpf);
    setVal('rg', dados.rg);
    setVal('datanasc', dados.datanasc || dados.dataNascimento);
    setVal('genero', dados.genero || dados.sexo);
    setVal('etnia', dados.etnia);
    setVal('nomemae', dados.nomemae || dados.nomeMae);
    setVal('tipodeficiencia', dados.tipodeficiencia || dados.tipoDeficiencia);
    
    const temAcomp = (dados.acompanhante === '1' || dados.acompanhante === 'Sim' || dados.acompanhante === true) ? 'Sim' : 'Não';
    setVal('acompanhante', temAcomp);

    const statusInput = document.getElementById('status');
    if(statusInput) {
        statusInput.value = dados.statusBeneficio || "Em Análise";
        const st = (dados.statusBeneficio || "").toLowerCase();
        
        statusInput.style.backgroundColor = '';
        statusInput.style.color = '';

        if (st.includes('aprovado') || st.includes('ativo')) {
            statusInput.style.backgroundColor = '#d4edda';
            statusInput.style.color = '#155724';
        } else if (st.includes('indeferido') || st.includes('vencido')) {
            statusInput.style.backgroundColor = '#f8d7da';
            statusInput.style.color = '#721c24';
        } else {
            statusInput.style.backgroundColor = '#fff3cd';
            statusInput.style.color = '#856404';
        }
    }

    setVal('edit-email', dados.email);
    setVal('edit-telefone', dados.telefone);
    setVal('edit-cep', dados.cep);
    setVal('edit-cidade', dados.cidade);
    setVal('edit-bairro', dados.bairro);
    setVal('edit-endereco', dados.endereco || dados.logradouro);
    setVal('edit-numero', dados.numero);
    setVal('edit-complemento', dados.complemento);
    setVal('nomeresponsavel', dados.nomeresponsavel || dados.nomeResponsavel);
    setVal('cpfresponsavel', dados.cpfresponsavel || dados.cpfResponsavel);
    setVal('rgresponsavel', dados.rgresponsavel || dados.rgResponsavel);
}