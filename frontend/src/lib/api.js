const BASE = import.meta.env.VITE_API_BASE ?? '';
const TOKEN_KEY = 'veripack.token';

export const tokenStore = {
  read: () => localStorage.getItem(TOKEN_KEY),
  write: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const UNAUTHORIZED_EVENT = 'veripack:unauthorized';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const token = tokenStore.read();
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    const detail = payload?.detail;
    throw new ApiError(
      typeof detail === 'string' ? detail : 'Something went wrong. Please try again.',
      response.status,
    );
  }
  return payload;
}

const json = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const api = {
  health: () => request('/api/health'),
  signup: (payload) => json('/api/auth/signup', payload),
  login: (payload) => json('/api/auth/login', payload),
  me: () => request('/api/auth/me'),
  categories: () => request('/api/rules/categories'),
  samples: () => request('/api/samples'),
  createScan: (file, category) => {
    const body = new FormData();
    body.append('image', file);
    body.append('category', category);
    return request('/api/scans', { method: 'POST', body });
  },
  createDemoScan: (sample) =>
    request(`/api/scans/demo?sample=${encodeURIComponent(sample)}`, { method: 'POST' }),
  listScans: ({ page = 1, pageSize = 12, verdict, category } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (verdict) params.set('verdict', verdict);
    if (category) params.set('category', category);
    return request(`/api/scans?${params}`);
  },
  getScan: (id) => request(`/api/scans/${id}`),
  deleteScan: (id) => request(`/api/scans/${id}`, { method: 'DELETE' }),
};

export const mediaUrl = (path) => (path ? `${BASE}${path}` : null);
