import {formatCPF, resolveStatus} from './utils.js';
import { api } from '../../services/api.js'
import { motivoBeneficiario, listarArquivosBeneficiario } from "../../services/beneficiariosService.js";

export function createModalHandlers(state) {
    function findById(id) {
        console.log("modals.js findById")
        console.log(state.beneficiariosPage?.content || [])
        return (state.beneficiariosPage?.content || []).find(u => u.id === id);
    }
    function openCarteiraModal(id) {
        window.open(`${api.urlapi}/beneficiarios/${id}/carteirinha`, '_blank');
    }

     async function openViewModal(id) {

        const user = findById(id);
        const arquivos = await listarArquivosBeneficiario(id);
        const linkDocumentos = { rg: null, cpf: null, comp: null, laudo: null, foto: null };
        try {
            (arquivos || []).forEach(a => {
                const tipo = a?.idTipoArquivo; // número do tipo
                const url = a?.url || null;
                if (!url || tipo == null) return;
                // Mapeamento por idTipoArquivo (conforme exemplo do issue):
                // 1 = RG, 2 = CPF, 5 = Comprovante de Residência, 6 = Laudo Médico, 3 = Foto 3x4
                switch (Number(tipo)) {
                    case 1: linkDocumentos.rg = url; break;
                    case 2: linkDocumentos.cpf = url; break;
                    case 5: linkDocumentos.comp = url; break;
                    case 6: linkDocumentos.laudo = url; break;
                    case 3: linkDocumentos.foto = url; break;
                    default: break; // ignora outros tipos
                }
            });
         } catch (e) {
             // mantém linkDocumentos com valores nulos em caso de erro de parsing
         }
         if (!user) return;
         const set = (id, val) => {
             const el = document.getElementById(id);
             if (el) el.textContent = val || '';
         };
         set('view-id', user.id);
         set('view-nome', user.nome);
         set("view-idade",user.idade || "0");
         set("view-data-nascimento", user.dataNascimento.split("-").reverse().join("/"));
         set('view-mae', user.nomeMae);
         set("view-cpf", user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"));
         set("view-rg", user.rg);
         set("view-espera", user.diasDesdeCriacao);
         document.getElementById("view-espera").innerHTML = user.diasDesdeCriacao ;
         set("view-cidade", user.cidade);
         set('view-deficiencia', user.tipoDeficiencia);
         set('view-endereco', user.enderecoCompleto );
         set('view-obs', user.motivo);
         set("view-bairro", user.bairro);
         set("view-cep", user.cep);
         set("view-email", user.email);
         set("view-telefone", formatPhone(user.telefone));

         const applyLinkState = (btnId, url) => {
             const el = document.getElementById(btnId);
             if (!el) return;
             if (url) {
                 el.href = url;
                 el.setAttribute('aria-disabled', 'false');
                 el.removeAttribute('tabindex');
                 el.removeAttribute('data-disabled');
                 el.removeEventListener('click', el._preventClick, false);
                 el.target = '_blank';
             } else {
                 el.href = '#';
                 el.setAttribute('aria-disabled', 'true');
                 el.setAttribute('tabindex', '-1');
                 el.setAttribute('data-disabled', 'true');
                 // evita navegação quando desabilitado
                 const handler = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
                 // guarda referência para poder remover depois
                 el._preventClick = handler;
                 el.addEventListener('click', handler, false);
                 el.removeAttribute('target');
             }
         };

         applyLinkState("btn-view-rg", linkDocumentos.rg);
         applyLinkState("btn-view-cpf", linkDocumentos.cpf);
         applyLinkState("btn-view-comp", linkDocumentos.comp);
         applyLinkState("btn-view-laudo", linkDocumentos.laudo);
         applyLinkState("btn-view-foto", linkDocumentos.foto);

         const infoStatus = resolveStatus(user);
         const viewStatusEl = document.getElementById('view-status');
         if (viewStatusEl) {
             viewStatusEl.className = `${infoStatus.estilo} px-2 py-1 rounded-full text-xs font-semibold`;
             viewStatusEl.textContent = infoStatus.nome;
         }
         if (state.viewModalInstance) state.viewModalInstance.show();
         document.getElementById("btn-switch-to-edit").onclick = () => openEditModal(user.id);
     }

    async function openEditModal(id) {
        const user = findById(id);
        if (!user) return;
        user.motivo = await motivoBeneficiario(id);

        const setValue = (elId, val) => {
            const el = document.getElementById(elId);
            if (el) el.value = val || '';
        };

        setValue('edit-id', user.id);
        setValue('edit-nome', user.nome);
        setValue('edit-mae', user.nomeMae);
        setValue('edit-cpf', formatCPF(user.cpf));
        setValue('edit-rg', user.rg);
        setValue("edit-birthDate", user.dataNascimento);
        setValue("edit-genero", user.sexoId);
        setValue('edit-deficiencia', user.tipoDeficienciaId);

        setValue('edit-email', user.email);
        setValue('edit-telefone', formatPhone(user.telefone));
        setValue('edit-cep', user.cep);
        setValue('edit-bairro', user.bairro);
        setValue('edit-endereco', user.endereco);
        setValue('edit-numero', user.numero);
        setValue('edit-complemento', user.complemento);
        setValue('edit-id-responsavel',user.responsavelId)
        setValue('edit-responsavel-nome' , user.responsavelNome);
        setValue('edit-responsavel-cpf' , formatCPF(user.responsavelCpf));
        setValue('edit-responsavel-rg' , user.responsavelRg);
        setValue('edit-obs', user.motivo);
        setValue('edit-cidade', user.cidadeId);
        setValue('edit-acompanhante', user.acompanhante);

        const select = document.getElementById('edit-status');
        if (select) {
            let idToSelect = user.statusId !== undefined ? String(user.statusId) : '';
            if (!idToSelect && user.statusBeneficio) {
                const resolved = resolveStatus(user);
                const matchingId = Object.keys(state.statusMap || {}).find(k => (state.statusMap[k].nome === resolved.nome));
                if (matchingId) idToSelect = matchingId;
            }
            select.value = idToSelect || '';
        }
        if (state.editModalInstance) state.editModalInstance.show();
    }

    function openDeleteModal(id) {
        const el = document.getElementById('delete-id'); if (el) el.value = id;
        if (state.deleteModalInstance) state.deleteModalInstance.show();
    }

    function confirmDelete() {
        const id = document.getElementById('delete-id')?.value;
        if (!id) return;
        state.beneficiariosPage.content = (state.beneficiariosPage.content || []).filter(u => u.id !== id);
        state.beneficiariosPage.totalElements = state.beneficiariosPage.content.length;
        if (state.deleteModalInstance) state.deleteModalInstance.hide();
        if (state.onChange) state.onChange();
    }

    return { openCarteiraModal, openViewModal, openEditModal, openDeleteModal, confirmDelete };
}

