/**
 * Página de Gestão » Lista de Beneficiários
 *
 * Este módulo, executado no browser (type="module"), é responsável por:
 * - Buscar a lista paginada de beneficiários via serviço HTTP (`listarBeneficiarios`).
 * - Expor o resultado em `window.beneficiariosData` para facilitar debug/integrações leves.
 * - Renderizar a tabela com filtros locais (nome, CPF, cidade, status e datas).
 * - Controlar as ações dos modais (visualização, edição e exclusão simulada).
 *
 * Observações importantes:
 * - A busca é paginada no backend. Nesta tela, usamos o retorno da página atual e
 *   aplicamos filtros no lado do cliente apenas para a visualização.
 * - Para evitar race conditions entre o carregamento dos dados e a renderização da
 *   tabela, a função de inicialização aguarda o carregamento antes de renderizar.
 */

import { listarBeneficiarios } from "../../services/beneficiariosService.js";
import { loadBeneficiarios } from "./renderers.js";
import { createModalHandlers } from "./modals.js";
import { statusMap } from "./utils.js";

// Estado inicial seguro
const __EMPTY_PAGE__ = { content: [], totalElements: 0, number: 0, size: 0, totalPages: 0 };

const state = {
    beneficiariosPage: (typeof window !== 'undefined' && window.beneficiariosData) ? window.beneficiariosData : __EMPTY_PAGE__,
    page: 0,
    size: 10,
    viewModalInstance: null,
    editModalInstance: null,
    deleteModalInstance: null,
    statusMap,
    onChange: null // preenchido abaixo
};

if (typeof window !== 'undefined' && !window.beneficiariosData) window.beneficiariosData = state.beneficiariosPage;

state.onChange = () => {
    loadBeneficiarios(state.beneficiariosPage);
    updatePaginationUI();
};

document.getElementById("btn-buscar-periodo")?.addEventListener('click', async () => {
    const inicio = document.getElementById('search-data-inicio')?.value;
    const fim = document.getElementById('search-data-fim')?.value;
    try {
        await carregarBeneficiarios(inicio, fim, 0);
        state.onChange();
    } catch (e) {
        console.error('Erro ao filtrar por período:', e);
        alert('Erro ao filtrar por período. Verifique o console para detalhes.');
    }
});


/**
 * Carrega beneficiários do backend e atualiza o state.
 */
export async function carregarBeneficiarios( inicio, fim, page = state.page) {
    try {

        if ( !inicio && !fim ) {
            const hoje = new Date();

            // data 30 dias antes
            const antes30 = new Date();
            antes30.setDate(hoje.getDate() - 30);

            // função para formatar yyyy-mm-dd
            const formatar = (data) => {
                return data.toISOString().split('T')[0];
            };

            inicio = formatar(antes30);
            fim = formatar(hoje);
        }


        // atualiza o estado local de página antes da chamada
        state.page = typeof page === 'number' ? page : 0;
        const result = await listarBeneficiarios( inicio, fim, state.page, state.size);
        state.beneficiariosPage = result || __EMPTY_PAGE__;
        if (typeof window !== 'undefined') window.beneficiariosData = state.beneficiariosPage;
        return result;
    } catch (err) {
        console.error('Erro ao carregar beneficiários:', err);
        if (typeof window !== 'undefined' && !window.beneficiariosData) window.beneficiariosData = __EMPTY_PAGE__;
        state.beneficiariosPage = window.beneficiariosData || __EMPTY_PAGE__;
        throw err;
    }
}

// Atualiza os elementos da UI de paginação (texto, ranges, botões)
function updatePaginationUI() {
    const pageData = state.beneficiariosPage || __EMPTY_PAGE__;
    const page = Number(pageData.number || 0);
    const size = Number(pageData.size || state.size || 0);
    const total = Number(pageData.totalElements || 0);
    const totalPages = Number(pageData.totalPages || 0);

    const start = total > 0 && size > 0 ? (page * size) + 1 : 0;
    const end = total > 0 && size > 0 ? Math.min(start + size - 1, total) : 0;

    const elStart = document.getElementById('range-start');
    const elEnd = document.getElementById('range-end');
    const elTotal = document.getElementById('total-count');
    const elInfo = document.getElementById('page-info');
    const selSize = document.getElementById('page-size');
    const btnFirst = document.getElementById('btn-first');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnLast = document.getElementById('btn-last');

    if (elStart) elStart.textContent = String(start);
    if (elEnd) elEnd.textContent = String(end);
    if (elTotal) elTotal.textContent = String(total);
    if (elInfo) elInfo.textContent = `Página ${totalPages ? (page + 1) : 1} de ${Math.max(totalPages, 1)}`;
    if (selSize && Number(selSize.value) !== Number(state.size)) selSize.value = String(state.size);

    const disableFirstPrev = totalPages <= 1 || page <= 0;
    const disableNextLast = totalPages <= 1 || page >= (totalPages - 1);

    if (btnFirst) btnFirst.disabled = disableFirstPrev;
    if (btnPrev) btnPrev.disabled = disableFirstPrev;
    if (btnNext) btnNext.disabled = disableNextLast;
    if (btnLast) btnLast.disabled = disableNextLast;
}



