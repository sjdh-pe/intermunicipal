import { resolveStatus } from './utils.js';
import { api } from '../../services/api.js'
import {
    motivoBeneficiario,
    listarArquivosBeneficiario,
    enviarEmailAprovado
} from "../../services/beneficiariosService.js";
import Swal from "https://esm.sh/sweetalert2@11";


export function createModalHandlers(state) {
    function findById(id) {
        return (state.beneficiariosPage?.content || []).find(u => u.id === id);
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
         
         // Modal dos documentos anexados 

        const applyLinkState = (btnId, url) => {
             const el = document.getElementById(btnId);
             if (!el) return;

             // Limpeza de eventos antigos
             if (el._preventClick) el.removeEventListener('click', el._preventClick);
             if (el._swalClick) el.removeEventListener('click', el._swalClick);

             if (url) {
                 el.href = 'javascript:void(0)';
                 el.removeAttribute('target');
                 el.setAttribute('aria-disabled', 'false');
                 el.removeAttribute('tabindex');
                 el.removeAttribute('data-disabled');

                 // LÓGICA DO SWEETALERT2 COM LAYOUT CONTROLADO
                 const swalHandler = (ev) => {
                     ev.preventDefault();

                     const isPdf = url.toLowerCase().includes('.pdf');

                     // Título limpo e arrastável
                     const modalTitle = `<span style="color: #21409A; font-weight: bold; font-size: 1.25rem; cursor: move;">Documento Anexado</span>`;

                     // Botão com o ícone do Feather Icons (external-link)
                     const btnNovaJanela = `
                         <div style="margin-top: 5px; margin-bottom: 5px;">
                             <a href="${url}" target="_blank" class="btn btn-primary btn-sm px-4" style="border-radius: 7px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                                 Abrir em nova janela <i data-feather="external-link" style="width: 16px; height: 16px;"></i>
                             </a>
                         </div>
                     `;

                     if (isPdf) {
                         Swal.fire({
                             title: modalTitle,
                             html: `
                                 <div style="display: flex; flex-direction: column; gap: 10px;">
                                     <iframe src="${url}" style="width: 100%; height: 65vh; border: 1px solid #dee2e6; border-radius: 8px; background: #f8f9fa;"></iframe>
                                     ${btnNovaJanela}
                                 </div>
                             `,
                             width: '50%',             
                             position: 'top-end',      
                             draggable: true,          
                             showCloseButton: true,
                             showConfirmButton: false,
                             padding: '1em 1em 0.5em 1em',
                             // O "pulo do gato": Avisa o Feather para desenhar o ícone assim que o modal abrir
                             didOpen: () => {
                                 if (typeof feather !== 'undefined') feather.replace();
                             }
                         });
                     } else {
                         Swal.fire({
                             title: modalTitle,
                             html: `
                                 <div style="display: flex; flex-direction: column; gap: 10px;">
                                     <div style="max-height: 65vh; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 8px; padding: 5px; background: #f8f9fa;">
                                         <img src="${url}" style="max-width: 100%; height: auto; border-radius: 4px;" alt="Documento do Beneficiário">
                                     </div>
                                     ${btnNovaJanela}
                                 </div>
                             `,
                             width: 'auto',            
                             position: 'top-end',      
                             draggable: true,          
                             showCloseButton: true,
                             showConfirmButton: false,
                             padding: '1em 1em 0.5em 1em',
                             // Avisa o Feather para desenhar o ícone assim que o modal abrir
                             didOpen: () => {
                                 if (typeof feather !== 'undefined') feather.replace();
                             }
                         });
                     }
                 };

                 el._swalClick = swalHandler;
                 el.addEventListener('click', swalHandler);

             } else {
                 el.href = '#';
                 el.setAttribute('aria-disabled', 'true');
                 el.setAttribute('tabindex', '-1');
                 el.setAttribute('data-disabled', 'true');
                 
                 const handler = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
                 el._preventClick = handler;
                 el.addEventListener('click', handler);
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
        setValue('edit-cpf', formatCpf(user.cpf));
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
        setValue('edit-responsavel-cpf' , formatCpf(user.responsavelCpf));
        setValue('edit-responsavel-rg' , user.responsavelRg);
        setValue('edit-obs', user.motivo);
        setValue('edit-cidade', user.cidadeId);

        if( user.acompanhante === null || user.acompanhante === undefined ){
            setValue('edit-acompanhante', "");
        }else if(user.acompanhante === false ){
            setValue('edit-acompanhante', "false");
        }else {
            setValue('edit-acompanhante', user.acompanhante);
        }

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

    // Modal da carteirinha = Botões ações View Carteirinha
    function openCarteiraModal(id, nome, email) {
        const elId = document.getElementById('acao-carteira-id');
        const elNome = document.getElementById('acao-carteira-nome');
        const elEmail = document.getElementById('acao-carteira-email');

        if (elId) elId.value = id;
        if (elNome) elNome.textContent = nome || 'Beneficiário';
        if (elEmail) elEmail.textContent = email || 'Sem e-mail cadastrado';

        if (typeof feather !== 'undefined') feather.replace();

        const modalEl = document.getElementById('acoesCarteiraModal');
        if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.show();
        }
    }

    // A lógica de abrir o PDF 
    function downloadCarteiraPdf() {
        const id = document.getElementById('acao-carteira-id')?.value;
        if (!id) return;
        
        window.open(`${api.urlapi}/beneficiarios/${id}/carteirinha`, '_blank');
    }

    // Função de envio de E-mail 
    async function enviarCarteiraEmail() {
        const id = document.getElementById('acao-carteira-id')?.value;
        const beneficiario = findById(id);

        if (!beneficiario.email || beneficiario.email.trim().length === 0) {
            // alert("Não é possível enviar. Este beneficiário não possui um e-mail válido cadastrado.");
            Swal.fire({
                title: 'E-mail não cadastrado',
                text: 'Este beneficiário não possui um e-mail válido cadastrado.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        const result = await Swal.fire({
            title: "Enviar carteira?",
            text: `Deseja enviar a carteira para o e-mail: ${beneficiario.email}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#0d6efd",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim, enviar",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) return;

        // Modal de loading enquanto envia
        Swal.fire({
            title: "Enviando...",
            text: "Aguarde enquanto o e-mail é enviado.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            await enviarEmailAprovado(beneficiario);

            Swal.fire({
                title: "E-mail enviado!",
                text: `A carteira foi enviada para ${beneficiario.email}.`,
                icon: "success",
                confirmButtonText: "OK"
            });

            const modalEl = document.getElementById('acoesCarteiraModal');
            if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

        } catch (error) {
            console.error("Erro ao enviar email", error);

            Swal.fire({
                title: "Erro ao enviar e-mail",
                text: "Não foi possível enviar o e-mail.",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }

    return {
        openCarteiraModal, 
        openViewModal, 
        openEditModal, 
        openDeleteModal, 
        confirmDelete,
        downloadCarteiraPdf,
        enviarCarteiraEmail     
    };
}


