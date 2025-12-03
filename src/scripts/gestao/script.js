// ---- script.js (substituir todo o conteúdo por este) ----

// Variáveis globais para os Modals
let viewModalInstance;
let editModalInstance;
let deleteModalInstance;

// Dados (Simulando Banco de Dados) - mantive como você tinha, com statusBeneficio como texto.
// O script abaixo consegue trabalhar mesmo se você mudar para usar statusId.
let beneficiariosData = {
    content: [
        { id: "1", nome: "Dolores Purdy", cpf: "00000000005", cidade: "CARUARU", tipoDeficiencia: "Física", statusBeneficio: "Em análise" },
        { id: "2", nome: "Bradley Deckow", cpf: "00000000003", cidade: "CARUARU", tipoDeficiencia: "Física", statusBeneficio: "Em análise" },
        { id: "3", nome: "Debbie Deckow", cpf: "00000000002", cidade: "CARUARU", tipoDeficiencia: "Física", statusBeneficio: "Em análise" },
        { id: "4", nome: "Dana Fadel", cpf: "00000000001", cidade: "CARUARU", tipoDeficiencia: "Física", statusBeneficio: "Em análise" },
        { id: "5", nome: "Emanuel Rippin-Rath", cpf: "00000000004", cidade: "CARUARU", tipoDeficiencia: "Física", statusBeneficio: "Em análise" },

        // --- Novos usuários ---
        { id: "6", nome: "Marina Alves", cpf: "11122233344", cidade: "RECIFE", tipoDeficiencia: "Visual", statusBeneficio: "Pendente" },
        { id: "7", nome: "Carlos Eduardo Silva", cpf: "55566677788", cidade: "OLINDA", tipoDeficiencia: "Auditiva", statusBeneficio: "Aprovado" },
        { id: "8", nome: "Juliana Ferreira", cpf: "99988877766", cidade: "JABOATÃO", tipoDeficiencia: "Física", statusBeneficio: "Negado" },
        { id: "9", nome: "Paulo Roberto", cpf: "12312312312", cidade: "PAULISTA", tipoDeficiencia: "Intelectual", statusBeneficio: "Entregue" },
        { id: "10", nome: "Amanda Costa", cpf: "32132132132", cidade: "CARUARU", tipoDeficiencia: "Física", statusBeneficio: "Disponível para Retirada" },

        { id: "11", nome: "Thiago Melo", cpf: "14725836914", cidade: "GARANHUNS", tipoDeficiencia: "Auditiva", statusBeneficio: "Entregue ao Município" },
        { id: "12", nome: "Fernanda Torres", cpf: "36925814736", cidade: "PETROLINA", tipoDeficiencia: "Visual", statusBeneficio: "Pendente" },
        { id: "13", nome: "Marcelo Andrade", cpf: "74185296374", cidade: "CARPINA", tipoDeficiencia: "Física", statusBeneficio: "Em análise" },
        { id: "14", nome: "José Antônio", cpf: "85296374185", cidade: "SERRA TALHADA", tipoDeficiencia: "Auditiva", statusBeneficio: "Aprovado" },
        { id: "15", nome: "Ana Beatriz Santos", cpf: "15935725815", cidade: "IGARASSU", tipoDeficiencia: "Visual", statusBeneficio: "Pendência Sancionada" },

        { id: "16", nome: "Letícia Moura", cpf: "75315985275", cidade: "RECIFE", tipoDeficiencia: "Física", statusBeneficio: "Em análise" },
        { id: "17", nome: "Gabriel Souza", cpf: "95135745695", cidade: "CAMARAGIBE", tipoDeficiencia: "Auditiva", statusBeneficio: "Pendente" },
        { id: "18", nome: "Clara Monteiro", cpf: "25836914725", cidade: "CUPIRA", tipoDeficiencia: "Visual", statusBeneficio: "Enviadas para Confecção" },
        { id: "19", nome: "Henrique Barbosa", cpf: "45612378945", cidade: "CABO DE SANTO AGOSTINHO", tipoDeficiencia: "Física", statusBeneficio: "Entregue aos Correios" },
        { id: "20", nome: "Rafaela Queiroz", cpf: "78945612378", cidade: "GOIANA", tipoDeficiencia: "Intelectual", statusBeneficio: "Negado" },

        { id: "21", nome: "Samuel Oliveira", cpf: "14736925814", cidade: "CARUARU", tipoDeficiencia: "Física", statusBeneficio: "Aprovado" },
        { id: "22", nome: "Vitória Lima", cpf: "36914725836", cidade: "LIMOEIRO", tipoDeficiencia: "Visual", statusBeneficio: "Disponível para Retirada" },
        { id: "23", nome: "Renato Gomes", cpf: "74196385274", cidade: "SURUBIM", tipoDeficiencia: "Auditiva", statusBeneficio: "Em análise" },
        { id: "24", nome: "Patrícia Xavier", cpf: "85274196385", cidade: "BEZERROS", tipoDeficiencia: "Física", statusBeneficio: "Pendente" },
        { id: "25", nome: "Diego Farias", cpf: "15945675315", cidade: "OLINDA", tipoDeficiencia: "Visual", statusBeneficio: "Negado" },

        { id: "26", nome: "Yasmin Duarte", cpf: "75325815975", cidade: "RECIFE", tipoDeficiencia: "Física", statusBeneficio: "Aprovado" },
        { id: "27", nome: "Rodrigo Matos", cpf: "95165435795", cidade: "JABOATÃO", tipoDeficiencia: "Auditiva", statusBeneficio: "Entregue" },
        { id: "28", nome: "Beatriz Monte", cpf: "25874136925", cidade: "PAULISTA", tipoDeficiencia: "Visual", statusBeneficio: "Enviadas para Confecção" },
        { id: "29", nome: "Jorge Henrique", cpf: "45678912345", cidade: "PETROLINA", tipoDeficiencia: "Física", statusBeneficio: "Em análise" },
        { id: "30", nome: "Lara Cristina", cpf: "78912345678", cidade: "CAMOCIM DE SÃO FÉLIX", tipoDeficiencia: "Intelectual", statusBeneficio: "Pendência Sancionada" }
    ],
    totalElements: 30
};