// Cria handlers dos modais com o state (será inicializado após DOM ready)
let handlers = null;

// Wrapper para a função de render usada pelos listeners inline
function renderWrapper() {
    loadBeneficiarios(state.beneficiariosPage);
    updatePaginationUI();
}

// Inicialização quando DOM estiver disponível
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa as instâncias de modal do Bootstrap (se presente)
    try {
        if (typeof bootstrap !== 'undefined') {
            const viewEl = document.getElementById('viewModal');
            const editEl = document.getElementById('editModal');
            const delEl = document.getElementById('deleteModal');
            if (viewEl) state.viewModalInstance = new bootstrap.Modal(viewEl);
            if (editEl) state.editModalInstance = new bootstrap.Modal(editEl);
            if (delEl) state.deleteModalInstance = new bootstrap.Modal(delEl);
        }
    } catch (e) {
        console.error('Erro ao inicializar modais bootstrap', e);
    }

    // cria handlers com referência ao state
    handlers = createModalHandlers(state);

    // expõe handlers globalmente para compatibilidade com handlers inline no HTML
    if (typeof window !== 'undefined') {
        window.openCarteiraModal = handlers.openCarteiraModal;
        window.openViewModal = handlers.openViewModal;
        window.openEditModal = handlers.openEditModal;
        window.saveEdit = handlers.saveEdit;
        window.openDeleteModal = handlers.openDeleteModal;
        window.confirmDelete = handlers.confirmDelete;
        window.loadBeneficiarios = renderWrapper;
    }

    // tenta carregar dados e renderizar
    try {
        await carregarBeneficiarios(null,null,0);
    } catch (e) {
        // carregarBeneficiarios já loga/lança; continuamos com estado vazio
    }

    renderWrapper();

    // liga eventos de filtros
    const btnFiltrar = document.getElementById('btn-filtrar');
    if (btnFiltrar) btnFiltrar.addEventListener('click', renderWrapper);

    ['search-nome', 'search-cpf', 'search-cidade', 'search-status'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', renderWrapper);
        if (el.tagName.toLowerCase() === 'select') el.addEventListener('change', renderWrapper);
    });

    // Handlers de paginação
    const btnFirst = document.getElementById('btn-first');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnLast = document.getElementById('btn-last');
    const selSize = document.getElementById('page-size');

    if (btnFirst) btnFirst.addEventListener('click', async () => {
        state.page = 0;
        await carregarBeneficiarios(state.page);
        renderWrapper();
    });

    if (btnPrev) btnPrev.addEventListener('click', async () => {
        const current = Number(state.beneficiariosPage?.number || state.page || 0);
        state.page = Math.max(0, current - 1);
        await carregarBeneficiarios(state.page);
        renderWrapper();
    });

    if (btnNext) btnNext.addEventListener('click', async () => {
        const current = Number(state.beneficiariosPage?.number || state.page || 0);
        const totalPages = Number(state.beneficiariosPage?.totalPages || 0);
        state.page = Math.min(Math.max(totalPages - 1, 0), current + 1);
        await carregarBeneficiarios(state.page);
        renderWrapper();
    });

    if (btnLast) btnLast.addEventListener('click', async () => {
        const totalPages = Number(state.beneficiariosPage?.totalPages || 0);
        state.page = Math.max(totalPages - 1, 0);
        await carregarBeneficiarios(state.page);
        renderWrapper();
    });

    if (selSize) selSize.addEventListener('change', async (e) => {
        const newSize = parseInt(e.target.value, 10);
        if (!isNaN(newSize) && newSize > 0) {
            state.size = newSize;
            state.page = 0; // reinicia na primeira página ao alterar o tamanho
            await carregarBeneficiarios(state.page);
            renderWrapper();
        }
    });

    // primeira atualização de UI
    updatePaginationUI();
});
