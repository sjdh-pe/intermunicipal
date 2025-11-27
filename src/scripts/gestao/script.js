// Sample data - in a real app, this would come from an API
const beneficiariosData = {
    "content": [
        {
            "id": "10ff7e36-1ea6-4cad-b79d-f9d68a8d3d9b",
            "nome": "Dolores Purdy",
            "cpf": "00000000005",
            "cidade": "CARUARU",
            "tipoDeficiencia": "Física",
            "statusBeneficio": "Em análise"
        },
        {
            "id": "2fd92601-e046-4431-a1cd-e87dbfcc2e29",
            "nome": "Bradley Deckow",
            "cpf": "00000000003",
            "cidade": "CARUARU",
            "tipoDeficiencia": "Física",
            "statusBeneficio": "Em análise"
        },
        {
            "id": "34e17b6e-7efb-4d76-962f-6b1c5bc722e7",
            "nome": "Debbie Deckow",
            "cpf": "00000000002",
            "cidade": "CARUARU",
            "tipoDeficiencia": "Física",
            "statusBeneficio": "Em análise"
        },
        {
            "id": "54a225ac-8869-4394-9faf-05712f0a55bf",
            "nome": "Dana Fadel",
            "cpf": "00000000001",
            "cidade": "CARUARU",
            "tipoDeficiencia": "Física",
            "statusBeneficio": "Em análise"
        },
        {
            "id": "dd3437b7-91bf-4283-a402-be964ed1b4f1",
            "nome": "Emanuel Rippin-Rath",
            "cpf": "00000000004",
            "cidade": "CARUARU",
            "tipoDeficiencia": "Física",
            "statusBeneficio": "Em análise"
        }
    ],
    "totalElements": 5
};
function filterBeneficiarios() {
    const nomeFilter = document.getElementById('search-nome').value.toLowerCase();
    const cpfFilter = document.getElementById('search-cpf').value;
    const cidadeFilter = document.getElementById('search-cidade').value.toLowerCase();
    const statusFilter = document.getElementById('search-status').value;

    return beneficiariosData.content.filter(beneficiario => {
        const matchesNome = beneficiario.nome.toLowerCase().includes(nomeFilter);
        const matchesCpf = beneficiario.cpf.includes(cpfFilter);
        const matchesCidade = beneficiario.cidade.toLowerCase().includes(cidadeFilter);
        const matchesStatus = statusFilter === '' || beneficiario.statusBeneficio === statusFilter;

        return matchesNome && matchesCpf && matchesCidade && matchesStatus;
    });
}

function loadBeneficiarios() {
    const tableBody = document.getElementById('beneficiarios-table');
    tableBody.innerHTML = '';

    const filteredData = filterBeneficiarios();

    filteredData.forEach(beneficiario => {
        const row = document.createElement('tr');

        // Get status badge class based on status
        let statusClass = 'status-em-analise';
        if (beneficiario.statusBeneficio.toLowerCase().includes('ativo')) {
            statusClass = 'status-ativo';
        } else if (beneficiario.statusBeneficio.toLowerCase().includes('inativo')) {
            statusClass = 'status-inativo';
        }

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${beneficiario.nome}</div>
                <div class="text-sm text-gray-500">${beneficiario.cidade}</div>
            </td>
<td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${beneficiario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${beneficiario.cidade}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${beneficiario.tipoDeficiencia}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusClass}">${beneficiario.statusBeneficio}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">
                    <i data-feather="eye"></i>
                </button>
                <button class="text-amber-600 hover:text-amber-900 mr-3">
                    <i data-feather="edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900">
                    <i data-feather="trash-2"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Update counters
    document.getElementById('current-items').textContent = 1;
    document.getElementById('total-items').textContent = beneficiariosData.content.length;
    document.getElementById('total-count').textContent = beneficiariosData.totalElements;
    // Replace icons after DOM update
    feather.replace();
}

// Add event listeners for filter button and input fields
document.addEventListener('DOMContentLoaded', function() {
    loadBeneficiarios();

    document.getElementById('btn-filtrar').addEventListener('click', loadBeneficiarios);

    // Add input event listeners for live filtering (optional)
    ['search-nome', 'search-cpf', 'search-cidade', 'search-status'].forEach(id => {
        document.getElementById(id).addEventListener('input', loadBeneficiarios);
    });
});
