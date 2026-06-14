import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const flush = (err: unknown, token: string | null = null) => {
  queue.forEach(p => err ? p.reject(err) : p.resolve(token!));
  queue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const orig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(token => {
          if (orig.headers) orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        });
      }

      orig._retry = true;
      isRefreshing = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const r = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
        const { accessToken } = r.data.data;
        localStorage.setItem('access_token', accessToken);
        flush(null, accessToken);
        if (orig.headers) orig.headers.Authorization = `Bearer ${accessToken}`;
        return api(orig);
      } catch (e) {
        flush(e);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(e);
      } finally { isRefreshing = false; }
    }

    return Promise.reject(error);
  }
);

export default api;