// Mapa de status (id -> nome + estilo)
const statusMap = {
    1: { nome: "Em análise", estilo: "bg-yellow-100 text-yellow-800" },
    2: { nome: "Pendente", estilo: "bg-orange-100 text-orange-800" },
    3: { nome: "Negado", estilo: "bg-red-200 text-red-900" },
    4: { nome: "Aprovado", estilo: "bg-green-100 text-green-800" },
    5: { nome: "Entregue", estilo: "bg-blue-100 text-blue-800" },
    6: { nome: "Enviadas para Confecção", estilo: "bg-purple-100 text-purple-800" },
    7: { nome: "Entregue aos Correios", estilo: "bg-teal-100 text-teal-800" },
    8: { nome: "Entregue ao Município", estilo: "bg-indigo-100 text-indigo-800" },
    9: { nome: "Disponível para Retirada", estilo: "bg-sky-100 text-sky-800" },
    10:{ nome: "Pendência Sancionada", estilo: "bg-rose-100 text-rose-800" }
};

// Helper: resolve id e nome do status a partir do objeto beneficiario
function resolveStatus(beneficiario) {
    // Caso já exista statusId (numérico ou string)
    if (beneficiario.statusId !== undefined && beneficiario.statusId !== null) {
        const id = parseInt(beneficiario.statusId, 10);
        return statusMap[id] || { nome: beneficiario.statusBeneficio || "Desconhecido", estilo: "bg-gray-200 text-gray-700" };
    }

    // Se statusBeneficio for número em string, converte
    const asNumber = parseInt(beneficiario.statusBeneficio, 10);
    if (!isNaN(asNumber)) {
        return statusMap[asNumber] || { nome: beneficiario.statusBeneficio, estilo: "bg-gray-200 text-gray-700" };
    }

    // Caso statusBeneficio seja o NOME (ex.: "Em análise"), tenta casar pelo nome (case-insensitive)
    if (typeof beneficiario.statusBeneficio === 'string') {
        const nomeLower = beneficiario.statusBeneficio.trim().toLowerCase();
        for (const key in statusMap) {
            if (statusMap[key].nome.toLowerCase() === nomeLower) {
                return statusMap[key];
            }
        }
        // fallback com o próprio texto
        return { nome: beneficiario.statusBeneficio, estilo: "bg-gray-200 text-gray-700" };
    }

    // Último fallback
    return { nome: "Desconhecido", estilo: "bg-gray-200 text-gray-700" };
}

