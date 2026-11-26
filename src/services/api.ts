import axios from 'axios';

const getApiBaseUrl = () => {
  const isBrowser = typeof window !== 'undefined';
  const isRemoteHost =
    isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // 1. Runtime override via window, localStorage, or URL query param (?api=https://... or ?backend=https://...)
  if (isBrowser) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryApi = urlParams.get('api') || urlParams.get('backend');
      if (queryApi && queryApi.trim()) {
        let clean = queryApi.trim().replace(/\/+$/, '');
        if (!clean.endsWith('/api/v1') && !clean.endsWith('/api')) {
          clean = `${clean}/api/v1`;
        }
        localStorage.setItem('custom_backend_url', clean);
      }
    } catch (_) {}

    const customUrl = localStorage.getItem('custom_backend_url') || (window as any).__API_BASE_URL__;
    if (customUrl && typeof customUrl === 'string' && customUrl.trim() !== '') {
      let trimmed = customUrl.trim().replace(/\/+$/, '');
      if (!trimmed.endsWith('/api/v1') && !trimmed.endsWith('/api')) {
        trimmed = `${trimmed}/api/v1`;
      }
      return trimmed;
    }
  }

  // 2. Build-time environment variables
  const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();

  // If running in a remote / deployed environment (e.g. railway.app, vercel.app, render.com, custom domain)
  if (isRemoteHost) {
    // If an explicit remote URL was provided (starts with http/https and NOT localhost)
    if (envUrl && /^https?:\/\//i.test(envUrl) && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && !envUrl.includes('anvimerbackend')) {
      let trimmed = envUrl.replace(/\/+$/, '');
      if (!trimmed.endsWith('/api/v1') && !trimmed.endsWith('/api')) {
        trimmed = `${trimmed}/api/v1`;
      }
      return trimmed;
    }

    // If a relative path was provided (e.g. '/api/v1')
    if (envUrl && envUrl.startsWith('/')) {
      return `${window.location.origin}${envUrl.replace(/\/+$/, '')}`;
    }

    // Default for remote host: always use current origin's /api/v1 (NEVER localhost!)
    return `${window.location.origin}/api/v1`;
  }

  // 3. Localhost development environment
  if (envUrl && !envUrl.includes('anvimerbackend')) {
    if (envUrl.startsWith('/')) {
      return isBrowser ? `${window.location.origin}${envUrl}` : 'http://localhost:5000/api/v1';
    }
    return envUrl.replace(/\/+$/, '');
  }

  return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45s timeout to gracefully tolerate cloud server cold starts (Render/Railway)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('school_saas_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Auto-retry once on cold-start wakeups (502, 503, 504, or Network Error / Timeout)
    const isNetworkOrColdStart =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      [502, 503, 504].includes(error.response?.status);

    if (isNetworkOrColdStart && !originalRequest._networkRetry) {
      originalRequest._networkRetry = true;
      // Wait 2 seconds for cloud server instance to finish waking up
      await new Promise((r) => setTimeout(r, 2000));
      return apiClient(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('school_saas_refresh_token');
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken } = refreshRes.data.data;
        localStorage.setItem('school_saas_access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('school_saas_refresh_token', refreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('school_saas_access_token');
        localStorage.removeItem('school_saas_refresh_token');
        localStorage.removeItem('school_saas_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
