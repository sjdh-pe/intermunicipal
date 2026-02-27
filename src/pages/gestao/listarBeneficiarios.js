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
import Swal from "https://esm.sh/sweetalert2@11";

// Estado inicial seguro
const __EMPTY_PAGE__ = { content: [], totalElements: 0, number: 0, size: 0, totalPages: 0 };

const state = {
    beneficiariosPage: (typeof window !== 'undefined' && window.beneficiariosData) ? window.beneficiariosData : __EMPTY_PAGE__,
    page: 0,
    size: 10,
    // Agora guardamos TODOS os parâmetros da pesquisa no estado para a paginação funcionar
    currentInicio: null, 
    currentFim: null,
    currentNome: '',
    currentCpf: '',
    currentCidade: '',
    currentStatus: '',
    viewModalInstance: null,
    editModalInstance: null,
    deleteModalInstance: null,
    statusMap,
    onChange: null
};

if (typeof window !== 'undefined' && !window.beneficiariosData) window.beneficiariosData = state.beneficiariosPage;

state.onChange = () => {
    loadBeneficiarios(state.beneficiariosPage);
    updatePaginationUI();
};

//buscar api
// Ação do Botão "Buscar" (Pesquisa Direta na API)
document.getElementById("btn-buscar-periodo")?.addEventListener('click', async () => {
    // 1. Pega os valores digitados na tela
    const inicio = document.getElementById('pesquisa-data-inicio')?.value;
    const fim = document.getElementById('pesquisa-data-fim')?.value;
    const nome = document.getElementById('pesquisa-nome')?.value || '';
    const cpf = document.getElementById('pesquisa-cpf')?.value || '';
    const cidade = document.getElementById('pesquisa-cidade')?.value || '';
    const status = document.getElementById('pesquisa-status')?.value || '';

    // 2. Coloca um alerta de carregamento para o usuário não clicar duas vezes
    Swal.fire({
        title: 'Buscando...',
        text: 'Aguarde enquanto consultamos os beneficiários.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        // 3. Envia os parâmetros para o Backend (A página volta para 0 numa nova pesquisa)
        await carregarBeneficiarios(inicio, fim, nome, cpf, cidade, status, 0);

        // 4. Limpa os campos do bloco de "Filtro Visual" (direita) para não bugar a tabela
        ['search-nome', 'search-cpf', 'search-cidade', 'search-status'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        // 5. Renderiza a tabela e fecha o modal
        state.onChange();
        Swal.close();

    } catch (e) {
        Swal.fire({
            title: 'Erro na Pesquisa',
            text: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
});


/**
 * Carrega beneficiários do backend enviando todos os filtros e atualiza o state.
 */
export async function carregarBeneficiarios(inicio, fim, nome = '', cpf = '', cidade = '', status = '', page = state.page) {
    try {
        // Se as datas não foram passadas, usa as salvas ou pega os últimos 30 dias
        if (!inicio && !fim) {
            if (state.currentInicio && state.currentFim) {
                inicio = state.currentInicio;
                fim = state.currentFim;
            } else {
                const hoje = new Date();
                const antes30 = new Date();
                antes30.setDate(hoje.getDate() - 30);
                
                const formatar = (data) => data.toISOString().split('T')[0];
                inicio = formatar(antes30);
                fim = formatar(hoje);
            }
        }

        // Atualiza o estado local para garantir que a paginação mantenha a mesma pesquisa
        state.currentInicio = inicio;
        state.currentFim = fim;
        state.currentNome = nome;
        state.currentCpf = cpf;
        state.currentCidade = cidade;
        state.currentStatus = status;
        state.page = typeof page === 'number' ? page : 0;

        // IMPORTANTE: Sua função listarBeneficiarios precisa aceitar esses novos parâmetros!
        const result = await listarBeneficiarios(
            state.currentInicio, 
            state.currentFim, 
            state.currentNome, 
            state.currentCpf, 
            state.currentCidade, 
            state.currentStatus, 
            state.page, 
            state.size
        );

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

// Atualiza a Paginação
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

// Lógica dos botões de período rápido

const botoesPeriodo = document.querySelectorAll('.btn-periodo');
const inputDataInicio = document.getElementById('pesquisa-data-inicio');
const inputDataFim = document.getElementById('pesquisa-data-fim');

botoesPeriodo.forEach(botao => {
    botao.addEventListener('click', (e) => {
        // 1. Remove o estado "ativo" (fundo verde) de todos os botões
        botoesPeriodo.forEach(b => {
            b.classList.remove('bg-green-600', 'text-white');
            b.classList.add('text-green-600');
        });

        // 2. Coloca o estado "ativo" no botão que foi clicado
        const botaoClicado = e.currentTarget;
        botaoClicado.classList.remove('text-green-600');
        botaoClicado.classList.add('bg-green-600', 'text-white');

        // 3. Calcula as datas baseadas na quantidade de dias do botão
        const dias = parseInt(botaoClicado.getAttribute('data-dias'), 10);
        
        const dataHoje = new Date();
        const dataAnterior = new Date();
        dataAnterior.setDate(dataHoje.getDate() - dias);

        // Formata a data para YYYY-MM-DD (Padrão do Input)
        const formatarData = (data) => data.toISOString().split('T')[0];

        // 4. Preenche os campos de input automaticamente
        if (inputDataInicio && inputDataFim) {
            inputDataInicio.value = formatarData(dataAnterior);
            inputDataFim.value = formatarData(dataHoje);
        }
    });
});

// Setup de Modais e Inicialização
let handlers = null;

function renderWrapper() {
    loadBeneficiarios(state.beneficiariosPage);
    updatePaginationUI();
}

document.addEventListener('DOMContentLoaded', async () => {
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
        console.error('Erro ao inicializar modais', e);
    }

    handlers = createModalHandlers(state);

    if (typeof window !== 'undefined') {
        window.openCarteiraModal = handlers.openCarteiraModal;
        window.openViewModal = handlers.openViewModal;
        window.openEditModal = handlers.openEditModal;
        window.saveEdit = handlers.saveEdit;
        window.openDeleteModal = handlers.openDeleteModal;
        window.confirmDelete = handlers.confirmDelete;
        window.loadBeneficiarios = renderWrapper;
        window.downloadCarteiraPdf = handlers.downloadCarteiraPdf;
        window.enviarCarteiraEmail = handlers.enviarCarteiraEmail;
    }

    try {
        // Carrega inicial sem filtros textuais
        await carregarBeneficiarios(null, null, '', '', '', '', 0);
    } catch (e) {}

    renderWrapper();

    // Filtros rápidos visuais da direita continuam existindo para filtrar a tela localmente se o usuário desejar
    const btnFiltrar = document.getElementById('btn-filtrar');
    if (btnFiltrar) btnFiltrar.addEventListener('click', renderWrapper);

    ['search-nome', 'search-cpf', 'search-cidade', 'search-status'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', renderWrapper);
        if (el.tagName.toLowerCase() === 'select') el.addEventListener('change', renderWrapper);
    });

    
    const btnFirst = document.getElementById('btn-first');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnLast = document.getElementById('btn-last');
    const selSize = document.getElementById('page-size');

    const recarregarPagina = async () => {
        await carregarBeneficiarios(state.currentInicio, state.currentFim, state.currentNome, state.currentCpf, state.currentCidade, state.currentStatus, state.page);
        renderWrapper();
    };

    if (btnFirst) btnFirst.addEventListener('click', () => { state.page = 0; recarregarPagina(); });
    if (btnPrev) btnPrev.addEventListener('click', () => { state.page = Math.max(0, state.page - 1); recarregarPagina(); });
    if (btnNext) btnNext.addEventListener('click', () => { state.page = Math.min(state.beneficiariosPage.totalPages - 1, state.page + 1); recarregarPagina(); });
    if (btnLast) btnLast.addEventListener('click', () => { state.page = Math.max(state.beneficiariosPage.totalPages - 1, 0); recarregarPagina(); });

    if (selSize) selSize.addEventListener('change', (e) => {
        const newSize = parseInt(e.target.value, 10);
        if (!isNaN(newSize) && newSize > 0) {
            state.size = newSize;
            state.page = 0; 
            recarregarPagina();
        }
    });

    updatePaginationUI();
});