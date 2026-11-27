import axios from 'axios';
import { clearAuthStorage, getToken } from '../utils/storage';
import { notifySessionExpired } from './session';

export function normalizeApiUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'http://localhost:4000/api';
  const trimmed = raw.replace(/\/+$/, '');
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
}

export function resolveApiUrl(value, isProd = import.meta.env.PROD) {
  const configured = String(value || '').trim();
  if (configured) return normalizeApiUrl(configured);
  // In production the frontend proxies /api to the backend, so no env var is required.
  return isProd ? '/api' : 'http://localhost:4000/api';
}

const client = axios.create({
  baseURL: resolveApiUrl(import.meta.env.VITE_API_URL),
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const body = error.response?.data;
    const code = body?.error?.code;

    if (error.response?.status === 401 && (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN')) {
      clearAuthStorage();
      notifySessionExpired();
    }

    error.appError = {
      code: code || 'NETWORK_ERROR',
      message: body?.error?.message || 'We could not reach the server. Please try again.',
      details: body?.error?.details,
    };
    return Promise.reject(error);
  },
);

export function errorMessage(error) {
  return error?.appError?.message || error?.message || 'Something went wrong.';
}

export default client;
