async function buscarEnderecoPorCep(cep) {
    cep = cep.replace(/\D/g, '');

    if (!cep || cep.length !== 8) {
        alert("CEP inválido. Use 8 dígitos numéricos.");
        return;
    }

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            alert("CEP não encontrado.");
            return;
        }
        console.log(dados);
        // Preenche os campos com os dados do endereço
        document.getElementById('logradouro').value = dados.logradouro || '';
        document.getElementById('bairro').value = dados.bairro || '';
        document.getElementById('cidade').value = dados.localidade || '';
        document.getElementById('uf').value = dados.uf || '';

    } catch (erro) {
        alert("Erro ao buscar CEP.");
        console.error(erro);
    }
}

