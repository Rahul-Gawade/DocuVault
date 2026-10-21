const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('docuvault_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('docuvault_token', token);
  else localStorage.removeItem('docuvault_token');
};

export async function apiRequest(endpoint, { method = 'GET', body, isFormData = false, headers = {} } = {}) {
  const token = getAuthToken();
  const reqHeaders = {
    ...headers,
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && body && typeof body === 'object') {
    reqHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: reqHeaders,
    body,
  });

  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || res.statusText || 'An error occurred';
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => apiRequest('/auth/register', { method: 'POST', body: { name, email, password } }),
  me: () => apiRequest('/auth/me'),
  verifyEmail: (token) => apiRequest('/auth/verify-email', { method: 'POST', body: { token } }),
  resendVerification: (email) => apiRequest('/auth/resend-verification', { method: 'POST', body: { email } }),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, newPassword) => apiRequest('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),
};

// Documents API (Owner)
export const documentsApi = {
  list: ({ status = 'all', search = '', page = 1, limit = 12 } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);
    return apiRequest(`/documents?${params.toString()}`);
  },
  get: (id) => apiRequest(`/documents/${id}`),
  upload: (formData) => apiRequest('/documents', { method: 'POST', body: formData, isFormData: true }),
  delete: (id) => apiRequest(`/documents/${id}`, { method: 'DELETE' }),
  inviteRecipient: (id, { name, email }) => apiRequest(`/documents/${id}/recipients`, { method: 'POST', body: { name, email } }),
  removeRecipient: (id, recipientId) => apiRequest(`/documents/${id}/recipients/${recipientId}`, { method: 'DELETE' }),
  getAudit: (id) => apiRequest(`/documents/${id}/audit`),
};

// Access API (Recipient public link)
export const accessApi = {
  get: (token) => apiRequest(`/access/${token}`),
  sign: (token, signatureData) => apiRequest(`/access/${token}/sign`, { method: 'POST', body: { signatureData } }),
};
