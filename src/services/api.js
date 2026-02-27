import axios from "https://esm.sh/axios@1.7.7";
import { showLoading, hideLoading, resetLoading } from "../components/loader.js";

const defaultBase = "http://11.0.0.105:3000";
// const defaultBase = "https://api.sjdh.pe.gov.br";


const TOKEN_KEY = "app_auth_token";

// Loader com contador (evita piscar quando várias requests rodam juntas)
let __pending = 0;
function startLoading() {
    __pending ++;
    if (__pending === 1) showLoading();
}
function stopLoading() {
    __pending --;
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

export const api = axios.create({
    baseURL: defaultBase,
    timeout: 10000
    // ⚠️ não fixe Content-Type aqui pra não quebrar FormData (upload)
});

// (Opcional) evita spam de alert
let __lastAlertAt = 0;
function safeAlert(msg) {
    const now = Date.now();
    if (now - __lastAlertAt < 600) return;
    __lastAlertAt = now;
    alert(msg);
}

// ✅ ÚNICO request interceptor: loader + token + content-type (quando NÃO for FormData)
api.interceptors.request.use(
    (config) => {
        startLoading();

        const token = readTokenValue();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = token;
        }

        // não forçar JSON em uploads
        const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
        if (!isFormData) {
            config.headers = config.headers || {};
            if (!config.headers["Content-Type"]) {
                config.headers["Content-Type"] = "application/json";
            }
        }

        return config;
    },
    (error) => {
        stopLoading();
        return Promise.reject(error);
    }
);

// ✅ ÚNICO response interceptor: hide loader + erro unificado
api.interceptors.response.use(
    (response) => {
        stopLoading();
        return response;
    },
    (error) => {
        stopLoading();

        const status = error?.response?.status;
        const data = error?.response?.data;

        let message = "Ocorreu um erro inesperado. Tente novamente.";
        if (data?.message) message = data.message;
        else if (data?.error) message = data.error;
        else if (error?.message) message = error.message;

        console.error(`❌ Erro da API [${status ?? "Rede"}]: ${message}`, {
            url: error?.config?.url,
            method: error?.config?.method,
            params: error?.config?.params,
            data
        });

        if (status === 401) console.warn("Sessão expirada ou não autorizada.");

        safeAlert(message);

        const normalized = new Error(message);
        normalized.status = status;
        normalized.data = data;
        normalized.originalError = error;

        return Promise.reject(normalized);
    }
);

// helpers compatibilidade
api.urlapi = defaultBase;
api.setAuthToken = (token) => {
    if (token) api.defaults.headers.common.Authorization = token;
};
api.clearAuthToken = () => {
    delete api.defaults.headers.common.Authorization;
};

// Salvaguardas: se a página for descarregada/ocultar antes das respostas chegarem,
// garantimos que o loader não fique preso na tela
window.addEventListener("pagehide", () => {
    // zera pendências locais e esconde overlay
    __pending = 0;
    resetLoading();
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        __pending = 0;
        resetLoading();
    }
});