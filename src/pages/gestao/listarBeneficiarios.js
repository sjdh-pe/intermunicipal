import { listarBeneficiarios } from "../../services/beneficiariosService.js";
import { loadBeneficiarios } from "./renderers.js";
import { createModalHandlers } from "./modals.js";
import { statusMap } from "./utils.js";
import Swal from "https://esm.sh/sweetalert2@11";

const __EMPTY_PAGE__ = { content: [], totalElements: 0, number: 0, size: 0, totalPages: 0 };

const state = {
    beneficiariosPage: __EMPTY_PAGE__,
    page: 0,
    size: 10,
    currentInicio: null,
    currentFim:    null,
    currentNome:   '',
    currentCpf:    '',
    currentCidade: '',
    currentStatus: '',
    viewModalInstance:   null,
    editModalInstance:   null,
    deleteModalInstance: null,
    statusMap,
    onChange: null,
};

if (typeof window !== 'undefined') window.beneficiariosData = state.beneficiariosPage;

state.onChange = () => {
    loadBeneficiarios(state.beneficiariosPage);
    updatePaginationUI();
};

export async function carregarBeneficiarios(inicio, fim, nome = '', cpf = '', cidade = '', status = '', page = state.page) {
    if (!inicio && !fim) {
        if (state.currentInicio && state.currentFim) {
            inicio = state.currentInicio;
            fim    = state.currentFim;
        } else {
            const hoje  = new Date();
            const antes = new Date();
            antes.setDate(hoje.getDate() - 30);
            const fmt = d => d.toISOString().split('T')[0];
            inicio = fmt(antes);
            fim    = fmt(hoje);
        }
    }

    state.currentInicio = inicio;
    state.currentFim    = fim;
    state.currentNome   = typeof nome === 'string' ? nome : '';
    state.currentCpf    = cpf;
    state.currentCidade = cidade;
    state.currentStatus = status;
    state.page          = typeof page === 'number' ? page : 0;

    const result = await listarBeneficiarios(
        state.currentInicio, state.currentFim,
        state.currentNome,   state.currentCpf,
        state.currentCidade, state.currentStatus,
        state.page, state.size
    );

    state.beneficiariosPage = result || __EMPTY_PAGE__;
    if (typeof window !== 'undefined') window.beneficiariosData = state.beneficiariosPage;
    return result;
}

function getFilterValues() {
    return {
        inicio: document.getElementById('filter-data-inicio')?.value || null,
        fim:    document.getElementById('filter-data-fim')?.value    || null,
        nome:   document.getElementById('filter-nome')?.value    || '',
        cpf:    document.getElementById('filter-cpf')?.value     || '',
        cidade: document.getElementById('filter-cidade')?.value  || '',
        status: document.getElementById('filter-status')?.value  || '',
    };
}

function render() {
    loadBeneficiarios(state.beneficiariosPage);
    updatePaginationUI();
}

async function buscar(page = 0) {
    const { inicio, fim, nome, cpf, cidade, status } = getFilterValues();
    try {
        await carregarBeneficiarios(inicio, fim, nome, cpf, cidade, status, page);
    } catch (_) {
        Swal.fire({
            title: 'Erro na Busca',
            text: 'Não foi possível conectar ao servidor.',
            icon: 'error',
            confirmButtonText: 'OK',
        });
        return;
    }
    render();
}

function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

function updatePaginationUI() {
    const pd         = state.beneficiariosPage || __EMPTY_PAGE__;
    const page       = Number(pd.number        || 0);
    const size       = Number(pd.size          || state.size || 0);
    const total      = Number(pd.totalElements || 0);
    const totalPages = Number(pd.totalPages    || 0);

    const start = total > 0 ? (page * size) + 1 : 0;
    const end   = total > 0 ? Math.min(start + size - 1, total) : 0;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
    set('range-start', start);
    set('range-end',   end);
    set('total-count', total);
    set('page-info', `Página ${totalPages ? page + 1 : 1} de ${Math.max(totalPages, 1)}`);

    const selSize = document.getElementById('page-size');
    if (selSize && Number(selSize.value) !== state.size) selSize.value = String(state.size);

    const disablePrev = totalPages <= 1 || page <= 0;
    const disableNext = totalPages <= 1 || page >= totalPages - 1;
    ['btn-first', 'btn-prev'].forEach(id => { const el = document.getElementById(id); if (el) el.disabled = disablePrev; });
    ['btn-next',  'btn-last'].forEach(id => { const el = document.getElementById(id); if (el) el.disabled = disableNext; });
}

