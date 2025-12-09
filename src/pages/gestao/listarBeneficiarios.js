
import { listarBeneficiarios } from "../../services/beneficiariosService.js";

export async function carregarBeneficiarios(page = 0) {
    try {
        const result = await listarBeneficiarios(page);
        console.log(result)
        renderTabela(result.content);
        atualizarPaginacao(result);

    } catch (error) {
        console.error(error);
        alert('Erro ao carregar beneficiários.');
    }
}

await carregarBeneficiarios();

function renderTabela(lista) {
    const tbody = document.querySelector('#tabela-beneficiarios tbody');
    tbody.innerHTML = '';

    lista.forEach(b => {
        tbody.innerHTML += `
            <tr>
                <td>${b.nome}</td>
                <td>${b.cpf}</td>
                <td>${b.cidade}</td>
                <td>${b.statusBeneficio}</td>
                <td>${b.telefone}</td>
            </tr>
        `;
    });
}

function atualizarPaginacao(result) {
    document.getElementById('pagina-atual').textContent = result.number + 1;
    document.getElementById('total-paginas').textContent = result.totalPages;

    document
        .getElementById('btnAnterior')
        .disabled = result.first;

    document
        .getElementById('btnProximo')
        .disabled = result.last;

    // eventos
    document.getElementById('btnAnterior').onclick = () =>
        carregarBeneficiarios(result.number - 1);

    document.getElementById('btnProximo').onclick = () =>
        carregarBeneficiarios(result.number + 1);
}