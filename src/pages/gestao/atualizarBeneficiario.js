/**
 * Página de Gestão » Atualização de Beneficiário
 *
 * Este módulo fornece uma função focada para atualizar um beneficiário no backend
 * seguindo o mesmo padrão de organização/comentários usado em `listarBeneficiarios.js`.
 *
 * Responsabilidades:
 * - Coletar dados do formulário de edição (modal "Editar Cadastro").
 * - Invocar o serviço HTTP `atualizarBeneficiario(id, data)`.
 * - Atualizar a listagem após sucesso, mantendo compatibilidade com a tela atual.
 * - Expor a função no `window` para uso por handlers inline, se necessário.
 */

import {
    atualizarBeneficiario as atualizarBeneficiarioAPI,
    atualizarBeneficiarioStatus as atualizarBeneficiarioStatusAPI
    } from "../../services/beneficiariosService.js";

import { carregarBeneficiarios } from "./listarBeneficiarios.js";

/** Estado/controladores locais (mantido mínimo para este módulo) */
const ui = {
  // Seletores padrões do formulário no modal de edição
    fields: {
        id: 'edit-id',
        nome: 'edit-nome',
        nomeMae: 'edit-mae',
        cpf: 'edit-cpf',
        cidade: 'edit-cidade',
        tipoDeficiencia: 'edit-deficiencia',
        status: 'edit-status',
        motivo:'edit-obs'
    }
};

/**
 * Obtém o valor de um input pelo id informado.
 * @param {string} id - id do elemento input/select
 * @returns {string} Valor do campo ou string vazia
 */
function getValue(id) {
  const el = document.getElementById(id);
  return (el && typeof el.value !== 'undefined') ? el.value : '';
}

/**
 * Converte o select de status (string) para number ou null.
 * @param {string} val
 * @returns {number|null}
 */
function toNumberOrNull(val) {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Atualiza o beneficiário com base nos campos do modal de edição.
 *
 * Fluxo:
 * 1) Lê os valores atuais do formulário.
 * 2) Monta o payload esperado pela API.
 * 3) Chama o serviço `atualizarBeneficiarioAPI(id, payload)`.
 * 4) Em sucesso, fecha o modal (se Bootstrap estiver presente), recarrega a listagem do backend e re-renderiza.
 * 5) Em erro, informa o usuário e mantém o modal aberto para correção.
 *
 * Observação: Caso a API utilize PATCH ou outro contrato, ajuste em `beneficiariosService.js`.
 */
export async function atualizarBeneficiarioUI() {
  try {
    // 1) Captura e validação básica
    const id = getValue(ui.fields.id);
    if (!id) {
      alert('Não foi possível identificar o beneficiário. Tente novamente.');
      return;
    }

    const payload = {
        id: getValue(ui.fields.id),
      // nome: getValue(ui.fields.nome) || undefined,
      // nomeMae: getValue(ui.fields.nomeMae) || undefined,
      // cpf: getValue(ui.fields.cpf) || undefined,
      // cidade: getValue(ui.fields.cidade) || undefined,
      //   tipoDeficienciaId: toNumberOrNull(getValue(ui.fields.tipoDeficiencia)),
        statusBeneficioId: toNumberOrNull(getValue(ui.fields.status))
    };
      const payloadStatus = {
          id: getValue(ui.fields.id),
          statusBeneficioId: toNumberOrNull(getValue(ui.fields.status)),
          motivo: getValue(ui.fields.motivo) || undefined
      };

    // Remove chaves undefined para enviar somente campos preenchidos
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    // Remove chaves undefined para enviar somente campos preenchidos
    Object.keys(payloadStatus).forEach(k => payloadStatus[k] === undefined && delete payloadStatus[k]);

      // 2) Chamada à API
    const atualizado = await atualizarBeneficiarioAPI(id, payload);
    console.log('✅ Beneficiário atualizado:', atualizado);

    if (payloadStatus.motivo){
        const status = await atualizarBeneficiarioStatusAPI(id, payloadStatus);
        console.log(status);
    }

    // 3) Feedback ao usuário e fechamento do modal
    try {
      if (typeof bootstrap !== 'undefined') {
        const modalEl = document.getElementById('editModal');
        if (modalEl) {
          const instance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          instance.hide();
        }
      }
    } catch (e) {
      // mantém silencioso, apenas registro
      console.warn('Não foi possível fechar o modal automaticamente:', e);
    }

    // 4) Recarrega a listagem do backend e re-renderiza
    try {
      await carregarBeneficiarios(0); // recarrega página 0 por padrão
      if (typeof window !== 'undefined' && typeof window.loadBeneficiarios === 'function') {
        window.loadBeneficiarios(); // re-renderiza com o state atual
      }
    } catch (e) {
      console.warn('Atualizado com sucesso, mas falhou ao recarregar a lista:', e);
    }

    alert('Beneficiário atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar beneficiário:', error);
    const message = error?.message || 'Falha ao atualizar beneficiário.';
    alert(message);
  }
}

// Exponha no escopo global para uso por `onclick` inline, se desejado
if (typeof window !== 'undefined') {
  window.atualizarBeneficiarioUI = atualizarBeneficiarioUI;
}
