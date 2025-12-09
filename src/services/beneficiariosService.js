

import { api } from "./api.js";

/**
 * Lista beneficiários com paginação
 * @param {number} page - página (0-based)
 * @param {number} size - tamanho da página
 */
export async function listarBeneficiarios(page = 0, size = 10) {
    const resp = await api.get(`http://localhost:3000/beneficiarios`, {
        params: { page, size }
    });

    return resp.data; // retorna o Page<BeneficiarioDTO>
}
