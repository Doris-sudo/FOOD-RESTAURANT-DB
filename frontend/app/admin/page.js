'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { useAuth } from '../../context/AuthContext';
import {
  getOrderStats, getOrders, updateOrderStatus, deleteOrder,
  getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem,
  createCategory, deleteCategory,
} from '../../lib/api';
import { apiGetAllUsers, apiUpdateUserRole } from '../../lib/auth';
import styles from './page.module.css';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const EMPTY_ITEM = {
  name: '', category_id: '', price: '', description: '', image_url: '',
  is_available: true, is_featured: false,
};

const EMPTY_CAT = { name: '', description: '', sort_order: 0 };

export default function AdminPage() {
  const [tab, setTab] = useState('orders');

  // ── Stats ──────────────────────────────────
  const [stats,       setStats]       = useState(null);
  const [statsError,  setStatsError]  = useState('');

  // ── Orders ─────────────────────────────────
  const [orders,      setOrders]      = useState([]);
  const [ordersLoad,  setOrdersLoad]  = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderMsg,    setOrderMsg]    = useState('');

  // ── Menu Items ─────────────────────────────
  const [items,       setItems]       = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [itemsLoad,   setItemsLoad]   = useState(false);
  const [itemsError,  setItemsError]  = useState('');
  const [itemMsg,     setItemMsg]     = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem,  setEditingItem]  = useState(null);
  const [itemForm,     setItemForm]     = useState(EMPTY_ITEM);
  const [itemSaving,   setItemSaving]   = useState(false);

  // ── Categories ─────────────────────────────
  const [catLoad,     setCatLoad]     = useState(false);
  const [catError,    setCatError]    = useState('');
  const [catMsg,      setCatMsg]      = useState('');
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm,     setCatForm]     = useState(EMPTY_CAT);
  const [catSaving,   setCatSaving]   = useState(false);

  // ── Users ──────────────────────────────────
  const { token } = useAuth();
  const [users,     setUsers]     = useState([]);
  const [usersLoad, setUsersLoad] = useState(false);
  const [usersError,setUsersError]= useState('');
  const [usersMsg,  setUsersMsg]  = useState('');

  // ── Load on mount ──────────────────────────
  useEffect(() => {
    loadStats();
    loadOrders();
    loadMenuData();
    loadUsers();
  }, []);

  async function loadStats() {
    try {
      const data = await getOrderStats();
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    }
  }

  async function loadOrders() {
    setOrdersLoad(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoad(false);
    }
  }

  async function loadMenuData() {
    setItemsLoad(true);
    setCatLoad(true);
    try {
      const [itemsData, catsData] = await Promise.all([getMenuItems(), getCategories()]);
      setItems(itemsData);
      setCategories(catsData);
    } catch (err) {
      setItemsError(err.message);
      setCatError(err.message);
    } finally {
      setItemsLoad(false);
      setCatLoad(false);
    }
  }

  async function loadUsers() {
    if (!token) return;
    setUsersLoad(true);
    try {
      const res = await apiGetAllUsers(token);
      setUsers(res.data || []);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoad(false);
    }
  }

  async function handleRoleChange(userId, role) {
    try {
      await apiUpdateUserRole(token, userId, role);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
      setUsersMsg(`User role updated to "${role}".`);
      setTimeout(() => setUsersMsg(''), 3000);
    } catch (err) {
      setUsersError(err.message);
    }
  }

  // ── Orders actions ─────────────────────────
  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      setOrderMsg(`Order #${orderId} updated to "${status}".`);
      loadStats();
      setTimeout(() => setOrderMsg(''), 3000);
    } catch (err) {
      setOrdersError(err.message);
    }
  }

  async function handleDeleteOrder(orderId) {
    if (!confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setOrderMsg(`Order #${orderId} deleted.`);
      loadStats();
      setTimeout(() => setOrderMsg(''), 3000);
    } catch (err) {
      setOrdersError(err.message);
    }
  }

  // ── Menu item actions ──────────────────────
  function openAddItem() {
    setEditingItem(null);
    setItemForm(EMPTY_ITEM);
    setShowItemForm(true);
  }

  function openEditItem(item) {
    setEditingItem(item);
    setItemForm({
      name:         item.name,
      category_id:  item.category_id,
      price:        item.price,
      description:  item.description || '',
      image_url:    item.image_url    || '',
      is_available: item.is_available,
      is_featured:  item.is_featured,
    });
    setShowItemForm(true);
  }

  function cancelItemForm() {
    setShowItemForm(false);
    setEditingItem(null);
    setItemForm(EMPTY_ITEM);
    setItemsError('');
  }

  async function handleSaveItem(e) {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.category_id || !itemForm.price) {
      setItemsError('Name, category, and price are required.');
      return;
    }
    setItemSaving(true);
    setItemsError('');
    try {
      const payload = {
        ...itemForm,
        price:       parseFloat(itemForm.price),
        category_id: parseInt(itemForm.category_id, 10),
      };
      if (editingItem) {
        const updated = await updateMenuItem(editingItem.id, payload);
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? { ...i, ...updated } : i)));
        setItemMsg(`"${updated.name}" updated.`);
      } else {
        const created = await createMenuItem(payload);
        setItems((prev) => [created, ...prev]);
        setItemMsg(`"${created.name}" added to menu.`);
      }
      cancelItemForm();
      setTimeout(() => setItemMsg(''), 3500);
    } catch (err) {
      setItemsError(err.message);
    } finally {
      setItemSaving(false);
    }
  }

  async function handleDeleteItem(item) {
    if (!confirm(`Remove "${item.name}" from the menu? This cannot be undone.`)) return;
    try {
      await deleteMenuItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setItemMsg(`"${item.name}" removed.`);
      setTimeout(() => setItemMsg(''), 3000);
    } catch (err) {
      setItemsError(err.message);
    }
  }

  // ── Category actions ───────────────────────
  async function handleSaveCat(e) {
    e.preventDefault();
    if (!catForm.name.trim()) {
      setCatError('Category name is required.');
      return;
    }
    setCatSaving(true);
    setCatError('');
    try {
      const created = await createCategory(catForm);
      setCategories((prev) => [...prev, created]);
      setCatMsg(`Category "${created.name}" added.`);
      setShowCatForm(false);
      setCatForm(EMPTY_CAT);
      setTimeout(() => setCatMsg(''), 3000);
    } catch (err) {
      setCatError(err.message);
    } finally {
      setCatSaving(false);
    }
  }

  async function handleDeleteCat(cat) {
    if (!confirm(`Delete category "${cat.name}"? Menu items in this category cannot be deleted if they exist.`)) return;
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setCatMsg(`Category "${cat.name}" deleted.`);
      setTimeout(() => setCatMsg(''), 3000);
    } catch (err) {
      setCatError(err.message);
    }
  }

  // ── Render ─────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Manage orders, menu items, and categories.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* Stats */}
        {statsError && <AlertMessage type="error" message={statsError} />}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Orders</div>
              <div className={styles.statValue}>{stats.total_orders}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Active</div>
              <div className={styles.statValue}>
                {parseInt(stats.pending||0) + parseInt(stats.confirmed||0) + parseInt(stats.preparing||0) + parseInt(stats.ready||0)}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Menu Items</div>
              <div className={styles.statValue}>{items.length}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Registered Users</div>
              <div className={styles.statValue}>{users.length}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Revenue (non-cancelled)</div>
              <div className={`${styles.statValue} ${styles.statValueAccent}`}>
                £{parseFloat(stats.total_revenue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          {['orders', 'menu', 'categories', 'users'].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
              style={{ textTransform: 'capitalize' }}
            >
              {t === 'menu' ? 'Menu Items' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ─────────────────────────────────── */}
        {tab === 'orders' && (
          <div role="tabpanel">
            {orderMsg    && <AlertMessage type="success" message={orderMsg} />}
            {ordersError && <AlertMessage type="error"   message={ordersError} onClose={() => setOrdersError('')} />}
            <div className={styles.sectionBar}>
              <h2 style={{ fontSize: '1.15rem' }}>All Orders</h2>
              <Link href="/orders/new" className="btn btn-primary btn-sm">+ New Order</Link>
            </div>
            {ordersLoad ? <LoadingSpinner /> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Table</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Placed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No orders yet.</td></tr>
                    ) : orders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>#{order.id}</td>
                        <td>{order.customer_name || '—'}</td>
                        <td>{order.table_number ? `T${order.table_number}` : '—'}</td>
                        <td>{order.item_count}</td>
                        <td className="price">£{parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--white)', cursor: 'pointer' }}
                            aria-label={`Status for order ${order.id}`}
                          >
                            {['pending','confirmed','preparing','ready','served','cancelled'].map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', opacity: 0.65 }}>
                          {new Date(order.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })}
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <Link href={`/orders/${order.id}`} className="btn btn-ghost btn-sm">View</Link>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.tableFooter}>{orders.length} order{orders.length !== 1 ? 's' : ''} total</div>
              </div>
            )}
          </div>
        )}

        {/* ── MENU ITEMS TAB ─────────────────────────────── */}
        {tab === 'menu' && (
          <div role="tabpanel">
            {itemMsg    && <AlertMessage type="success" message={itemMsg}    />}
            {itemsError && <AlertMessage type="error"   message={itemsError} onClose={() => setItemsError('')} />}

            <div className={styles.sectionBar}>
              <h2 style={{ fontSize: '1.15rem' }}>Menu Items</h2>
              {!showItemForm && (
                <button className="btn btn-primary btn-sm" onClick={openAddItem}>+ Add Item</button>
              )}
            </div>

            {/* Add / Edit form */}
            {showItemForm && (
              <div className={styles.formPanel}>
                <h3>{editingItem ? `Edit: ${editingItem.name}` : 'Add New Menu Item'}</h3>
                <form onSubmit={handleSaveItem}>
                  <div className={styles.formGrid3}>
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input className="form-input" value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select className="form-select" value={itemForm.category_id}
                        onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}>
                        <option value="">Select…</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price (£) *</label>
                      <input type="number" step="0.01" min="0" className="form-input"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={2} value={itemForm.description}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input type="url" className="form-input" placeholder="https://…"
                      value={itemForm.image_url}
                      onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })} />
                  </div>
                  <div className={styles.formGrid2} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={itemForm.is_available}
                        onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })} />
                      Available
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={itemForm.is_featured}
                        onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })} />
                      Featured on homepage
                    </label>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-ghost" onClick={cancelItemForm}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={itemSaving}>
                      {itemSaving ? 'Saving…' : editingItem ? 'Save Changes' : 'Add to Menu'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {itemsLoad ? <LoadingSpinner /> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Available</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No items yet.</td></tr>
                    ) : items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemDesc}>{item.description}</div>
                        </td>
                        <td>{item.category_name}</td>
                        <td className="price">£{parseFloat(item.price).toFixed(2)}</td>
                        <td>
                          <span className={`${styles.dot} ${item.is_available ? styles.dotOn : styles.dotOff}`} title={item.is_available ? 'Available' : 'Unavailable'} />
                        </td>
                        <td>{item.is_featured ? '★' : '—'}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditItem(item)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.tableFooter}>{items.length} item{items.length !== 1 ? 's' : ''} total</div>
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORIES TAB ─────────────────────────────── */}
        {tab === 'categories' && (
          <div role="tabpanel">
            {catMsg    && <AlertMessage type="success" message={catMsg}    />}
            {catError  && <AlertMessage type="error"   message={catError}  onClose={() => setCatError('')} />}

            <div className={styles.sectionBar}>
              <h2 style={{ fontSize: '1.15rem' }}>Categories</h2>
              {!showCatForm && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowCatForm(true)}>+ Add Category</button>
              )}
            </div>

            {showCatForm && (
              <div className={styles.formPanel}>
                <h3>Add New Category</h3>
                <form onSubmit={handleSaveCat}>
                  <div className={styles.formGrid3}>
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input className="form-input" value={catForm.name}
                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <input className="form-input" value={catForm.description}
                        onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sort Order</label>
                      <input type="number" className="form-input" value={catForm.sort_order}
                        onChange={(e) => setCatForm({ ...catForm, sort_order: parseInt(e.target.value, 10) || 0 })} />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-ghost" onClick={() => { setShowCatForm(false); setCatForm(EMPTY_CAT); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={catSaving}>
                      {catSaving ? 'Saving…' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {catLoad ? <LoadingSpinner /> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Sort Order</th>
                      <th>Items</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No categories yet.</td></tr>
                    ) : categories.map((cat) => {
                      const itemCount = items.filter((i) => i.category_id === cat.id).length;
                      return (
                        <tr key={cat.id}>
                          <td style={{ fontWeight: 600 }}>{cat.name}</td>
                          <td style={{ opacity: 0.65, fontSize: '0.85rem' }}>{cat.description || '—'}</td>
                          <td>{cat.sort_order}</td>
                          <td>{itemCount}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteCat(cat)}
                              disabled={itemCount > 0}
                              title={itemCount > 0 ? 'Remove all items first' : 'Delete category'}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className={styles.tableFooter}>{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ──────────────────────────────────── */}
        {tab === 'users' && (
          <div role="tabpanel">
            {usersMsg   && <AlertMessage type="success" message={usersMsg}    />}
            {usersError && <AlertMessage type="error"   message={usersError}  onClose={() => setUsersError('')} />}

            <div className={styles.sectionBar}>
              <h2 style={{ fontSize: '1.15rem' }}>Registered Users</h2>
              <button className="btn btn-ghost btn-sm" onClick={loadUsers}>↻ Refresh</button>
            </div>

            {usersLoad ? <LoadingSpinner /> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No registered users yet.</td></tr>
                    ) : users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ opacity: 0.5, fontSize: '0.8rem' }}>{u.id}</td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ fontSize: '0.875rem', opacity: 0.75 }}>{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--white)', cursor: 'pointer' }}
                            aria-label={`Role for ${u.name}`}
                          >
                            {['customer', 'staff', 'admin'].map((r) => (
                              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ fontSize: '0.8rem', opacity: 0.6, whiteSpace: 'nowrap' }}>
                          {new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.tableFooter}>
                  {users.length} registered user{users.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
