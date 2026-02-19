import { api } from "../../services/api.js";

let beneficiarioData = {};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Tenta pegar os parâmetros da URL (conforme seu código anterior)
    const urlParams = new URLSearchParams(window.location.search);
    const userCpf = urlParams.get('cpf');
    const userDatanasc = urlParams.get('datanasc');
    
    // Fallback: Se não tiver na URL, tenta pegar o ID do localStorage (caso mude a lógica de login)
    const idLocalStorage = localStorage.getItem('user_id');

    console.log('Parâmetros:', { userCpf, userDatanasc, idLocalStorage });

    try {
        let dados = null;

        // Estratégia de Busca:
        if (userCpf && userDatanasc) {
            // Opção A: Busca por CPF e Data (conforme seu código)
            dados = await buscarBeneficiarioPorDados(userCpf, userDatanasc);
        } else if (idLocalStorage) {
            // Opção B: Busca por ID do localStorage (mais seguro)
            dados = await buscarBeneficiarioPorId(idLocalStorage);
        }

        if (dados) {
            // Se a API retornar um array (comum no json-server ao filtrar), pegamos o primeiro item
            if (Array.isArray(dados)) {
                beneficiarioData = dados[0]; 
            } else {
                beneficiarioData = dados;
            }

            if(beneficiarioData) {
                console.log("Dados carregados com sucesso:", beneficiarioData);
                preencherBeneficiario(beneficiarioData);
            } else {
                throw new Error("Usuário não encontrado na resposta da API");
            }
        } else {
            alert("Dados de acesso não encontrados. Por favor, faça login novamente.");
            window.location.href = "../login/index.html";
        }

    } catch (error) {
        console.error("Erro ao buscar beneficiário:", error);
        alert("Erro ao carregar seus dados.");
        // window.location.href = "../login/index.html";
    }
});

// Busca usando CPF e Data (Filtro)
async function buscarBeneficiarioPorDados(cpf, datanasc) {
    // Nota: O endpoint depende de como seu back-end espera. 
    // Se for json-server filtrando, seria: /beneficiarios?cpf=${cpf}&datanasc=${datanasc}
    // Se for sua API customizada, mantenha a rota que você criou:
    const resposta = await api.get(`/beneficiarios?cpf=${cpf}&datanasc=${datanasc}`);
    return resposta.data;
}

// Busca usando ID direto (Opcional, mas recomendado)
async function buscarBeneficiarioPorId(id) {
    const resposta = await api.get(`/beneficiarios/${id}`);
    return resposta.data;
}

function preencherBeneficiario(dados) {
    // Função auxiliar
    const setVal = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.value = valor || "";
    };

    // Cabeçalho
    const headerTitle = document.getElementById('header-welcome');
    if (headerTitle) {
        // Garante formatação do CPF (caso venha sem pontos do banco)
        let cpfFormatado = dados.cpf || "";
        if (cpfFormatado.length === 11 && !cpfFormatado.includes('.')) {
            cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }

        headerTitle.innerHTML = `
            Bem-vindo, <strong>${dados.nome}</strong> <br>
            <span class="user-header-cpf"><i class="fa-regular fa-address-card"></i> CPF: ${cpfFormatado}</span>
        `;
    }

    // --- Restante do preenchimento dos campos ---
    
    // Card 1: Dados Pessoais
    setVal('nome', dados.nome);
    setVal('cpf', dados.cpf);
    setVal('rg', dados.rg);
    setVal('datanasc', dados.datanasc || dados.dataNascimento);
    setVal('genero', dados.genero || dados.sexo); // Tenta as duas chaves comuns
    setVal('etnia', dados.etnia);
    setVal('nomemae', dados.nomemae || dados.nomeMae);
    setVal('tipodeficiencia', dados.tipodeficiencia || dados.tipoDeficiencia);
    
    const temAcomp = (dados.acompanhante == '1' || dados.acompanhante === 'Sim' || dados.acompanhante === true) ? 'Sim' : 'Não';
    setVal('acompanhante', temAcomp);

    const statusInput = document.getElementById('status');
    if(statusInput) {
        statusInput.value = dados.statusBeneficio || "Em Análise";
        const st = (dados.statusBeneficio || "").toLowerCase();
        
        // Limpa cores anteriores
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
    localStorage.removeItem('user_id');
    window.location.href = "../login/index.html";
}
window.logout = logout;