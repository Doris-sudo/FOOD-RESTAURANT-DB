/**
 * lib/auth.js
 * Low-level auth API calls — kept separate from the main api.js
 * so auth logic is easy to find and audit.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function authFetch(path, options = {}) {
  const res  = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Auth error ${res.status}`);
  return json;
}

export async function apiRegister({ name, email, password }) {
  return authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiLogin({ email, password }) {
  return authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetMe(token) {
  return authFetch('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiGetAllUsers(token) {
  return authFetch('/auth/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiUpdateUserRole(token, userId, role) {
  return authFetch(`/auth/users/${userId}/role`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role }),
  });
}

// ── Token helpers (localStorage) ──────────────────────────────
export const TOKEN_KEY = 'ml_token';
export const USER_KEY  = 'ml_user';

export function saveSession(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadSession() {
  if (typeof window === 'undefined') return { token: null, user: null };
  const token = localStorage.getItem(TOKEN_KEY);
  const raw   = localStorage.getItem(USER_KEY);
  const user  = raw ? JSON.parse(raw) : null;
  return { token, user };
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
