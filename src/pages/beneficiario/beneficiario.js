import { api } from "../../services/api.js";

let beneficiarioData = {};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Pega os parâmetros exatos que estão vindo da sua URL de login
    const urlParams = new URLSearchParams(window.location.search);
    const userCpf = urlParams.get('cpf');
    const userDatanasc = urlParams.get('datanasc');
    
    console.log('Parâmetros capturados da URL:', userCpf, userDatanasc);

    // Se a URL não tiver os dados, barra o acesso
    if (!userCpf || !userDatanasc) {
        alert("Sessão inválida. Retornando para a tela de login.");
        window.location.href = "../login/index.html";
        return;
    }

    try {
        // 2. Busca na rota exata da sua API
        const dados = await buscarBeneficiario(userCpf, userDatanasc);
        
        if (dados) {
            beneficiarioData = dados;
            console.log("Dados carregados do banco:", beneficiarioData);
            
            // 3. Preenche a tela
            preencherBeneficiario(beneficiarioData);
        } else {
            throw new Error("Dados não retornados pela API");
        }

    } catch (error) {
        console.error("Erro ao buscar beneficiário:", error);
        alert("Erro ao carregar seus dados. Verifique se o cadastro existe.");
        window.location.href = "../login/index.html";
    }
});

// Busca usando a rota personalizada do seu backend
async function buscarBeneficiario(cpf, datanasc) {
    const resposta = await api.get(`/beneficiarios/cpf/${cpf}/${datanasc}`);
    return resposta.data;
}

function preencherBeneficiario(dados) {
    // Função auxiliar para evitar erro se o campo não existir
    const setVal = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.value = valor || "";
    };

   //cabeçalho
    const headerName = document.getElementById('header-user-name');
    const headerCpf = document.getElementById('header-user-cpf');
    
    if (headerName && headerCpf) {
        // Formata o CPF caso venha do banco apenas com números
        let cpfFormatado = dados.cpf || "";
        if (cpfFormatado.length === 11 && !cpfFormatado.includes('.')) {
            cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }

        // Se o nome for muito grande, pega só as duas primeiras palavras
        const primeiroNome = dados.nome ? dados.nome.split(' ').slice(0, 2).join(' ') : 'Beneficiário';

        // Injeta os dados nos parágrafos do novo card
        headerName.textContent = primeiroNome;
        headerCpf.innerHTML = `<i class="fa-regular fa-address-card"></i> CPF: ${cpfFormatado}`;
    }


    
    // Card 1: Dados Pessoais
    setVal('nome', dados.nome);
    setVal('cpf', dados.cpf);
    setVal('rg', dados.rg);
    setVal('datanasc', dados.datanasc || dados.dataNascimento);
    setVal('genero', dados.genero || dados.sexo); // Cobre as duas possibilidades de nome no banco
    setVal('etnia', dados.etnia);
    setVal('nomemae', dados.nomemae || dados.nomeMae);
    setVal('tipodeficiencia', dados.tipodeficiencia || dados.tipoDeficiencia);
    
    const temAcomp = (dados.acompanhante == '1' || dados.acompanhante === 'Sim' || dados.acompanhante === true) ? 'Sim' : 'Não';
    setVal('acompanhante', temAcomp);

    const statusInput = document.getElementById('status');
    if(statusInput) {
        statusInput.value = dados.statusBeneficio || "Em Análise";
        const st = (dados.statusBeneficio || "").toLowerCase();
        
        // Limpa cores padrão
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

    // Card 2: Contato
    setVal('edit-email', dados.email);
    setVal('edit-telefone', dados.telefone);
    setVal('edit-cep', dados.cep);
    setVal('edit-cidade', dados.cidade);
    setVal('edit-bairro', dados.bairro);
    setVal('edit-endereco', dados.endereco || dados.logradouro);
    setVal('edit-numero', dados.numero);
    setVal('edit-complemento', dados.complemento);

    // Card 3: Responsável
    setVal('nomeresponsavel', dados.nomeresponsavel || dados.nomeResponsavel);
    setVal('cpfresponsavel', dados.cpfresponsavel || dados.cpfResponsavel);
    setVal('rgresponsavel', dados.rgresponsavel || dados.rgResponsavel);
}

// Botão de Sair
function logout() {
    window.location.href = "../login/index.html";
}
window.logout = logout;