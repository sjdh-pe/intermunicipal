import { api } from "../../services/api.js";

let beneficiarioData = {};

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userCpf = urlParams.get('cpf');
    const userDatanasc = urlParams.get('datanasc');
    console.log ('cpf, datanasc', userCpf, userDatanasc)
    // const resp = buscarBeneficiario (userCpf, userDatanasc);
    // console.log (resp) 
    // --- MUDANÇA AQUI ---
    // Recupera o ID do LocalStorage (memória do navegador)
    // http://127.0.0.1:4200/pages/beneficiario/index.html?cpf=00000000003&datanasc=01012026

    try {
        const dados = await buscarBeneficiario(userCpf, userDatanasc);
        
        beneficiarioData = dados;
        console.log("Dados carregados:", beneficiarioData);
        
        preencherBeneficiario(beneficiarioData);

    } catch (error) {
        console.error("Erro ao buscar beneficiário:", error);
        // Se der erro 404, pode ser que o usuário foi deletado, então limpamos a sessão
        alert("Erro ao carregar seus dados.");
        // localStorage.removeItem('user_id'); // Opcional: forçar logout se der erro
        // window.location.href = "../login/index.html";
    }
   
    console.log (beneficiarioData)

    // Se não tiver ID salvo, chuta de volta pro login
    if (!id) {
        alert("Sessão inválida ou expirada. Faça login novamente.");
        window.location.href = "../login/index.html";
        return;
    }

});

async function buscarBeneficiario(cpf, datanasc) {
    const resposta = await api.get(`/beneficiarios/cpf/${cpf}/${datanasc}`);
    return resposta.data;
}

function preencherBeneficiario(dados) {
    // Função auxiliar (mantida igual)
    const setVal = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.value = valor || "";
    };

    // --- Card 1: Dados Pessoais ---
    setVal('nome', dados.nome);
    setVal('cpf', dados.cpf);
    setVal('rg', dados.rg);
    setVal('datanasc', dados.datanasc || dados.dataNascimento);
    setVal('genero', dados.sexo);
    setVal('etnia', dados.etnia);
    setVal('nomemae', dados.nomemae || dados.nomeMae);
    setVal('tipodeficiencia', dados.tipodeficiencia || dados.tipoDeficiencia);
    
    const temAcomp = (dados.acompanhante == '1' || dados.acompanhante === 'Sim') ? 'Sim' : 'Não';
    setVal('acompanhante', temAcomp);

    const statusInput = document.getElementById('status');
    if(statusInput) {
        statusInput.value = dados.statusBeneficio || "Em Análise";
        const st = (dados.statusBeneficio || "").toLowerCase();
        
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

    // --- Card 2: Contato ---
    setVal('edit-email', dados.email);
    setVal('edit-telefone', dados.telefone);
    setVal('edit-cep', dados.cep);
    setVal('edit-cidade', dados.cidade);
    setVal('edit-bairro', dados.bairro);
    setVal('edit-endereco', dados.endereco || dados.logradouro);
    setVal('edit-numero', dados.numero);
    setVal('edit-complemento', dados.complemento);

    // --- Card 3: Responsável ---
    setVal('nomeresponsavel', dados.nomeresponsavel || dados.nomeResponsavel);
    setVal('cpfresponsavel', dados.cpfresponsavel || dados.cpfResponsavel);
    setVal('rgresponsavel', dados.rgresponsavel || dados.rgResponsavel);

    // --- Cabeçalho ---
    const headerTitle = document.querySelector('.user-name p');
    if (headerTitle) {
        // Tenta pegar o primeiro nome
        const primeiroNome = dados.nome ? dados.nome.split(' ')[0] : 'Beneficiário';
        headerTitle.innerText = `Bem-vindo, ${primeiroNome} (ID: ${dados.id})`;
    }
}

// Botão de Sair (Adicione um botão de logout no HTML se quiser usar isso)
function logout() {
    localStorage.removeItem('user_id');
    window.location.href = "../login/index.html";
}
// Torna a função logout global para ser usada no onclick do HTML
window.logout = logout;