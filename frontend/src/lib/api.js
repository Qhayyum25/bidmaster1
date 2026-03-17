/**
 * BidMasters API Client
 * Centralised fetch wrapper that automatically injects the auth token.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('bidmasters_token') || ''
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`)
  }

  return data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: { name, email, password } }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  me: () => request('/auth/me', { auth: true }),
}

// ─── Auctions ─────────────────────────────────────────────────────────────────
export const auctionsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/auctions${qs ? '?' + qs : ''}`)
  },

  get: (id) => request(`/auctions/${id}`),

  create: (data) => request('/auctions', { method: 'POST', body: data, auth: true }),

  update: (id, data) => request(`/auctions/${id}`, { method: 'PUT', body: data, auth: true }),

  setStatus: (id, status, extendMinutes) =>
    request(`/auctions/${id}/status`, {
      method: 'PATCH',
      body: { status, extendMinutes },
      auth: true,
    }),

  delete: (id) => request(`/auctions/${id}`, { method: 'DELETE', auth: true }),
}

// ─── Bids ─────────────────────────────────────────────────────────────────────
export const bidsApi = {
  place: (auctionId, amount) =>
    request('/bids', { method: 'POST', body: { auctionId, amount }, auth: true }),

  forAuction: (auctionId) => request(`/bids/${auctionId}`),

  myBids: () => request('/bids/user/me', { auth: true }),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  myTransactions: () => request('/users/me/transactions', { auth: true }),

  topUp: (amount, method) =>
    request('/users/me/topup', { method: 'POST', body: { amount, method }, auth: true }),

  updateMe: (data) => request('/users/me', { method: 'PATCH', body: data, auth: true }),

  // admin
  list: () => request('/users', { auth: true }),

  patch: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: data, auth: true }),
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiApi = {
  suggest: (auction, userStats) =>
    request('/ai/suggest', { method: 'POST', body: { auction, userStats } }),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => request('/admin/dashboard', { auth: true }),

  reportBids: () => `${BASE_URL}/admin/reports/bids`,

  reportWinners: () => `${BASE_URL}/admin/reports/winners`,
}
