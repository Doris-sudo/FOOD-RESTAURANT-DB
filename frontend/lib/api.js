/**
 * lib/api.js
 *
 * Centralised API helper.
 * All fetch calls go through here so the base URL is never hardcoded
 * across individual pages or components.
 *
 * Every public function returns the `data` payload from the API response,
 * and throws a descriptive Error on failure that the UI can catch and display.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Core fetch wrapper — handles status checks and JSON parsing.
 * @param {string} path   - e.g. '/menu-items'
 * @param {RequestInit} options - standard fetch options
 */
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = json?.error || `API error ${res.status}`;
    throw new Error(message);
  }

  return json.data;
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export async function getCategories() {
  return apiFetch('/categories');
}

export async function createCategory(body) {
  return apiFetch('/categories', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateCategory(id, body) {
  return apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function deleteCategory(id) {
  return apiFetch(`/categories/${id}`, { method: 'DELETE' });
}

// ─────────────────────────────────────────────
// Menu Items
// ─────────────────────────────────────────────

/**
 * @param {{ category_id?: number, available?: boolean, featured?: boolean }} filters
 */
export async function getMenuItems(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category_id !== undefined) params.set('category_id', filters.category_id);
  if (filters.available   !== undefined) params.set('available',   filters.available);
  if (filters.featured    !== undefined) params.set('featured',    filters.featured);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/menu-items${qs}`);
}

export async function getMenuItemById(id) {
  return apiFetch(`/menu-items/${id}`);
}

export async function createMenuItem(body) {
  return apiFetch('/menu-items', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateMenuItem(id, body) {
  return apiFetch(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function deleteMenuItem(id) {
  return apiFetch(`/menu-items/${id}`, { method: 'DELETE' });
}

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────

/**
 * @param {{ status?: string, table_id?: number }} filters
 */
export async function getOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status)   params.set('status',   filters.status);
  if (filters.table_id) params.set('table_id', filters.table_id);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/orders${qs}`);
}

export async function getOrderById(id) {
  return apiFetch(`/orders/${id}`);
}

/**
 * @param {{ table_id?: number, customer_name?: string, notes?: string,
 *           items: Array<{ menu_item_id: number, quantity: number, notes?: string }> }} body
 */
export async function createOrder(body) {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateOrderStatus(id, status) {
  return apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteOrder(id) {
  return apiFetch(`/orders/${id}`, { method: 'DELETE' });
}

export async function getOrderStats() {
  return apiFetch('/orders/stats');
}

// ─────────────────────────────────────────────
// Tables
// ─────────────────────────────────────────────

export async function getTables() {
  return apiFetch('/tables');
}
