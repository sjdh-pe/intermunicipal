import { resolveStatus } from './utils.js';

/**
 * Aplica filtros locais (nome, CPF, cidade, status e período de dataCadastro)
 * sobre os dados da página atual fornecidos em `beneficiariosPage`.
 * Função pura: recebe dados e retorna lista filtrada.
 *
 * @param {object} beneficiariosPage - objeto Page com `content: []`
 * @param {object} [opts] - opções de filtros (opcional, por padrão lê DOM)
 * @returns {Array<object>} Lista filtrada
 */
export function filterBeneficiarios(beneficiariosPage, opts = {}) {
    if (!beneficiariosPage || !Array.isArray(beneficiariosPage.content)) return [];

    const nomeFilter = (opts.nome ?? document.getElementById('search-nome')?.value ?? '').toLowerCase();
    const cpfFilter = (opts.cpf ?? document.getElementById('search-cpf')?.value ?? '');
    const cidadeFilter = (opts.cidade ?? document.getElementById('search-cidade')?.value ?? '').toLowerCase();
    const statusFilter = (opts.status ?? document.getElementById('search-status')?.value ?? '');
    const dataInicioVal = (opts.dataInicio ?? document.getElementById('search-data-inicio')?.value ?? '');
    const dataFimVal = (opts.dataFim ?? document.getElementById('search-data-fim')?.value ?? '');

    return beneficiariosPage.content.filter(beneficiario => {
        const nome = (beneficiario.nome || '').toLowerCase();
        const matchesNome = nome.includes(nomeFilter);
        const matchesCpf = String(beneficiario.cpf || '').includes(cpfFilter);
        const matchesCidade = (beneficiario.cidade || '').toLowerCase().includes(cidadeFilter);

        // Status filter
        let matchesStatus = true;
        if (statusFilter !== '') {
            const statusFilterNum = parseInt(statusFilter, 10);
            if (!isNaN(statusFilterNum)) {
                const resolved = resolveStatus(beneficiario);
                const selectedText = document.getElementById('search-status')?.selectedOptions?.[0]?.text || String(statusFilterNum);
                matchesStatus = resolved.nome === selectedText;
            } else {
                matchesStatus = String(beneficiario.statusBeneficio || '').toLowerCase() === statusFilter.toLowerCase();
            }
        }

        // Date filter
        let matchesData = true;
        if (beneficiario.dataCadastro) {
            const itemDate = new Date(beneficiario.dataCadastro);
            itemDate.setHours(0,0,0,0);
            if (dataInicioVal) {
                const start = new Date(dataInicioVal); start.setHours(0,0,0,0);
                if (itemDate < start) matchesData = false;
            }
            if (dataFimVal) {
                const end = new Date(dataFimVal); end.setHours(0,0,0,0);
                if (itemDate > end) matchesData = false;
            }
        }

        return matchesNome && matchesCpf && matchesCidade && matchesStatus && matchesData;
    });
}
