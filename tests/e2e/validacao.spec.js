import { test, expect } from '@playwright/test';

const ID_MOCK    = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ID_INVALIDO = '00000000-0000-0000-0000-000000000000';

const MOCK_BENEFICIARIO = {
    id: ID_MOCK,
    nome: 'MARIA BENEFICIÁRIA TESTE',
    cpf: '12345678901',
    cidade: 'Recife',
    tipoDeficiencia: 'Física',
    statusBeneficio: 'Aprovado',
    fotoBase64: null,
    dataValidade: '2027-06-30',
};

test.describe('Carteira Digital — página de validação pública', () => {

    test('exibe carteirinha quando API retorna dados válidos', async ({ page }) => {
        // Mocka a chamada ao endpoint /validar (ambiente de dev não tem registros de aprovação)
        await page.route(`**/beneficiarios/${ID_MOCK}/validar`, route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BENEFICIARIO) })
        );

        await page.goto(`/pages/valid/?id=${ID_MOCK}`);

        await expect(page.locator('#wallet-card')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#user-name')).toContainText('MARIA BENEFICIÁRIA TESTE');
        await expect(page.locator('#user-cpf')).not.toBeEmpty();

        // Data de validade deve ser formatada para mês por extenso em pt-BR
        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro','Indeterminado'];
        const validadeText = await page.locator('#user-validade').textContent();
        const temMes = meses.some(m => validadeText.includes(m));
        expect(temMes, `"${validadeText}" não contém mês em pt-BR`).toBe(true);
    });

    test('exibe estado de erro para ID inválido', async ({ page }) => {
        await page.goto(`/pages/valid/?id=${ID_INVALIDO}`);

        await expect(page.locator('#error-state')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#wallet-card')).toBeHidden();
        await expect(page.locator('#loading-state')).toBeHidden();
    });

    test('spinner some após a API responder', async ({ page }) => {
        await page.route(`**/beneficiarios/${ID_MOCK}/validar`, route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BENEFICIARIO) })
        );

        await page.goto(`/pages/valid/?id=${ID_MOCK}`);
        await expect(page.locator('#loading-state')).toBeHidden({ timeout: 10000 });
    });
});
