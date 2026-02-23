
$(document).ready(function(){
    $('.cpf-masck').mask('000.000.000-00', {reverse: true});
    $('#cpfResponsavel').mask('000.000.000-00', {reverse: true});
    $('.telefone-masck').mask('(00) 00000-0000');
    $('#cep').mask('00000-000');
    $('.date-mask').mask('00/00/0000');
});

function formatPhone(phone){
    if (!phone) return '';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
    if (digits.length === 11) {
        return `(${digits.slice(0,2)})${digits.slice(2,7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    }
    return phone;
}

function formatCpf(cpf) {
    if (!cpf) return '';
    const digits = String(cpf).replace(/\D/g, '');
    const d = digits.length > 11 ? digits.slice(-11) : digits;
    if (d.length !== 11) return cpf;
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

