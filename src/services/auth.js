import { api } from './api.js';



const TOKEN_KEY = 'app_auth_token';
const REDIRECT_KEY = 'redirect_after_login';

export async function getProfile() {
    const res = await api.get('/auth/profile'); // ou '/auth/me'
    return res.data;
}

function saveToken({ tokenType, accessToken, expiresIn }) {
    const expiresAt = Date.now() + (typeof expiresIn === 'number' ? expiresIn : 0);
    const payload = { tokenType, accessToken, expiresAt };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(payload));
    api.setAuthToken(`${tokenType} ${accessToken}`);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    api.clearAuthToken();
}

export async function login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    // espera resposta com { tokenType, accessToken, expiresIn }
    saveToken(res.data);
    return res.data;
}

export function logout() {
    clearToken();
    // opcional: redirecionar à página pública
    location.href = '/pages/usuario/';
}

export function loadTokenOnStart() {
    try {
        const raw = localStorage.getItem(TOKEN_KEY);
        if (!raw) return false;
        const t = JSON.parse(raw);
        if (!t.accessToken || !t.expiresAt || t.expiresAt <= Date.now()) {
            clearToken();
            return false;
        }
        api.setAuthToken(`${t.tokenType} ${t.accessToken}`);
        return true;
    } catch (e) {
        clearToken();
        return false;
    }
}

export function isAuthenticated() {
    try {
        const raw = localStorage.getItem(TOKEN_KEY);
        if (!raw) return false;
        const t = JSON.parse(raw);
        return !!t.accessToken && t.expiresAt > Date.now();
    } catch {
        return false;
    }
}

/**
 * Chame no topo de páginas que exigem login.
 * Ex.: import { requireAuth } from '../services/auth.js'; requireAuth({ redirect: '/pages/usuario/' });
 */
export function requireAuth({ redirect = '/pages/usuario/' } = {}) {
    if (!isAuthenticated()) {
        // salva a rota atual para redirecionar após login
        localStorage.setItem(REDIRECT_KEY, location.pathname + location.search);
        location.href = redirect;
        // interrompe execução da página se desejar
        throw new Error('redirecting to login');
    }
}

/**
 * Após login com sucesso, chame isto para voltar à página solicitada (se houver).
 * Ex.: após login -> const dest = restoreRedirectAfterLogin(); location.href = dest;
 */
export function restoreRedirectAfterLogin(defaultPath = '/') {
    const p = localStorage.getItem(REDIRECT_KEY) || defaultPath;
    localStorage.removeItem(REDIRECT_KEY);
    return p;
}
