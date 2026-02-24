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
    atualizarBeneficiarioStatus as atualizarBeneficiarioStatusAPI, enviarEmailAprovado
} from "../../services/beneficiariosService.js";
import Swal from "https://esm.sh/sweetalert2@11";

import { carregarBeneficiarios } from "./listarBeneficiarios.js";

const onlyDigits = (v) => (v || '').replace(/\D+/g, '');

/** Estado/controladores locais (mantido mínimo para este módulo) */
const ui = {
  // Seletores padrões do formulário no modal de edição
    fields: {
        id: 'edit-id',
        nome: 'edit-nome',
        cpf: 'edit-cpf',
        rg: 'edit-rg',
        dataNascimento: 'edit-birthDate',
        nomeMae: 'edit-mae',
        tipoDeficiencia: 'edit-deficiencia',
        sexoId: 'edit-genero',
        etinia: 'edit-etnia',
        etiniaId: 'edit-etnia',
        email: 'edit-email',
        telefone: 'edit-telefone',
        cep: 'edit-cep',
        cidade: 'edit-cidade',
        cidadeId: 'edit-cidade',
        bairro: 'edit-bairro',
        endereco: 'edit-endereco',
        numero: 'edit-numero',
        complemento: 'edit-complemento',
        status: 'edit-status',
        acompanhante: 'edit-acompanhante',
        statusBeneficioId: 'edit-status',
        motivo:'edit-obs',
        responsavelId : 'edit-responsavel',
        responsavelNome: 'edit-responsavel-nome',
        responsavelCpf: 'edit-responsavel-cpf',
        responsavelRg: 'edit-responsavel-rg'
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
      // alert('Não foi possível identificar o beneficiário. Tente novamente.');
        Swal.fire({
            title: 'Beneficiário não identificado',
            text: 'Não foi possível identificar o beneficiário. Tente novamente.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
      return;
    }
      const payload = {
          id: getValue(ui.fields.id),

          nome: getValue(ui.fields.nome) || null,
          nomeMae: getValue(ui.fields.nomeMae) || null,
          cpf: onlyDigits(getValue(ui.fields.cpf)) || null,
          rg: getValue(ui.fields.rg) || null,

          dataNascimento: getValue(ui.fields.dataNascimento) || null,
          tipoDeficiencia: getValue(ui.fields.tipoDeficiencia) || null,
          sexoId: toNumberOrNull(getValue(ui.fields.sexoId)),
          acompanhante: getValue(ui.fields.acompanhante) || null,
          responsavelId: toNumberOrNull(getValue(ui.fields.responsavelId)),
          responsavelNome: getValue(ui.fields.responsavelNome) || null,
          responsavelCpf: getValue(ui.fields.responsavelCpf) || null,
          responsavelRg: getValue(ui.fields.responsavelRg) || null,
          etniaId: toNumberOrNull(getValue(ui.fields.etniaId)),

          tipoDeficienciaId: toNumberOrNull(getValue(ui.fields.tipoDeficienciaId)),
          statusBeneficioId: toNumberOrNull(getValue(ui.fields.statusBeneficioId)),
          localRetiradaId: toNumberOrNull(getValue(ui.fields.localRetiradaId)),

          cidadeId: toNumberOrNull(getValue(ui.fields.cidadeId)),

          telefone: onlyDigits(getValue(ui.fields.telefone)) || null,
          email: getValue(ui.fields.email) || null,

          endereco: {
              endereco: getValue(ui.fields.endereco) || null,
              bairro: getValue(ui.fields.bairro) || null,
              cep: getValue(ui.fields.cep) || null,
              numero: getValue(ui.fields.numero) || null,
              complemento: getValue(ui.fields.complemento) || null,
              uf: getValue(ui.fields.uf) || "PE",
          },

      };

    console.log("payload:",payload);

      const payloadStatus = {
          id: getValue(ui.fields.id),
          statusBeneficioId: toNumberOrNull(getValue(ui.fields.statusBeneficioId)),
          motivo: getValue(ui.fields.motivo) || undefined
      };

      if (payloadStatus.statusBeneficioId === 4 && payload.acompanhante === null){
          // alert("Acompanhante não informado");
          Swal.fire({
              title: 'Acompanhante não informado',
              icon: 'warning',
              confirmButtonText: 'OK'
          });
          return;
      }

    // Remove chaves undefined para enviar somente campos preenchidos
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    // Remove chaves undefined para enviar somente campos preenchidos
    Object.keys(payloadStatus).forEach(k => payloadStatus[k] === undefined && delete payloadStatus[k]);

      // 2) Chamada à API
    const atualizado = await atualizarBeneficiarioAPI(id, payload);
    console.log('✅ Beneficiário atualizado:', atualizado);

    if (payloadStatus.statusBeneficioId === 4 && atualizado){
        await enviarEmailAprovado(atualizado);

    }

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
      await carregarBeneficiarios(null, null, 0); // recarrega página 0 por padrão
      if (typeof window !== 'undefined' && typeof window.loadBeneficiarios === 'function') {
        window.loadBeneficiarios(); // re-renderiza com o state atual
      }
    } catch (e) {
      console.warn('Atualizado com sucesso, mas falhou ao recarregar a lista:', e);
    }

    // alert('Beneficiário atualizado com sucesso!');
      Swal.fire({
          title: 'Beneficiário atualizado com sucesso',
          icon: 'success',
          confirmButtonText: 'OK'
      });
  } catch (error) {
    console.error('Erro ao atualizar beneficiário:', error);
    const message = error?.message || 'Falha ao atualizar beneficiário.';
    // alert(message);
      Swal.fire({
          title: 'Erro',
          text: message,
          icon: 'error',
          confirmButtonText: 'OK'
      });
  }
}

// Exponha no escopo global para uso por `onclick` inline, se desejado
if (typeof window !== 'undefined') {
  window.atualizarBeneficiarioUI = atualizarBeneficiarioUI;
}
