import { api } from "../../services/api.js";
import {enviarEmailViaDigital, uploadArquivoBeneficiario} from "../../services/beneficiariosService.js";
import Swal from "https://esm.sh/sweetalert2@11";


// Variável para saber qual documento o usuário clicou (RG, CPF, etc)
window.currentDocType = '';

// Função do botão Sair (Logout)
window.logout = function() {
    console.log("Saindo do sistema...");
    window.location.href = "../login/index.html";
};

window.triggerUpload = function(docType) {
    window.currentDocType = docType;
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.click();
};
let beneficiario = {};
window.emitirSegundaVia = async function() {
    console.log("emitirSegundaVia");
    await enviarEmailViaDigital(beneficiario);
    // alert("emissão da 2ª via foi para seu e-mail!");
    Swal.fire({
        title: 'Emissão da 2ª via',
        text: 'A emissão da 2ª via foi enviada para seu e-mail!',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'OK'
    });

};

window.atualizarInformacoes = function() { 
    alert("Informações atualizadas com sucesso!"); 
};


// Função de carregamento dos dados do beneficiario

let beneficiarioData = {};

document.addEventListener('DOMContentLoaded', async () => {
    
    // Pega CPF e Data de Nascimento da URL
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

    // Função de upload

    const fileInput = document.getElementById('file-input');
    
    if (fileInput) {
       
        fileInput.addEventListener('change', async function(e) {
            if(this.files && this.files.length > 0) {
                const file = this.files[0];
                const userId = beneficiarioData.id;

                if (!userId) {
                    alert("Erro: ID do usuário não encontrado.");
                    this.value = '';
                    return;
                }

                // Descobre o ID do tipo de documento para a API
                let tipoArquivoId = 1;
                switch(window.currentDocType) {
                    case 'RG': tipoArquivoId = 1; break;
                    case 'CPF': tipoArquivoId = 2; break;
                    case 'FOTO': tipoArquivoId = 3; break;
                    case 'RESIDENCIA': tipoArquivoId = 5; break;
                    case 'LAUDO': tipoArquivoId = 6; break;
                    case 'CPF_RESP': tipoArquivoId = 7; break;
                }

                try {
                    console.log(`Iniciando upload do arquivo: ${file.name}...`);
                    
                    // Resultado, é a resposta do servidor
                    const resultado = await uploadArquivoBeneficiario(userId, tipoArquivoId, file);
                    
                    console.log("✅ Upload finalizado com sucesso! Resposta da API:", resultado);
                    
                    alert("Documento salvo com sucesso!");
                    
                } catch (error) {
                    console.error("❌ Erro no upload:", error);
                    alert("Falha ao enviar documento. Tente novamente.");
                } finally {
                    this.value = ''; 
                }
            }
        });
    }
});

// Funções de Busca e preenchicmento

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

    // Preenche Cabeçalho
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

    // Preenche Cards
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