// Botões de período rápido — registrados fora do DOMContentLoaded pois o módulo carrega ao final do <body>
document.querySelectorAll('.btn-periodo').forEach(btn => {
    btn.addEventListener('click', e => {
        document.querySelectorAll('.btn-periodo').forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('text-blue-600');
        });
        const b = e.currentTarget;
        b.classList.remove('text-blue-600');
        b.classList.add('bg-blue-600', 'text-white');

        const dias  = parseInt(b.getAttribute('data-dias'), 10);
        const hoje  = new Date();
        const antes = new Date();
        antes.setDate(hoje.getDate() - dias);
        const fmt = d => d.toISOString().split('T')[0];

        const elInicio = document.getElementById('filter-data-inicio');
        const elFim    = document.getElementById('filter-data-fim');
        if (elInicio) elInicio.value = fmt(antes);
        if (elFim)    elFim.value    = fmt(hoje);
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa instâncias dos modais Bootstrap
    try {
        if (typeof bootstrap !== 'undefined') {
            const viewEl = document.getElementById('viewModal');
            const editEl = document.getElementById('editModal');
            const delEl  = document.getElementById('deleteModal');
            if (viewEl) state.viewModalInstance   = new bootstrap.Modal(viewEl);
            if (editEl) state.editModalInstance   = new bootstrap.Modal(editEl);
            if (delEl)  state.deleteModalInstance = new bootstrap.Modal(delEl);
        }
    } catch (e) { console.error('Erro ao inicializar modais', e); }

    const handlers = createModalHandlers(state);

    if (typeof window !== 'undefined') {
        window.openCarteiraModal   = handlers.openCarteiraModal;
        window.openViewModal       = handlers.openViewModal;
        window.openEditModal       = handlers.openEditModal;
        window.saveEdit            = handlers.saveEdit;
        window.openDeleteModal     = handlers.openDeleteModal;
        window.confirmDelete       = handlers.confirmDelete;
        window.loadBeneficiarios   = render;
        window.downloadCarteiraPdf = handlers.downloadCarteiraPdf;
        window.enviarCarteiraEmail = handlers.enviarCarteiraEmail;
    }

    // Carga inicial (últimos 30 dias)
    try { await carregarBeneficiarios(null, null, '', '', '', '', 0); } catch (_) {}
    render();

    // Botão buscar
    document.getElementById('btn-buscar')?.addEventListener('click', () => buscar(0));

    // Botão limpar
    document.getElementById('btn-limpar')?.addEventListener('click', () => {
        ['filter-data-inicio', 'filter-data-fim', 'filter-nome', 'filter-cpf', 'filter-cidade'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        const sel = document.getElementById('filter-status');
        if (sel) sel.value = '';
        document.querySelectorAll('.btn-periodo').forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('text-blue-600');
        });
        buscar(0);
    });

    // Busca automática com debounce nos campos de texto
    const debouncedBuscar = debounce(() => buscar(0), 500);
    ['filter-nome', 'filter-cpf', 'filter-cidade'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', debouncedBuscar);
    });

    // Busca imediata ao mudar select e datas
    document.getElementById('filter-status')?.addEventListener('change',      () => buscar(0));
    document.getElementById('filter-data-inicio')?.addEventListener('change', () => buscar(0));
    document.getElementById('filter-data-fim')?.addEventListener('change',    () => buscar(0));

    // Paginação
    document.getElementById('btn-first')?.addEventListener('click', () => buscar(0));
    document.getElementById('btn-prev')?.addEventListener('click',  () => buscar(Math.max(0, state.page - 1)));
    document.getElementById('btn-next')?.addEventListener('click',  () => buscar(Math.min(state.beneficiariosPage.totalPages - 1, state.page + 1)));
    document.getElementById('btn-last')?.addEventListener('click',  () => buscar(Math.max(state.beneficiariosPage.totalPages - 1, 0)));

    document.getElementById('page-size')?.addEventListener('change', e => {
        const newSize = parseInt(e.target.value, 10);
        if (!isNaN(newSize) && newSize > 0) {
            state.size = newSize;
            buscar(0);
        }
    });

    updatePaginationUI();
});
