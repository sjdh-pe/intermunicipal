

import { api } from "./api.js";

/**
 * Lista beneficiários com paginação
 * @param {number} page - página (0-based)
 * @param {number} size - tamanho da página
 */
export async function listarBeneficiarios(page = 0, size = 10) {

    const resp = await api.get(`/beneficiarios`, {
        params: { page, size }
    });

    return resp.data;
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
 * Upload de arquivo do beneficiário (equivalente ao curl que funciona)
 * @param {string} id - Identificador do beneficiário (UUID)
 * @param {number} tipoArquivoId - id_tipo_arquivo (1 = RG, 2 = CPF, etc.)
 * @param {File} file - Arquivo a ser enviado
 */
export async function uploadArquivoBeneficiario(id, tipoArquivoId, file) {
    const formData = new FormData();
    formData.append("file", file); // 👈 nome do campo igual ao -F 'file=@...' do curl

    const resp = await api.post(
        "/upload",
        formData,
        {
            // params → vira ?id=...&id_tipo_arquivo=...
            params: {
                id: id,
                id_tipo_arquivo: tipoArquivoId
            },
            // NÃO precisa setar Content-Type, o axios/browser faz isso com boundary
             headers: { "Content-Type": "multipart/form-data" }
        }
    );
    return resp.data;
}


/**
 * Obtém o do status atual do beneficiário
 * @param {string} id - Identificador do beneficiário
 * @returns {Promise<string>} Motivo do status atual
 */
export async function motivoBeneficiario(id) {

    const resp = await api.get(`/beneficiarios/${id}/historico-status/atual`);
    console.log(resp.data.motivo)
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
    console.log(data)
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