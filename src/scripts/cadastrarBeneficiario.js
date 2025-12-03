// Ajuste a URL base conforme seu ambiente
// Torna disponível em window para que outros scripts possam reutilizar
const BASE_URL = 'http://localhost:3000'; // porta padrão do projeto
window.BASE_URL = BASE_URL;

// Payload de exemplo conforme CadastrarBeneficiarioDTO
function buildPayloadExemplo() {
    return {
        nome: 'Maria da Silva',
        nomeMae: 'Joana da Silva',
        cpf: '12345678901',            // apenas dígitos
        rg: '6543210',                 // até 20 chars
        dataNascimento: '1990-05-12',  // YYYY-MM-DD (LocalDate)

        // chaves estrangeiras (use IDs válidos do seu banco)
        sexoId: 1,
        etniaId: 1,
        tipoDeficienciaId: 1,
        statusBeneficioId: 1,
        localRetiradaId: 1,
        cidadeId: 1,

        telefone: '81988887777',       // apenas dígitos (8 a 15)
        email: 'maria.silva@example.com',

        endereco: {
            endereco: 'Rua das Flores',      // logradouro
            bairro: 'Centro',
            cep: '50000-000',               // formato 00000-000
            numero: '123',
            complemento: 'Apto 101',
            uf: 'PE'                        // 2 letras
        },

        vemLivreAcessoRmr: true
    };
}

// Disponibiliza como função global para reaproveitamento no formulário
async function cadastrarBeneficiario(dados) {
    const url = `${BASE_URL}/beneficiarios`;
    console.log('cadastrar beneficiario')
    console.log(dados)
    return 
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    });

    // A API deve retornar 201 em sucesso, com o DTO de detalhes
    const text = await resp.text();
    let body;
    try { body = text ? JSON.parse(text) : null; } catch (_) { body = text; }

    if (!resp.ok) {
        // Erros de validação chegam como JSON de ErrorResponse
        throw {
            status: resp.status,
            statusText: resp.statusText,
            body
        };
    }
    return body;
}
window.cadastrarBeneficiario = cadastrarBeneficiario;
window.buildPayloadExemplo = buildPayloadExemplo;

function logSaida(obj) {
    const el = document.getElementById('saida');
    if (!el) return; // se não existir no DOM, apenas ignore
    el.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
}

// Este trecho é apenas um exemplo rápido de envio do payload estático.
// Só ativa se existir um botão com id "btnCadastrar" na página.
const btnExemplo = document.getElementById('btnCadastrar');
if (btnExemplo) {
    btnExemplo.addEventListener('click', async () => {
        logSaida('Enviando...');
        try {
            const payload = buildPayloadExemplo();
            const resultado = await cadastrarBeneficiario(payload);
            logSaida(resultado);
        } catch (err) {
            console.error(err);
            logSaida({ erro: true, detalhes: err });
        }
    });
}