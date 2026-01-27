/**
 * Tipos JSDoc para documentação e autocomplete do cadastro de beneficiário.
 * Estes tipos não são enviados ao navegador — servem apenas para suporte em IDEs.
 *
 * Como usar:
 *   /** @type {Beneficiario}
 *   const b = {...}
 *   /** @param {Beneficiario} dados
 *   function salvar(dados) {...}
 */

/* -------------------------------------------------------------------------- */
/*                                   ENDEREÇO                                 */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} Endereco
 * @property {string} endereco - Logradouro (rua, avenida, etc.).
 * @property {string} bairro - Bairro do endereço.
 * @property {string} cep - CEP no formato 00000-000.
 * @property {string} [numero] - Número (texto, pois nem sempre é numérico).
 * @property {string} [complemento] - Complemento (apto, bloco, etc.).
 * @property {string} uf - Unidade federativa (2 letras, ex: PE).
 */

/* -------------------------------------------------------------------------- */
/*                                BENEFICIÁRIO                                */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} Beneficiario
 * @property {string} nome - Nome completo do beneficiário.
 * @property {string} idade - Idade do beneficiário.
 * @property {string} [nomeMae] - Nome da mãe (opcional).
 * @property {string} cpf - Apenas dígitos.
 * @property {string} rg - Até 20 caracteres.
 * @property {string} dataNascimento - Data no formato YYYY-MM-DD.
 * @property {number} reponsavelId - ID do responsável legal.
 * @property {number} diasDesdeCriacao - Quantos dias desde do cadastro.
 * @property {number} sexoId - ID da tabela de sexo/gênero.
 * @property {number} etniaId - ID da tabela de etnia.
 * @property {number} tipoDeficienciaId - ID do tipo de deficiência.
 * @property {number} [statusBeneficioId] - ID do status do benefício.
 * @property {number} [localRetiradaId] - ID do local de retirada.
 * @property {number} cidadeId - ID da cidade selecionada.
 * @property {string} telefone - Apenas dígitos (8 a 15).
 * @property {string} email - E-mail válido.
 * @property {Endereco} endereco - Endereço completo do beneficiário.
 * @property {String} enderecoCompleto - Endereço rua, numero, complemento.
 * @property {boolean} vemLivreAcessoRmr - Possui cartão VEM Livre Acesso RMR.
 */

// Este arquivo contém apenas tipos. Nada daqui é exportado para o navegador.