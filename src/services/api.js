// Import axios via ESM CDN for browser environments without a bundler/import map
// If you later adopt a bundler or import maps, you can switch back to: import axios from "axios";
import axios from "https://esm.sh/axios@1.7.7";

import { showLoading, hideLoading } from "../scripts/utils/loader.js";



// const defaultBase = "https://api.sjdh.pe.gov.br";
const defaultBase = "http://localhost:3000";

/**
 * Cliente axios centralizado usado pela aplicação.
 * Use `setAuthToken` para adicionar Authorization Bearer quando necessário.
 */
export const api = axios.create({
    baseURL: defaultBase,
    timeout: 10000, // 10s
    headers: {
        "Content-Type": "application/json"
    }
});

// Utilitários para manipular token de autenticação globalmente
function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
}

function clearAuthToken() {
    delete api.defaults.headers.common.Authorization;
}

// Intercepta requisições (para logs, token etc)
api.interceptors.request.use(
    config => {
        try {
            const method = (config?.method || "get").toString().toUpperCase();
            const url = (config?.url) ? config.url : (config?.baseURL || "<unknown>");
            console.log("➡️ Enviando:", method, url);
        } catch (e) {
            console.log("➡️ Enviando: (metadata indisponível)", e);
        }
        return config;
    },
    error => Promise.reject(error)
);

// Intercepta respostas (para tratamento unificado) e normaliza erros lançados
api.interceptors.response.use(
    response => response,
    error => {
        const status = error?.response?.status;
        const data = error?.response?.data;
        const message = data?.message || error?.message || "Erro de rede";
        console.error("❌ Erro da API:", status ?? "(sem resposta)", message, data);

        if (data?.error) {
            alert(data.error);
        } else {
            alert(message);
        }

        // Normaliza o erro para facilitar tratamento nos callers
        const normalized = new Error(message);
        normalized.status = status;
        normalized.data = data;
        return Promise.reject(normalized);
    }
);


api.interceptors.request.use(
    config => {
        showLoading();
        return config;
    },
    error => {
        hideLoading();
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => {
        hideLoading();
        return response;
    },
    error => {
        hideLoading();
        return Promise.reject(error);
    }
);


// Expor as helpers também no objeto `api` facilita uso em ambientes que importem apenas o cliente
// e evita avisos de função exportada não utilizada em algumas ferramentas de análise estática.
api.urlapi = defaultBase;
api.setAuthToken = setAuthToken;
api.clearAuthToken = clearAuthToken;
