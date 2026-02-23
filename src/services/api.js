import axios from "https://esm.sh/axios@1.7.7";
import { showLoading, hideLoading } from "../components/loader.js";


const defaultBase = "http://11.0.0.104:3000";

const TOKEN_KEY = "app_auth_token";

// Loader com contador (evita piscar quando várias requests rodam juntas)
let __pending = 0;
function startLoading() {
    __pending += 1;
    if (__pending === 1) showLoading();
}
function stopLoading() {
    __pending = Math.max(0, __pending - 1);
    if (__pending === 0) hideLoading();
}

function readTokenValue() {
    try {
        const raw = localStorage.getItem(TOKEN_KEY);
        if (!raw) return null;

        const t = JSON.parse(raw);
        if (!t?.accessToken || !t?.expiresAt || t.expiresAt <= Date.now()) return null;

        return `${t.tokenType || "Bearer"} ${t.accessToken}`;
    } catch {
        return null;
    }
}

/**
 * Cliente axios centralizado usado pela aplicação.
 * @type {import("axios").AxiosInstance}
 */
export const api = axios.create({
    baseURL: defaultBase,
    timeout: 10000,
    // headers: { "Content-Type": "application/json" }
});

// ✅ Request: mostra loader
api.interceptors.request.use(
    (config) => {
        showLoading();
        return config;
    },
    (error) => {
        hideLoading();
        return Promise.reject(error);
    }
);

// ✅ Response: esconde loader SEMPRE (sucesso e erro)
api.interceptors.response.use(
    (response) => {
        hideLoading();
        return response;
    },
    (error) => {
        hideLoading();
        return Promise.reject(error);
    }
);

// Helpers (mantendo compatibilidade com seu projeto)
function setAuthToken(token) {
    if (token) api.defaults.headers.common.Authorization = token;
}
function clearAuthToken() {
    delete api.defaults.headers.common.Authorization;
}

// (Opcional) evita spam de alert se uma página dispara várias chamadas que falham juntas
let __lastAlertAt = 0;
function safeAlert(msg) {
    const now = Date.now();
    if (now - __lastAlertAt < 600) return; // 0,6s de "cooldown"
    __lastAlertAt = now;
    alert(msg);
}

// ✅ 1 interceptador de request: loader + token
api.interceptors.request.use(
    (config) => {
        startLoading();

        const token = readTokenValue();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = token;
        }

        return config;
    },
    (error) => {
        stopLoading();
        return Promise.reject(error);
    }
);

// ✅ 1 interceptador de response: hide loader + erro unificado
api.interceptors.response.use(
    (response) => {
        stopLoading();
        return response;
    },
    (error) => {
        stopLoading();

        const status = error?.response?.status;
        const data = error?.response?.data;

        // Melhor mensagem possível (prioridade: API -> axios -> fallback)
        let message = "Ocorreu um erro inesperado. Tente novamente.";
        if (data?.message) message = data.message;
        else if (data?.error) message = data.error;
        else if (error?.message) message = error.message;

        // Log útil pro dev
        console.error(`❌ Erro da API [${status ?? "Rede"}]: ${message}`, {
            url: error?.config?.url,
            method: error?.config?.method,
            params: error?.config?.params,
            data: data
        });

        // Tratamentos específicos (opcional)
        if (status === 401) {
            console.warn("Sessão expirada ou não autorizada.");
            // aqui você pode disparar logout/redirect se quiser
        }

        // Feedback pro usuário
        safeAlert(message);

        // Normaliza o erro para os callers
        const normalized = new Error(message);
        normalized.status = status;
        normalized.data = data;
        normalized.originalError = error;

        return Promise.reject(normalized);
    }
);

// extras compatibilidade
api.urlapi = defaultBase;
api.setAuthToken = setAuthToken;
api.clearAuthToken = clearAuthToken;