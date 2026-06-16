import { test, expect } from '@playwright/test';

// Beneficiário real da API (aprovado, adulto)
const BENEFICIARIO = {
    cpf: '82475199415',
    dataNasc: '09/11/1972',  // DD/MM/AAAA — API retorna 1972-11-09
};

test.describe('Login do beneficiário', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/pages/login/');
    });

    test('página carrega com campos CPF e data de nascimento', async ({ page }) => {
        await expect(page.locator('#cpf')).toBeVisible();
        await expect(page.locator('#datanasc')).toBeVisible();
        await expect(page.locator('button[type=submit]')).toBeVisible();
    });

    test('CPF e data válidos redirecionam para página do beneficiário', async ({ page }) => {
        await page.locator('#cpf').fill(BENEFICIARIO.cpf);
        await page.locator('#datanasc').fill(BENEFICIARIO.dataNasc);
        await page.locator('button[type=submit]').click();

        await expect(page).toHaveURL(/\/pages\/beneficiario\//, { timeout: 15000 });
    });

    test('dados inválidos exibem SweetAlert de erro', async ({ page }) => {
        await page.locator('#cpf').fill('00000000000');
        await page.locator('#datanasc').fill('01/01/1900');
        await page.locator('button[type=submit]').click();

        // SweetAlert2 monta um elemento .swal2-popup no DOM
        await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('.swal2-popup')).not.toContainText('Sucesso');
    });

    test('data incompleta exibe alerta sem chamar a API', async ({ page }) => {
        // Intercepta para garantir que a API não foi chamada
        let chamouApi = false;
        page.on('request', req => {
            if (req.url().includes('/beneficiarios/cpf/')) chamouApi = true;
        });

        await page.locator('#cpf').fill(BENEFICIARIO.cpf);
        await page.locator('#datanasc').fill('99');   // data malformada
        await page.locator('button[type=submit]').click();

        await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
        expect(chamouApi).toBe(false);
    });
});
