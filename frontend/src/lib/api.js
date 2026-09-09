const BASE = import.meta.env.VITE_API_BASE ?? '';

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail;
    throw new Error(
      typeof detail === 'string' ? detail : 'Something went wrong. Please try again.',
    );
  }
  return payload;
}

export const api = {
  health: () => request('/api/health'),
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
