// Script responsável por coletar os dados do formulário (forms.html),
// validar conforme o payload de exemplo e enviar para a API.
// Reaproveita a função global window.cadastrarBeneficiario definida em cadastrarBeneficiario.js.

(function () {
  'use strict';

  // Utilidades de normalização e validação
  const onlyDigits = (v) => (v || '').replace(/\D+/g, '');

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const isValidCEP = (v) => /^\d{5}-?\d{3}$/.test(v || '');
  const isValidUF = (v) => /^[A-Z]{2}$/.test((v || '').toUpperCase());
  const isValidDateISO = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');

  const getBoolFromRadio = (name, yesValue = 'sim') => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) return null;
    return (checked.value || '').toLowerCase() === yesValue;
  };

  // Exibe mensagens estruturadas no elemento #saida se existir
  function printOut(obj) {
    const el = document.getElementById('saida');
    if (!el) return;
    el.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  }

  // Mapeia os campos do formulário para o payload do backend
  function buildPayloadForm() {
    // Campos pessoais
    const nome = document.getElementById('fullName')?.value?.trim();
    const cpfRaw = document.getElementById('cpf')?.value;
    const cpf = onlyDigits(cpfRaw);
    const rg = (document.getElementById('rg')?.value || '').trim();
    const dataNascimento = document.getElementById('birthDate')?.value; // já é YYYY-MM-DD

    // Selects (IDs numéricos)
    const tipoDeficienciaId = Number(document.getElementById('deficiencia')?.value || 0);
    const sexoId = Number(document.getElementById('genero')?.value || 0);
    const etniaId = Number(document.getElementById('etnia')?.value || 0);

    // Radio vemLivreRm
    const vemLivreAcessoRmr = getBoolFromRadio('vemLivreRm');

    // Contato
    const email = document.getElementById('email')?.value?.trim();
    const confirmEmail = document.getElementById('confirmEmail')?.value?.trim();
    const telefone = onlyDigits(document.getElementById('telefone')?.value);

    // Endereço
    const cepInput = (document.getElementById('cep')?.value || '').trim();
    const cepNorm = cepInput.replace(/(\d{5})(\d{3})/, '$1-$2'); // força padrão 00000-000
    const logradouro = document.getElementById('logradouro')?.value?.trim();
    const numero = document.getElementById('numero')?.value?.trim();
    const bairro = document.getElementById('bairro')?.value?.trim();
    const cidadeId = Number(document.getElementById('cidade')?.value || 0);
    const uf = (document.getElementById('uf')?.value || '').toUpperCase();

    /** @type {Beneficiario} */
    const payload = {
      nome,
      // Nome da mãe não existe no forms.html no momento; se for adicionado, mapear aqui
      nomeMae: undefined,
      cpf,
      rg,
      dataNascimento,
      sexoId,
      etniaId,
      tipoDeficienciaId,
      // statusBeneficioId e localRetiradaId não existem no formulário; omissos
      cidadeId,
      telefone,
      email,
      endereco: {
        endereco: logradouro,
        bairro,
        cep: cepNorm,
        numero,
        complemento: undefined,
        uf
      },
      vemLivreAcessoRmr
    };

    return payload;
  }

  // Validações seguindo as regras do payload de exemplo
  function validatePayload(p) {
    /** @type {string[]} */
    const erros = [];

    if (!p.nome || p.nome.length < 3) erros.push('Nome é obrigatório e deve ter ao menos 3 caracteres.');
    if (!p.cpf || p.cpf.length !== 11) erros.push('CPF deve conter 11 dígitos (apenas números).');
    if (!p.rg || p.rg.length > 20) erros.push('RG é obrigatório e deve ter no máximo 20 caracteres.');
    if (!p.dataNascimento || !isValidDateISO(p.dataNascimento)) erros.push('Data de nascimento inválida (use YYYY-MM-DD).');

    if (!Number.isInteger(p.sexoId) || p.sexoId <= 0) erros.push('Selecione um gênero válido.');
    if (!Number.isInteger(p.etniaId) || p.etniaId <= 0) erros.push('Selecione uma etnia válida.');
    if (!Number.isInteger(p.tipoDeficienciaId) || p.tipoDeficienciaId <= 0) erros.push('Selecione um tipo de deficiência válido.');
    if (!Number.isInteger(p.cidadeId) || p.cidadeId <= 0) erros.push('Selecione uma cidade válida.');

    if (!p.telefone || p.telefone.length < 8 || p.telefone.length > 15) erros.push('Telefone deve conter entre 8 e 15 dígitos.');
    if (!p.email || !isValidEmail(p.email)) erros.push('E-mail inválido.');

    // Confirmação de e-mail (lida via DOM para melhor UX)
    const confirmEmail = document.getElementById('confirmEmail')?.value?.trim();
    if (confirmEmail && p.email && confirmEmail !== p.email) erros.push('Confirmação de e-mail não confere.');

    if (!p.endereco) erros.push('Endereço é obrigatório.');
    else {
      if (!p.endereco.endereco) erros.push('Logradouro é obrigatório.');
      if (!p.endereco.bairro) erros.push('Bairro é obrigatório.');
      if (!p.endereco.cep || !isValidCEP(p.endereco.cep)) erros.push('CEP inválido (formato 00000-000).');
      if (!p.endereco.uf || !isValidUF(p.endereco.uf)) erros.push('UF inválida (2 letras).');
    }

    if (p.vemLivreAcessoRmr === null) erros.push('Informe se possui VEM Livre Acesso RMR.');

    return erros;
  }

  function attachHandlers() {
    const form = document.getElementById('beneficiary-form');
    if (!form) return;

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      printOut('Validando...');
      try {
        const payload = buildPayloadForm();
        const erros = validatePayload(payload);
        if (erros.length) {
          printOut({ ok: false, erros });
          return;
        }

        printOut('Enviando...');
        const resultado = await window.cadastrarBeneficiario(payload);
        printOut({ ok: true, resultado });
      } catch (err) {
        console.error(err);
        printOut({ ok: false, erro: true, detalhes: err });
      }
    });
  }

  // Aguarda DOM pronto para associar eventos
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }
})();
