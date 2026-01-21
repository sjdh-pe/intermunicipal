// Utilitários compartilhados para a página de gestão de beneficiários
export const statusMap = {
    1: { nome: "Em análise", estilo: "bg-yellow-100 text-yellow-800" },
    2: { nome: "Pendente", estilo: "bg-orange-100 text-orange-800" },
    3: { nome: "Indeferido", estilo: "bg-red-200 text-red-900" },
    4: { nome: "Aprovado", estilo: "bg-green-100 text-green-800" },
    5: { nome: "Entregue", estilo: "bg-blue-100 text-blue-800" },
    6: { nome: "Enviadas para Confecção", estilo: "bg-purple-100 text-purple-800" },
    7: { nome: "Entregue aos Correios", estilo: "bg-teal-100 text-teal-800" },
    8: { nome: "Entregue ao Município", estilo: "bg-indigo-100 text-indigo-800" },
    9: { nome: "Disponível para Retirada", estilo: "bg-sky-100 text-sky-800" },
    10:{ nome: "Em Processamento", estilo: "bg-rose-100 text-rose-800" },
    11:{ nome: "Vencido", estilo: "bg-purple-100 text-purple-800" }
};


export const generoMap = {
    1: { nome: "Mulher cisgênera", estilo: "bg-pink-100 text-pink-800" },
    2: { nome: "Mulher transsexual", estilo: "bg-fuchsia-100 text-fuchsia-800" },
    3: { nome: "Homem cisgênero", estilo: "bg-blue-100 text-blue-800" },
    4: { nome: "Homem transsexual", estilo: "bg-indigo-100 text-indigo-800" },
    5: { nome: "Travesti", estilo: "bg-purple-100 text-purple-800" },
    6: { nome: "Não binário", estilo: "bg-teal-100 text-teal-800" },
    7: { nome: "Prefiro não informar", estilo: "bg-gray-100 text-gray-700" },
    8: { nome: "Não sei informar", estilo: "bg-slate-100 text-slate-700" }
};

export const cidadeMap = {};

document.querySelectorAll("#edit-cidade option").forEach(opt => {
    const valor = opt.value;
    const nome = opt.textContent.trim();

    if (valor && valor !== "0") {
        cidadeMap[valor] = {
            nome: nome,
            estilo: "bg-gray-100 text-gray-800"
        };
    }
});

export function resolveStatus(beneficiario) {
    if (!beneficiario) return { nome: "Desconhecido", estilo: "bg-gray-200 text-gray-700" };
    if (beneficiario.statusId !== undefined && beneficiario.statusId !== null) {
        return statusMap[parseInt(beneficiario.statusId, 10)] || { nome: beneficiario.statusBeneficio || "Desconhecido", estilo: "bg-gray-200 text-gray-700" };
    }
    const asNumber = parseInt(beneficiario.statusBeneficio, 10);
    if (!isNaN(asNumber)) {
        return statusMap[asNumber] || { nome: beneficiario.statusBeneficio || "Desconhecido", estilo: "bg-gray-200 text-gray-700" };
    }
    if (typeof beneficiario.statusBeneficio === 'string') {
        const nomeLower = beneficiario.statusBeneficio.trim().toLowerCase();
        for (const key in statusMap) {
            if (statusMap[key].nome.toLowerCase() === nomeLower) return statusMap[key];
        }
        return { nome: beneficiario.statusBeneficio, estilo: "bg-gray-200 text-gray-700" };
    }
    return { nome: "Desconhecido", estilo: "bg-gray-200 text-gray-700" };
}

export function formatCPF(cpf) {
    if (!cpf) return '';
    const digits = String(cpf).replace(/\D/g, '');
    if (digits.length !== 11) return cpf; // retorna original se não tiver 11 dígitos
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

