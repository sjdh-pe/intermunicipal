import { resolveStatus } from './utils.js';
import { api } from '../../services/api.js'
import {
    motivoBeneficiario,
    listarArquivosBeneficiario,
    enviarEmailAprovado,
    uploadArquivoBeneficiario
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
         

         // Modal dos documentos anexados e upload
         const applyLinkState = (btnId, url, tipoArquivoId) => {
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

                 // LÓGICA DO SWEETALERT2 COM LAYOUT CONTROLADO E UPLOAD
                 const swalHandler = (ev) => {
                     ev.preventDefault();

                     const isPdf = url.toLowerCase().includes('.pdf');

                     // Título limpo e arrastável
                     const modalTitle = `<span style="color: #21409A; font-weight: bold; font-size: 1.25rem; cursor: move;">Documento Anexado</span>`;

                     // Botões e o Input Invisível
                     const btnNovaJanela = `
                         <div style="display: flex; gap: 10px; justify-content: center; margin-top: 5px; margin-bottom: 5px; flex-wrap: wrap;">
                             <a href="${url}" target="_blank" class="btn btn-primary btn-sm px-4" style="border-radius: 7px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                                 Abrir <i data-feather="external-link" style="width: 16px; height: 16px;"></i>
                             </a>
                             <button type="button" id="btn-atualizar-doc" class="btn btn-warning btn-sm px-4 text-white" style="border-radius: 7px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                                 Atualizar <i data-feather="upload" style="width: 16px; height: 16px;"></i>
                             </button>
                             <input type="file" id="hidden-upload-input" style="display: none;" accept=".pdf, image/jpeg, image/png">
                         </div>
                     `;

                     // Função que roda assim que o modal abre (para injetar os eventos JS)
                     // Função que roda assim que o modal de documento abre
                     const didOpenConfig = () => {
                         if (typeof feather !== 'undefined') feather.replace();

                         const btnAtualizar = document.getElementById('btn-atualizar-doc');
                         const fileInput = document.getElementById('hidden-upload-input');

                         if (btnAtualizar && fileInput) {
                             // 1. Clicou no botão laranja -> Abre a janela para escolher arquivo
                             btnAtualizar.addEventListener('click', () => {
                                 fileInput.click(); 
                             });

                             // FUNÇÃO CENTRALIZADA DE UPLOAD (Para não repetir código)
                             const processarUpload = async (arquivoUpload) => {
                                 try {
                                     Swal.fire({
                                         title: 'Enviando documento...',
                                         text: 'Por favor, aguarde o envio para o servidor.',
                                         allowOutsideClick: false,
                                         returnFocus: false, // Evita bug do aria-hidden
                                         didOpen: () => { Swal.showLoading(); }
                                     });

                                     const resultado = await uploadArquivoBeneficiario(user.id, tipoArquivoId, arquivoUpload);
                                     console.warn(`[UPLOAD SUCCESS] Documento atualizado com sucesso!`, resultado);

                                     Swal.fire({
                                         title: 'Atualizado com Sucesso!',
                                         text: 'O documento foi substituído. Feche e abra a janela do beneficiário novamente para ver o novo documento.',
                                         icon: 'success',
                                         confirmButtonText: 'OK',
                                         returnFocus: false
                                     });
                                 } catch (error) {
                                     console.error('[UPLOAD ERROR]:', error);
                                     Swal.fire({
                                         title: 'Erro', 
                                         text: 'Falha ao atualizar. Verifique sua conexão.', 
                                         icon: 'error',
                                         returnFocus: false
                                     });
                                 }
                             };

                             // 2. Escolheu o arquivo -> Decide se corta ou se envia
                             fileInput.addEventListener('change', async (e) => {
                                 if (e.target.files && e.target.files.length > 0) {
                                     const file = e.target.files[0];
                                     
                                     console.warn(`[UPLOAD START] Iniciando Tipo ID: ${tipoArquivoId}. Arquivo: ${file.name}`);
                                     Swal.close(); // Fecha o documento atual

                                     // SE FOR FOTO 3X4 (ID == 3), ABRE O CROPPER NO SWEETALERT
                                     if (tipoArquivoId === 3) {
                                         if (!file.type.startsWith('image/')) {
                                             Swal.fire('Atenção', 'Para a foto 3x4, selecione uma imagem (JPG, PNG).', 'warning');
                                             return;
                                         }

                                         const reader = new FileReader();
                                         reader.onload = function(evt) {
                                             Swal.fire({
                                                 title: 'Ajuste a Foto 3x4',
                                                 html: `<div style="max-height: 50vh; overflow: hidden; display: flex; justify-content: center; background: #f0f0f0;"><img id="swal-crop-img" src="${evt.target.result}" style="max-width: 100%;"></div>`,
                                                 showCancelButton: true,
                                                 confirmButtonText: '<i class="fa-solid fa-crop"></i> Cortar e Salvar',
                                                 cancelButtonText: 'Cancelar',
                                                 allowOutsideClick: false,
                                                 width: '600px',
                                                 didOpen: () => {
                                                     const image = document.getElementById('swal-crop-img');
                                                     // Inicia o Cropper.js na imagem dentro do SweetAlert
                                                     window.swalCropper = new Cropper(image, {
                                                         aspectRatio: 3 / 4,
                                                         viewMode: 1,
                                                         autoCropArea: 1,
                                                     });
                                                 },
                                                 preConfirm: () => {
                                                     // Transforma o corte em um novo arquivo (Blob) antes de fechar
                                                     return new Promise((resolve) => {
                                                         window.swalCropper.getCroppedCanvas({
                                                             width: 300,
                                                             height: 400,
                                                             imageSmoothingEnabled: true,
                                                             imageSmoothingQuality: 'high',
                                                         }).toBlob((blob) => {
                                                             resolve(new File([blob], "foto_3x4_atualizada.jpg", { type: "image/jpeg" }));
                                                         }, 'image/jpeg', 0.9);
                                                     });
                                                 },
                                                 willClose: () => {
                                                     // Limpa a memória
                                                     if (window.swalCropper) window.swalCropper.destroy();
                                                 }
                                             }).then(async (result) => {
                                                 if (result.isConfirmed) {
                                                     // Pega o arquivo cortado e manda pro upload
                                                     const croppedFile = result.value;
                                                     await processarUpload(croppedFile);
                                                 }
                                             });
                                         };
                                         reader.readAsDataURL(file);
                                         
                                     } else {
                                         // SE FOR QUALQUER OUTRO DOCUMENTO (PDF, ETC), ENVIA DIRETO
                                         await processarUpload(file);
                                     }
                                 }
                             });
                         }
                     };

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
                             didOpen: didOpenConfig
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
                             didOpen: didOpenConfig 
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

         applyLinkState("btn-view-rg", linkDocumentos.rg, 1);
         applyLinkState("btn-view-cpf", linkDocumentos.cpf, 2);
         applyLinkState("btn-view-comp", linkDocumentos.comp, 5);
         applyLinkState("btn-view-laudo", linkDocumentos.laudo, 6);
         applyLinkState("btn-view-foto", linkDocumentos.foto, 3);

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


