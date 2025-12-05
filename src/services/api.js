// js/api.js
import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000/",
    timeout: 10000, // 10s
    headers: {
        "Content-Type": "application/json"
    }
});

// Intercepta requisições (para logs, token etc)
api.interceptors.request.use(
    config => {
        console.log("➡️ Enviando:", config.method.toUpperCase(), config.url);
        return config;
    },
    error => Promise.reject(error)
);

// Intercepta respostas (para tratamento unificado)
api.interceptors.response.use(
    response => response,
    error => {
        console.error("❌ Erro da API:", error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);