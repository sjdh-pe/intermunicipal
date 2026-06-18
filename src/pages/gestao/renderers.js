import { formatCPF, resolveStatus } from './utils.js';
import { requireAuth } from '../../services/auth.js';

requireAuth();

export function loadBeneficiarios(beneficiariosPage) {
    const tableBody = document.getElementById('beneficiarios-table');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const items = beneficiariosPage?.content || [];

    if (items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-14 text-center">
                    <div class="flex flex-col items-center text-gray-400">
                        <i data-feather="inbox" class="w-10 h-10 mb-2 opacity-40"></i>
                        <p class="text-sm">Nenhum beneficiário encontrado para os filtros aplicados</p>
                    </div>
                </td>
            </tr>`;
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    items.forEach(b => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-blue-50 transition-colors duration-100';

        const infoStatus  = resolveStatus(b);
        const isAprovado  = infoStatus.nome === 'Aprovado' || b.statusId === 4;
        const cardBtnClass = isAprovado
            ? 'p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors'
            : 'p-1.5 text-gray-300 rounded-lg cursor-not-allowed';
        const nomeEscapado = (b.nome || '').replace(/'/g, "\\'");

        row.innerHTML = `
            <td class="px-4 py-3">
                <span class="text-sm font-medium text-gray-900">${b.nome || ''}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-sm font-mono text-gray-600">${formatCPF(b.cpf || '')}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-700">${b.cidade || ''}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-700">${b.tipoDeficiencia || ''}</span>
            </td>
            <td class="px-4 py-3 text-center">
                <span class="text-sm font-medium text-gray-700">${b.diasDesdeCriacao ?? 1}d</span>
            </td>
            <td class="px-4 py-3">
                <span class="${infoStatus.estilo} px-2.5 py-1 rounded-full text-xs font-semibold">${infoStatus.nome}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-1">
                    <button onclick="openViewModal('${b.id}')"
                        class="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Ver dados">
                        <i data-feather="eye" class="w-4 h-4"></i>
                    </button>
                    <button onclick="openEditModal('${b.id}')"
                        class="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Editar">
                        <i data-feather="edit" class="w-4 h-4"></i>
                    </button>
                    <button onclick="openCarteiraModal('${b.id}', '${nomeEscapado}', '${b.email || ''}')"
                        class="${cardBtnClass}"
                        title="${isAprovado ? 'Opções da Carteira' : 'Carteira indisponível'}"
                        ${!isAprovado ? 'disabled' : ''}>
                        <i data-feather="credit-card" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    if (typeof feather !== 'undefined') feather.replace();
}
