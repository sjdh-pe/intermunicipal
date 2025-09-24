async function buscarEnderecoPorCep(cep) {
    cep = cep.replace(/\D/g, '');

    if (!cep || cep.length !== 8) {
        alert("CEP invÃ¡lido. Use 8 dÃ­gitos numÃ©ricos.");
        return;
    }

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            alert("CEP nÃ£o encontrado.");
            return;
        }
        console.log(dados);
        // Preenche os campos com os dados do endereÃ§o
        document.getElementById('logradouro').value = dados.logradouro || '';
        document.getElementById('bairro').value = dados.bairro || '';
        document.getElementById('cidade').value = dados.localidade || '';
        document.getElementById('uf').value = dados.uf || '';

    } catch (erro) {
        alert("Erro ao buscar CEP.");
        console.error(erro);
    }
}

async function enviarFormulario() {
    const dados = {
        nome: document.getElementById('nome').value,
        cep: document.getElementById('cep').value,
        logradouro: document.getElementById('logradouro').value
    }
    const resposta = await fetch(`http://localhost:3000/beneficiarios/test-post/${dados}`);
    console.log(resposta);
}