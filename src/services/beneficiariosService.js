
import { api } from "api.js";

/**
 * Lista beneficiários com paginação
 * @param {number} page - página (0-based)
 * @param {number} size - tamanho da página
 */
export async function listarBeneficiarios(page = 0, size = 10) {
    const resp = await api.get(`/beneficiarios`, {
        params: { page, size }
    });

    return resp.data; // retorna o Page<BeneficiarioDTO>
}

/**
 * Cadastra um beneficiário
 * @param {Object} beneficiario - objeto do beneficiário a ser enviado
 */
export async function cadastrarBeneficiario(beneficiario) {
    const resp = await api.post(`/beneficiarios`, beneficiario);
    return resp.data; // retorna o beneficiário criado
}