

import { api } from "./api.js";

/**
 * Lista beneficiários com paginação e filtros avançados para a API
 */
export async function listarBeneficiarios(inicio, fim, nome = '', cpf = '', cidade = '', status = '', page = 0, size = 10) {
    
    // Inicia com os parâmetros obrigatórios
    const queryParams = {
        page: page,
        size: size
    };

    // Adiciona os filtros dinamicamente apenas se estiverem preenchidos
    if (nome && nome.trim() !== '') {
        queryParams.nome = nome.trim();
    }

    if (cpf && cpf.trim() !== '') {
        // Remove pontos e traços do CPF para enviar só os números para a API
        const cpfLimpo = cpf.replace(/\D/g, ''); 
        if (cpfLimpo) queryParams.cpf = cpfLimpo;
    }

    if (cidade && cidade.trim() !== '') {
        queryParams.cidadeNome = cidade.trim(); // Padrão que a API espera
    }

    if (status && status !== '') {
        queryParams.statusBeneficioId = status; // Padrão que a API espera
    }

    if (inicio && inicio !== '') {
        queryParams.inicio = inicio;
    }

    if (fim && fim !== '') {
        queryParams.fim = fim;
    }

    try {

        const resp = await api.get(`/beneficiarios`, {
            params: queryParams
        });

        return resp.data;
    } catch (error) {
        console.error("❌ Erro ao buscar beneficiários na API:", error);
        throw error;
    }
}


/** Lista links de arquivos de um beneficiário
* @param {string} id - Identificador do beneficiário
*/
export async function listarArquivosBeneficiario(id) {

    const resp = await api.get(`/beneficiarios/${id}/arquivos`);

    return resp.data;
}

/**
 * Cadastra um novo beneficiário
 * @param {object} payload - dados do beneficiário a ser cadastrado
 */
export async function cadastrarBeneficiario(payload) {

    const resp = await api.post(`/beneficiarios`, payload);
    return resp.data;

}
/**
 * Cadastra Responsavel do Beneficiario
 * @param {object} payload - dados do responsavel a ser cadastrado
 */
export async function cadastrarResponsavelBeneficiario(payload) {

    const resp = await api.post(`/responsaveis`, payload);
    return resp.data;
}

/**
 * Upload de arquivo do beneficiário (equivalente ao curl que funciona)
 * @param {string} id - Identificador do beneficiário (UUID)
 * @param {number} tipoArquivoId - id_tipo_arquivo (1 = RG, 2 = CPF, etc.)
 * @param {File} file - Arquivo a ser enviado
 */
export async function uploadArquivoBeneficiario(id, tipoArquivoId, file) {

    if (!(file instanceof File)) {
        throw new Error("Arquivo inválido: file não é File. Verifique o input.files[0].");
    }

    const formData = new FormData();
    formData.append("file", file);

    const resp = await api.post("/upload", formData, {
        params: { id, id_tipo_arquivo: tipoArquivoId },
        timeout: 0,
        headers: { "Content-Type": "multipart/form-data" },
    });

    return resp.data;
}

/**
 * Enviar e-mail confirmação cadastro
 * @param {object} beneficiario - beneficiário cadastrado
 */
export async function enviarEmailConfirmacao(beneficiario) {
    const resp = await api.post('/email/confirmacao-cadastro', {
        to: beneficiario.email,
        nomeBeneficiario: beneficiario.nome,
        cpf: beneficiario.cpf
    });
    return resp.data || true;
}


/**
 * Enviar e-mail de aprovação do benefício
 * @param {object} beneficiario - beneficiário
 */
export async function enviarEmailAprovado(beneficiario) {
    const resp = await api.post('/email/cadastro-aprovado', {
        to: beneficiario.email,
        nomeBeneficiario: beneficiario.nome,
        cpf: beneficiario.cpf,
        localRetirada: beneficiario.localRetirada || '',
        linkCarteirinha: `${api.urlapi}/beneficiarios/${beneficiario.id}/carteirinha`
    });
    return resp.data;
}

/**
 * Enviar e-mail com cartão digital (2ª via)
 * @param {object} beneficiario - beneficiário
 */
