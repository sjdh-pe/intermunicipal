// Utilitários compartilhados para a página de gestão de beneficiários
export const statusMap = {
    1: { nome: "Em análise", estilo: "bg-yellow-100 text-yellow-800" },
    2: { nome: "Pendente", estilo: "bg-orange-100 text-orange-800" },
    3: { nome: "Negado", estilo: "bg-red-200 text-red-900" },
    4: { nome: "Aprovado", estilo: "bg-green-100 text-green-800" },
    5: { nome: "Entregue", estilo: "bg-blue-100 text-blue-800" },
    6: { nome: "Enviadas para Confecção", estilo: "bg-purple-100 text-purple-800" },
    7: { nome: "Entregue aos Correios", estilo: "bg-teal-100 text-teal-800" },
    8: { nome: "Entregue ao Município", estilo: "bg-indigo-100 text-indigo-800" },
    9: { nome: "Disponível para Retirada", estilo: "bg-sky-100 text-sky-800" },
    10:{ nome: "Pendência Sancionada", estilo: "bg-rose-100 text-rose-800" }
};

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

