// Simulação de Banco de Dados (Mesmos dados da gestão)
import {validarBeneficiario} from "../../services/beneficiariosService.js";

function getDataUrlFromBase64(base64) {
    if (!base64) return null;

    // Se já vier como "data:image/..;base64,..."
    if (base64.startsWith("data:")) return base64;

    // Heurística simples: jpeg geralmente começa com "/9j/"
    const mime = base64.startsWith("/9j/") ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${base64}`;
}

// Função principal que roda ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const walletCard = document.getElementById('wallet-card');

    // Data/hora
    const now = new Date();
    document.getElementById('data-hora-consulta').textContent =
        `Consulta: ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`;

    // Delay “realista”
    await new Promise(resolve => setTimeout(resolve, 800));
    loadingState.classList.add('hidden');

    if (!userId) {
        showError();
        return;
    }

    try {
        const user = await validarBeneficiario(userId); // ✅ espera a resposta
        console.log(user);

        if (user) {
            renderWallet(user, walletCard);
        } else {
            showError();
        }
    } catch (err) {
        console.error('Erro ao validar beneficiário:', err);
        showError();
    }
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

    const dataUrl = getDataUrlFromBase64(user.fotoBase64);

    if (dataUrl) {
        imgEl.src = dataUrl;
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