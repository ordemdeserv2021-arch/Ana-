import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use(
  config => {
    // Token será adicionado pelo AuthContext
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para erro de resposta
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      // Será tratado pelo AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
