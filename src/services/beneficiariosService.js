

import { api } from "./api.js";

/**
 * Lista beneficiários com paginação e filtros avançados
 * @param {string} inicio - data inicial (formato YYYY-MM-DD)
 * @param {string} fim - data final (formato YYYY-MM-DD)
 * @param {string} nome - filtro por nome
 * @param {string} cpf - filtro por cpf
 * @param {string} cidade - filtro por cidade
 * @param {string} status - filtro por status do benefício
 * @param {number} page - página (0-based)
 * @param {number} size - tamanho da página
 */
export async function listarBeneficiarios(inicio, fim, nome = '', cpf = '', cidade = '', status = '', page = 0, size = 10) {

    // Objeto com os parâmetros que serão adicionados na URL
    const queryParams = {
        page,
        size
    };

    const resp = await api.get(`/beneficiarios`, {
        params: queryParams
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
 * */
export async function enviarEmailConfirmacao(beneficiario) {

    const body = `Prezado(a), ${beneficiario.nome}

Confirmamos o recebimento do seu cadastro e da documentação anexa para a solicitação do Cartão PE Livre Acesso Intermunicipal.

Seus dados foram enviados com sucesso para a equipe da a Secretaria Executiva de Promoção dos Direitos da Pessoa com Deficiência, para análise e elaboração da Cartão PE Livre Acesso Intermunicipal.

O que acontece agora?

Nossa equipe irá verificar se todos os documentos (Laudo Médico, RG, CPF, Comprovante de Residência e Foto) estão em conformidade com a Lei Estadual nº 12.045/2001.

Prazo de Análise: O prazo máximo para análise e emissão é de até 90 dias.

Você receberá um novo e-mail assim que houver uma atualização no status do seu pedido (Aprovado, Pendente ou Indeferido).

Caso seja identificada alguma pendência na documentação, entraremos em contato por e-mail.

Dúvidas? Entre em contato: pelivreacesso@sjdh.pe.gov.br

Atenciosamente,

Secretário Executivo de Promoção dos Direitos da Pessoa com Deficiência
Secretaria de Justiça, Direitos Humanos e Prevenção à Violência (SJDH)`;

    try {
        const resp = await api.post(`/email/sucesso`,
            {
                params: {
                    to: beneficiario.email,
                    subject: "Cartão PE Livre Acesso Intermunicipal - Confirmação de Cadastro",
                    body: body
                }
            });
        console.log(resp);
        return resp.data;
    } catch (error) {
        console.error(error);
    }
}


/**
 * Enviar e-mail Aprovação do Benefício
 * @param {object} beneficiario - beneficiário
 * */
export async function enviarEmailAprovado(beneficiario) {

    const body = `Prezado(a), ${beneficiario.nome}

Temos uma ótima notícia: Sua solicitação foi APROVADA!

Você já pode exercer o seu direito à gratuidade no transporte coletivo intermunicipal em Pernambuco utilizando a sua Carteira Digital.

Como acessar sua carteira:

Acesse neste link: <a href:"api.sjdh.pe.gpv.br/beneficiarios/${beneficiario.id/carteirinha}" target="_blank">Carteirinha PE Livre Intermunicipal</a>

Como utilizar na viagem:

Vá diretamente ao balcão da empresa de transporte e apresente a sua Carteira Digital (na tela do celular) juntamente com seu documento de identidade original (RG).

Lembre-se: As empresas são obrigadas a reservar assentos para atender aos beneficiários, e a passagem pode ser solicitada até cinco minutos antes do início da viagem, desde que existam lugares vagos.

Dúvidas? Entre em contato: pelivreacesso@sjdh.pe.gov.br

Atenciosamente,

Secretário Executivo de Promoção dos Direitos da Pessoa com Deficiência
Secretaria de Justiça, Direitos Humanos e Prevenção à Violência (SJDH)`;

    try {
        const resp = await api.post(`/email/sucesso`,
            {
                params: {
                    to: beneficiario.email,
                    subject: "Cartão PE Livre Acesso Intermunicipal - Beneficio Aprovado!",
                    body: body
                }
            });
        console.log(resp);
        return resp.data;
    } catch (error) {
        console.error(error);
    }
}

/**
 * Enviar e-mail com cartão digital
 * @param {object} beneficiario - beneficiário
 * */
export async function enviarEmailViaDigital(beneficiario) {

    const body = `Prezado(a), ${beneficiario.nome}

Sua solicitação foi  da Carteira PE Livre Intermunicipal foi APROVADA!

Você já pode exercer o seu direito à gratuidade no transporte coletivo intermunicipal em Pernambuco utilizando a sua Carteira Digital.

Como acessar sua carteira:

Acesse neste link: <a href:"api.sjdh.pe.gpv.br/beneficiarios/${beneficiario.id/carteirinha}" target="_blank">Carteirinha PE Livre Intermunicipal</a>

Como utilizar na viagem:

Vá diretamente ao balcão da empresa de transporte e apresente a sua Carteira Digital (na tela do celular) juntamente com seu documento de identidade original (RG).

Lembre-se: As empresas são obrigadas a reservar assentos para atender aos beneficiários, e a passagem pode ser solicitada até cinco minutos antes do início da viagem, desde que existam lugares vagos.

Dúvidas? Entre em contato: pelivreacesso@sjdh.pe.gov.br

Atenciosamente,

Secretário Executivo de Promoção dos Direitos da Pessoa com Deficiência
Secretaria de Justiça, Direitos Humanos e Prevenção à Violência (SJDH)`;

    try {
        const resp = await api.post(`/email/sucesso`,
            {
                params: {
                    to: beneficiario.email,
                    subject: "Cartão PE Livre Acesso Intermunicipal - Cartão Digital disponivel.",
                    body: body
                }
            });
        console.log(resp);
        return resp.data;
    } catch (error) {
        console.error(error);
    }
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
    const apiBase =
        `${window.location.protocol}//${window.location.hostname}:3000`;

    const resp = await api.get(
        `${apiBase}/beneficiarios/${encodeURIComponent(idBeneficiario)}/validar`
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