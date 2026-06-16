import { test, expect } from '@playwright/test';

// Token JWT falso para testar o redirecionamento de autenticação
const TOKEN_EXPIRADO = JSON.stringify({
    tokenType: 'Bearer',
    accessToken: 'token.invalido.fake',
    expiresAt: Date.now() - 1000,   // já expirado
});

const TOKEN_VALIDO_FAKE = JSON.stringify({
    tokenType: 'Bearer',
    accessToken: 'token.invalido.fake',
    expiresAt: Date.now() + 3600000, // expira em 1h
});

test.describe('Área de gestão — controle de acesso', () => {

    test('sem token redireciona para tela de login', async ({ page }) => {
        // Garante localStorage limpo
        await page.goto('/pages/gestao/');

        // requireAuth() deve redirecionar para /pages/usuario/
        await expect(page).toHaveURL(/\/pages\/usuario\//, { timeout: 10000 });
    });

    test('com token expirado redireciona para tela de login', async ({ page }) => {
        await page.goto('/pages/gestao/');

        // Injeta token expirado e recarrega
        await page.evaluate((token) => {
            localStorage.setItem('app_auth_token', token);
        }, TOKEN_EXPIRADO);

        await page.reload();
        await expect(page).toHaveURL(/\/pages\/usuario\//, { timeout: 10000 });
    });

    test('com token ativo a página de gestão é carregada', async ({ page }) => {
        // addInitScript injeta antes do loadTokenOnStart() executar
        await page.addInitScript((token) => {
            localStorage.setItem('app_auth_token', token);
        }, TOKEN_VALIDO_FAKE);

        // Mock do profile para não deixar o 401 da API real chamar logout()
        await page.route('**/auth/profile', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, nome: 'Admin Teste', email: 'admin@teste.gov.br' }),
            })
        );

        await page.goto('/pages/gestao/');

        // Permanece na gestão (não redireciona)
        await expect(page).toHaveURL(/\/pages\/gestao\//, { timeout: 10000 });

        // Elemento da tabela de beneficiários existe no DOM
        await expect(page.locator('#beneficiarios-table')).toBeAttached();
    });
});