export async function enviarEmailViaDigital(beneficiario) {
    const resp = await api.post('/email/cadastro-aprovado', {
        to: beneficiario.email,
        nomeBeneficiario: beneficiario.nome,
        cpf: beneficiario.cpf,
        localRetirada: beneficiario.localRetirada || '',
        linkCarteirinha: `${api.urlapi}/beneficiarios/${beneficiario.id}/carteirinha`
    });
    return resp.data;
}


/**
 * Obtém o do status atual do beneficiário
 * @param {string} id - Identificador do beneficiário
 * @returns {Promise<string>} Motivo do status atual
 */
export async function motivoBeneficiario(id) {

    const resp = await api.get(`/beneficiarios/${id}/historico-status/atual`);
    return resp.data.motivo;
}


/**
 * Atualiza os dados de um beneficiário.
 *
 * Observação: por padrão utilizamos PUT em `../beneficiarios/{id}`.
 * Caso sua API utilize PATCH ou outro caminho, avise para ajustarmos aqui.
 *
 * @param {string|number} id - Identificador do beneficiário a ser atualizado
 * @param {object} data - Campos a atualizar (ex.: { nome, cpf, cidade, tipoDeficiencia, statusId })
 * @returns {Promise<object>} Objeto do beneficiário atualizado (conforme retorno da API)
 */
export async function atualizarBeneficiario(id, data) {

    if (id === undefined || id === null) {
        throw new Error("É obrigatório informar o 'id' do beneficiário para atualização.");
    }
    const url = `/beneficiarios/${id}`;
    const resp = await api.put(url, data);
    return resp.data;
}

/**
 * add historico ao beneficiario
 *
 * @param {string|number} id - Identificador do beneficiário a ser atualizado
 * @param {object} data - Campos a atualizar (ex.: { motivo})
 * @returns {Promise<object>} Objeto do beneficiário atualizado (conforme retorno da API)
 */
export async function atualizarBeneficiarioStatus(id, data) {

    if (id === undefined || id === null) {
        throw new Error("É obrigatório informar o 'id' do beneficiário para atualização.");
    }
    const motivo = data?.motivo;

    // garante string
    if (typeof motivo !== "string" || motivo.trim().length === 0) {
        // escolha: return false, throw, ou mostrar msg no UI
        return false;
    }

    const statusBeneficioId = data?.statusBeneficioId;
    if (statusBeneficioId === undefined || statusBeneficioId === null) {
        throw new Error("É obrigatório informar 'statusBeneficioId'.");
    }

    const url = `/beneficiarios/${id}/status/${statusBeneficioId}/motivos`;

    const resp = await api.post(url, { motivo: motivo.trim() });
    return resp.data;

}

/**
 *  Valida Beneficiário
 *
 *  @param {string} idBeneficiario - ID do beneficiário
 *  @returns {Promise<object>} Objeto do beneficiário atualizado (conforme retorno da API)
 */
export async function validarBeneficiario(idBeneficiario) {


    const resp = await api.get(
        `/beneficiarios/${encodeURIComponent(idBeneficiario)}/validar`
    );

    return resp.data;
}
/**
 * Valida um único arquivo
 *
 * @param {File} file - Arquivo selecionado
 * @param {number} maxSizeMB - Tamanho máximo em MB
 * @param {string[]} allowedTypes - Tipos MIME permitidos
 * @param {string[]} allowedExtensions - Extensões permitidas (sem ponto)
 * @returns {string|null} Mensagem de erro ou null se estiver válido
 */
export function validarArquivo(
    file,
    maxSizeMB = 5,
    allowedTypes = [],
    allowedExtensions = []
) {
    if (!file) {
        return "Nenhum arquivo selecionado.";
    }

    // tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return `O arquivo excede o tamanho máximo de ${maxSizeMB}MB.`;
    }

    // tipo MIME
    if (allowedTypes.length && !allowedTypes.includes(file.type)) {
        return "Tipo de arquivo não permitido.";
    }

    // extensão
    const ext = file.name.split(".").pop().toLowerCase();
    if (allowedExtensions.length && !allowedExtensions.includes(ext)) {
        return "Extensão de arquivo não permitida.";
    }

    return null; // válido ✅
}