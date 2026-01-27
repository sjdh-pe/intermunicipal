
$(document).ready(function(){
    $('.cpf-masck').mask('000.000.000-00', {reverse: true});
    $('#cpfResponsavel').mask('000.000.000-00', {reverse: true});
    $('.telefone-masck').mask('(00) 00000-0000');
    $('#cep').mask('00000-000');
});

function formatPhone(phone) {
    if (!phone) return '';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
    if (digits.length === 11) {
        return `(${digits.slice(0,2)})${digits.slice(2,7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `(${digits.slice(0,2)})${digits.slice(2,6)}-${digits.slice(6)}`;
    }
    return phone;
}

function formatPhone(phone) {
    if (!phone) return '';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
    if (digits.length === 11) {
        return `(${digits.slice(0,2)})${digits.slice(2,7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `(${digits.slice(0,2)})${digits.slice(2,6)}-${digits.slice(6)}`;
    }
    return phone;
}
