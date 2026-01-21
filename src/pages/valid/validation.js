// Simulação de Banco de Dados (Mesmos dados da gestão)
const database = [
    { 
        id: "1", 
        nome: "Dolores Purdy", 
        cpf: "00000000005", 
        cidade: "CARUARU", 
        tipoDeficiencia: "Física", 
        statusBeneficio: "Aprovado", // Aprovado = Válido
        docFoto: "../../assets/docs/foto_dolores.jpg",
        dataValidade: "2026-12-31" // Simulando uma data de validade
    },
    { 
        id: "2", 
        nome: "Bradley Deckow", 
        cpf: "00000000003", 
        cidade: "CARUARU", 
        tipoDeficiencia: "Física", 
        statusBeneficio: "Em análise", // Em análise = Não válido para transporte ainda
        dataValidade: "-"
    },
    { 
        id: "3", 
        nome: "Debbie Deckow", 
        cpf: "00000000002", 
        cidade: "CARUARU", 
        tipoDeficiencia: "Física", 
        statusBeneficio: "Negado", // Negado = Inválido
        dataValidade: "-"
    },
    { 
        id: "7", 
        nome: "Carlos Eduardo Silva", 
        cpf: "55566677788", 
        cidade: "OLINDA", 
        tipoDeficiencia: "Auditiva", 
        statusBeneficio: "Aprovado", 
        dataValidade: "2025-07-20"
    }
];

// Função principal que roda ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // 1. Pega os parâmetros da URL (ex: carteira.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    // Elementos da tela
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const walletCard = document.getElementById('wallet-card');

    // Simula um pequeno delay de carregamento (para parecer real)
    setTimeout(() => {
        loadingState.classList.add('hidden');

        if (!userId) {
            showError();
            return;
        }

        // 2. Busca o usuário no "Banco de Dados"
        const user = database.find(u => u.id === userId);

        if (user) {
            renderWallet(user, walletCard);
        } else {
            showError();
        }
    }, 800); // 800ms de delay

    // Mostra data e hora da consulta no rodapé do card
    const now = new Date();
    document.getElementById('data-hora-consulta').textContent = `Consulta: ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`;
});

function showError() {
    document.getElementById('error-state').classList.remove('hidden');
}

function renderWallet(user, cardElement) {
    // Mostra o card
    cardElement.classList.remove('hidden');

    // Preenche os dados
    document.getElementById('user-name').textContent = user.nome;
    document.getElementById('user-cpf').textContent = formatCPF(user.cpf);
    document.getElementById('user-cidade').textContent = user.cidade;
    document.getElementById('user-validade').textContent = user.dataValidade || "Indeterminado";

    // Foto
    const imgEl = document.getElementById('user-photo');
    const iconEl = document.getElementById('user-icon');
    
    // Lógica simples: Se tiver link de foto e não for vazio, tenta mostrar
    if (user.docFoto && user.docFoto.includes('.')) { 
        imgEl.src = user.docFoto;
        imgEl.classList.remove('hidden');
        iconEl.classList.add('hidden');
    } else {
        imgEl.classList.add('hidden');
        iconEl.classList.remove('hidden');
    }

    // Lógica de Status (Validação Visual)
    const statusContainer = document.getElementById('status-container');
    
    // Consideramos VÁLIDO se status for 'Aprovado', 'Entregue', 'Disponível...'
    // Isso é uma regra de negócio que você pode ajustar
    const statusValidos = ['Aprovado', 'Entregue', 'Disponível para Retirada', 'Entregue ao Município'];
    const isValid = statusValidos.includes(user.statusBeneficio);

    if (isValid) {
        statusContainer.innerHTML = `
            <div class="status-badge status-valid pulse-animation">
                <i data-feather="check-circle" class="w-4 h-4 mr-2"></i>
                DOCUMENTO VÁLIDO
            </div>
            <p class="text-xs text-green-600 mt-2 font-medium">Situação: ${user.statusBeneficio}</p>
        `;
    } else {
        statusContainer.innerHTML = `
            <div class="status-badge status-invalid">
                <i data-feather="alert-circle" class="w-4 h-4 mr-2"></i>
                INVÁLIDO / PENDENTE
            </div>
            <p class="text-xs text-red-600 mt-2 font-medium">Situação: ${user.statusBeneficio}</p>
        `;
    }
    
    // Atualiza ícones novos inseridos no HTML
    if (typeof feather !== 'undefined') feather.replace();
}

function formatCPF(cpf) {
    // Mascara o CPF para segurança na exibição pública (XXX.XXX.XXX-00)
    // Mostra apenas os 3 primeiros e 2 últimos
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**');
}