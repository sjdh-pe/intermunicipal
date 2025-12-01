/**
 * Tipos JSDoc para auxiliar o autocomplete e a documentação do payload
 * de cadastro de beneficiário. Estes tipos não são enviados para o navegador,
 * servem apenas para documentação e suporte em IDEs.
 */

/**
 * @typedef {Object} Endereco
 * @property {string} endereco - Logradouro (rua, avenida, etc.).
 * @property {string} bairro - Bairro do endereço.
 * @property {string} cep - CEP no formato 00000-000.
 * @property {string} [numero] - Número (texto, pois nem sempre é numérico).
 * @property {string} [complemento] - Complemento (apto, bloco, etc.).
 * @property {string} uf - Unidade federativa (2 letras, ex: PE).
 */

/**
 * @typedef {Object} Beneficiario
 * @property {string} nome - Nome completo do beneficiário.
 * @property {string} [nomeMae] - Nome da mãe.
 * @property {string} cpf - Apenas dígitos.
 * @property {string} rg - Até 20 caracteres.
 * @property {string} dataNascimento - Formato YYYY-MM-DD.
 * @property {number} sexoId - ID da tabela de sexo/gênero.
 * @property {number} etniaId - ID da tabela de etnia.
 * @property {number} tipoDeficienciaId - ID do tipo de deficiência.
 * @property {number} [statusBeneficioId] - ID do status do benefício (se exigido pela API).
 * @property {number} [localRetiradaId] - ID do local de retirada (se exigido pela API).
 * @property {number} cidadeId - ID da cidade selecionada.
 * @property {string} telefone - Apenas dígitos (8 a 15).
 * @property {string} email - E-mail válido.
 * @property {Endereco} endereco - Endereço completo.
 * @property {boolean} vemLivreAcessoRmr - Se possui cartão VEM Livre Acesso RMR.
 */

// Arquivo apenas de tipos (JSDoc). Nenhuma exportação é necessária.
