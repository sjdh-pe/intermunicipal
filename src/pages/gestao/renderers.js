import { formatCPF, resolveStatus } from './utils.js';
import { filterBeneficiarios } from './filters.js';
import {loadTokenOnStart, requireAuth} from '../../services/auth.js';

// loadTokenOnStart();
requireAuth(); // redireciona ao login se necessário



export function loadBeneficiarios(beneficiariosPage) {
    const tableBody = document.getElementById('beneficiarios-table');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const filtered = filterBeneficiarios(beneficiariosPage);

    filtered.forEach(b => {
        const row = document.createElement('tr');
        const infoStatus = resolveStatus(b);
        const isAprovado = infoStatus.nome === 'Aprovado' || b.statusId === 4;
        const cardClass = isAprovado ? "text-green-600 hover:text-green-900 cursor-pointer" : "text-gray-300 cursor-not-allowed";
        // const cardAction = isAprovado ? `onclick="alert('Abrir carteira de: ${b.nome.replace(/"/g, '\\"')}')"` : '';
         const cardAction = isAprovado ? `onclick="openCarteiraModal('${b.id}')"` : '';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">${b.nome || ''}</div></td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-900">${formatCPF(b.cpf || '')}</div></td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-900">${b.cidade || ''}</div></td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-900">${b.tipoDeficiencia || ''}</div></td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-900">${b.dataSolicitacao || ''}</div></td>
            <td class="px-6 py-4 whitespace-nowrap"><span class="${infoStatus.estilo} px-2 py-1 rounded-full text-xs font-semibold">${infoStatus.nome}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openViewModal('${b.id}')" class="text-blue-600 hover:text-blue-900 mr-3" title="Ver dados"><i data-feather="eye"></i></button>
                <button onclick="openEditModal('${b.id}')" class="text-amber-600 hover:text-amber-900 mr-3" title="Editar"><i data-feather="edit"></i></button>
                <button onclick="openCarteiraModal('${b.id}')" class="${cardClass} mr-3" title="${isAprovado ? 'Visualizar Carteira' : 'Carteira Indisponível'}"><i data-feather="credit-card"></i></button>
<!--                <button onclick="openDeleteModal('${b.id}')" class="text-red-600 hover:text-red-900" title="Deletar"><i data-feather="trash-2"></i></button>-->
            </td>
        `;
        tableBody.appendChild(row);
    });

    if (document.getElementById('current-items')) document.getElementById('current-items').textContent = filtered.length;
    if (document.getElementById('total-items')) document.getElementById('total-items').textContent = (beneficiariosPage?.content || []).length;
    if (document.getElementById('total-count')) document.getElementById('total-count').textContent = beneficiariosPage?.totalElements || 0;

    if (typeof feather !== 'undefined') feather.replace();
}