// Função de filtro (mantive seu comportamento)
function filterBeneficiarios() {
    const nomeFilter = (document.getElementById('search-nome')?.value || '').toLowerCase();
    const cpfFilter = document.getElementById('search-cpf')?.value || '';
    const cidadeFilter = (document.getElementById('search-cidade')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('search-status')?.value || '';

    return beneficiariosData.content.filter(beneficiario => {
        const matchesNome = beneficiario.nome.toLowerCase().includes(nomeFilter);
        const matchesCpf = beneficiario.cpf.includes(cpfFilter);
        const matchesCidade = beneficiario.cidade.toLowerCase().includes(cidadeFilter);

        // Para o filtro de status, suportamos tanto o filtro por nome quanto por id
        if (statusFilter === '') {
            return matchesNome && matchesCpf && matchesCidade;
        }

        // Se o select de filtro tiver value numérico (id), compara id
        const statusFilterNum = parseInt(statusFilter, 10);
        if (!isNaN(statusFilterNum)) {
            // tenta resolver id do beneficiario
            const resolved = resolveStatus(beneficiario);
            // procurar key cujo nome bate com resolved.nome para obter o id
            const matchingId = Object.keys(statusMap).find(k => statusMap[k].nome === resolved.nome);
            return matchesNome && matchesCpf && matchesCidade && (parseInt(matchingId,10) === statusFilterNum);
        } else {
            // se o filtro for por nome (texto), compara case-insensitive
            return matchesNome && matchesCpf && matchesCidade && beneficiario.statusBeneficio.toLowerCase() === statusFilter.toLowerCase();
        }
    });
}

// Carrega a tabela
function loadBeneficiarios() {
    const tableBody = document.getElementById('beneficiarios-table');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const filteredData = filterBeneficiarios();

    filteredData.forEach(beneficiario => {
        const row = document.createElement('tr');

        const infoStatus = resolveStatus(beneficiario);

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${beneficiario.nome}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formatCPF(beneficiario.cpf)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${beneficiario.cidade}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${beneficiario.tipoDeficiencia}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${infoStatus.estilo} px-2 py-1 rounded-full text-xs font-semibold">${infoStatus.nome}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openViewModal('${beneficiario.id}')" class="text-blue-600 hover:text-blue-900 mr-3" title="Ver dados">
                    <i data-feather="eye"></i>
                </button>
                <button onclick="openEditModal('${beneficiario.id}')" class="text-amber-600 hover:text-amber-900 mr-3" title="Editar">
                    <i data-feather="edit"></i>
                </button>
                <button onclick="openDeleteModal('${beneficiario.id}')" class="text-red-600 hover:text-red-900" title="Deletar">
                    <i data-feather="trash-2"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Update counters
    document.getElementById('current-items').textContent = filteredData.length;
    document.getElementById('total-items').textContent = beneficiariosData.content.length;
    document.getElementById('total-count').textContent = beneficiariosData.totalElements;

    // Replace icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// form helpers
function formatCPF(cpf) {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Modal actions
function openViewModal(id) {
    const user = beneficiariosData.content.find(u => u.id === id);
    if (!user) return;

    document.getElementById('view-id').textContent = user.id || '';
    document.getElementById('view-nome').textContent = user.nome || '';
    document.getElementById('view-cpf').textContent = formatCPF(user.cpf) || '';
    document.getElementById('view-cidade').textContent = user.cidade || '';
    document.getElementById('view-deficiencia').textContent = user.tipoDeficiencia || '';

    const infoStatus = resolveStatus(user);
    const viewStatusEl = document.getElementById('view-status');
    if (viewStatusEl) {
        viewStatusEl.className = `${infoStatus.estilo} px-2 py-1 rounded-full text-xs font-semibold`;
        viewStatusEl.textContent = infoStatus.nome;
    }

    const btnEdit = document.getElementById('btn-switch-to-edit');
    if (btnEdit) {
        btnEdit.onclick = function() {
            if (viewModalInstance) viewModalInstance.hide();
            openEditModal(id);
        };
    }

    if (viewModalInstance) viewModalInstance.show();
}

function openEditModal(id) {
    const user = beneficiariosData.content.find(u => u.id === id);
    if (!user) return;

    document.getElementById('edit-id').value = user.id || '';
    document.getElementById('edit-nome').value = user.nome || '';
    document.getElementById('edit-cpf').value = user.cpf || '';
    document.getElementById('edit-cidade').value = user.cidade || '';
    document.getElementById('edit-deficiencia').value = user.tipoDeficiencia || '';

    // pre-seleciona o select de status pelo ID (se possível)
    const select = document.getElementById('edit-status');
    if (select) {
        // tenta resolver id do beneficiário
        let idToSelect = null;
        if (user.statusId !== undefined) idToSelect = String(user.statusId);
        else {
            // tentar achar por nome
            const resolved = resolveStatus(user);
            const matchingId = Object.keys(statusMap).find(k => statusMap[k].nome === resolved.nome);
            if (matchingId) idToSelect = matchingId;
        }
        if (idToSelect !== null) {
            select.value = String(idToSelect);
        } else {
            // se nada, limpa seleção (ou escolhe 1)
            select.value = '';
        }
    }

    if (editModalInstance) editModalInstance.show();
}

function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const userIndex = beneficiariosData.content.findIndex(u => u.id === id);

    if (userIndex > -1) {
        const select = document.getElementById('edit-status');
        const selectedId = select ? parseInt(select.value, 10) : null;
        const selectedName = selectedId && statusMap[selectedId] ? statusMap[selectedId].nome : (select ? select.options[select.selectedIndex].text : '');

        // Atualiza os dados
        beneficiariosData.content[userIndex].nome = document.getElementById('edit-nome').value;
        beneficiariosData.content[userIndex].cpf = document.getElementById('edit-cpf').value;
        beneficiariosData.content[userIndex].cidade = document.getElementById('edit-cidade').value;
        beneficiariosData.content[userIndex].tipoDeficiencia = document.getElementById('edit-deficiencia').value;

        // Salva ambos: id e nome (compatibilidade)
        if (!isNaN(selectedId)) {
            beneficiariosData.content[userIndex].statusId = selectedId;
            beneficiariosData.content[userIndex].statusBeneficio = selectedName;
        } else {
            // fallback: salva o texto atual
            beneficiariosData.content[userIndex].statusBeneficio = document.getElementById('edit-status').value || document.getElementById('edit-status').options[document.getElementById('edit-status').selectedIndex].text;
            delete beneficiariosData.content[userIndex].statusId;
        }

        loadBeneficiarios();
        if (editModalInstance) editModalInstance.hide();
        alert('Dados atualizados com sucesso!');
    }
}

function openDeleteModal(id) {
    document.getElementById('delete-id').value = id;
    if (deleteModalInstance) deleteModalInstance.show();
}

function confirmDelete() {
    const id = document.getElementById('delete-id').value;
    beneficiariosData.content = beneficiariosData.content.filter(u => u.id !== id);
    beneficiariosData.totalElements = beneficiariosData.content.length;
    loadBeneficiarios();
    if (deleteModalInstance) deleteModalInstance.hide();
}

// Inicialização de modais e listeners
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof bootstrap !== 'undefined') {
            const viewEl = document.getElementById('viewModal');
            const editEl = document.getElementById('editModal');
            const delEl = document.getElementById('deleteModal');

            if (viewEl) viewModalInstance = new bootstrap.Modal(viewEl);
            if (editEl) editModalInstance = new bootstrap.Modal(editEl);
            if (delEl) deleteModalInstance = new bootstrap.Modal(delEl);
        } else {
            console.error("Bootstrap JS não foi carregado! Os modais não funcionarão.");
        }
    } catch (e) {
        console.error("Erro ao inicializar Modals:", e);
    }

    // Carrega a tabela
    loadBeneficiarios();

    // Eventos de filtro
    const btnFiltrar = document.getElementById('btn-filtrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', loadBeneficiarios);
    }

    ['search-nome', 'search-cpf', 'search-cidade', 'search-status'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', loadBeneficiarios);
            // para selects, também monitorar change
            if (element.tagName.toLowerCase() === 'select') {
                element.addEventListener('change', loadBeneficiarios);
            }
        }
    });
});
