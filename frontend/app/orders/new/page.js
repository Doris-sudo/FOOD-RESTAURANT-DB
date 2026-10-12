'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AlertMessage from '../../../components/AlertMessage';
import { getMenuItems, getCategories, getTables, createOrder } from '../../../lib/api';
import styles from './page.module.css';

export default function NewOrderPage() {
  const router = useRouter();

  // Data from API
  const [menuItems,   setMenuItems]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [tables,      setTables]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState('');

  // Picker state
  const [catFilter, setCatFilter] = useState(null);
  const [search,    setSearch]    = useState('');

  // Cart: { [menu_item_id]: { item, quantity } }
  const [cart, setCart] = useState({});

  // Order details
  const [customerName, setCustomerName] = useState('');
  const [tableId,      setTableId]      = useState('');
  const [notes,        setNotes]        = useState('');

  // Submission
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  // Load data on mount
  useEffect(() => {
    async function load() {
      try {
        const [items, cats, tbls] = await Promise.all([
          getMenuItems({ available: true }),
          getCategories(),
          getTables(),
        ]);
        setMenuItems(items);
        setCategories(cats);
        setTables(tbls);
      } catch (err) {
        setLoadError(err.message || 'Failed to load data. Is the API server running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtered menu for the picker
  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      if (catFilter !== null && item.category_id !== catFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return item.name.toLowerCase().includes(q) ||
               (item.category_name || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [menuItems, catFilter, search]);

  // Cart helpers
  function addItem(item) {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  }

  function changeQty(itemId, delta) {
    setCart((prev) => {
      const entry = prev[itemId];
      if (!entry) return prev;
      const newQty = entry.quantity + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...entry, quantity: newQty } };
    });
  }

  function removeItem(itemId) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }

  const cartEntries = Object.values(cart);
  const cartTotal   = cartEntries.reduce(
    (sum, e) => sum + parseFloat(e.item.price) * e.quantity, 0
  );

  // Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');

    if (cartEntries.length === 0) {
      setSubmitError('Please add at least one item to the order.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: customerName.trim() || null,
        table_id:      tableId ? parseInt(tableId, 10) : null,
        notes:         notes.trim() || null,
        items: cartEntries.map((e) => ({
          menu_item_id: e.item.id,
          quantity:     e.quantity,
        })),
      };
      const created = await createOrder(payload);
      router.push(`/orders/${created.id}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <h1>New Order</h1>
          <p className="text-muted mt-1">
            Select items from the menu, then fill in the order details.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className="container">
          {loadError && <AlertMessage type="error" message={loadError} />}

          {loading ? (
            <LoadingSpinner label="Loading menu…" />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.layout}>
                {/* ── Left: Menu Picker ─────────────────────── */}
                <div className={styles.pickerPanel}>
                  <div className={styles.panelHead}>
                    <h2>Menu</h2>
                    <input
                      type="search"
                      className={styles.searchInput}
                      placeholder="Search dishes…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search menu items"
                    />
                  </div>

                  {/* Category filter */}
                  <div className={styles.filterRow}>
                    <button
                      type="button"
                      className={`${styles.catBtn} ${catFilter === null ? styles.catBtnActive : ''}`}
                      onClick={() => setCatFilter(null)}
                    >
                      All
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`${styles.catBtn} ${catFilter === c.id ? styles.catBtnActive : ''}`}
                        onClick={() => setCatFilter(c.id)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  {/* Menu rows */}
                  <div className={styles.menuList} role="list">
                    {filtered.length === 0 ? (
                      <div className={styles.cartEmpty}>No items match your search.</div>
                    ) : (
                      filtered.map((item) => (
                        <div
                          key={item.id}
                          className={styles.menuRow}
                          role="listitem"
                          onClick={() => addItem(item)}
                        >
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={52}
                              height={52}
                              className={styles.menuThumb}
                            />
                          ) : (
                            <div className={styles.menuThumbPlaceholder} aria-hidden="true">🍽</div>
                          )}
                          <div className={styles.menuInfo}>
                            <div className={styles.menuName}>{item.name}</div>
                            <div className={styles.menuCat}>{item.category_name}</div>
                          </div>
                          <span className={styles.menuPrice}>
                            £{parseFloat(item.price).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            className={styles.addRowBtn}
                            onClick={(e) => { e.stopPropagation(); addItem(item); }}
                            aria-label={`Add ${item.name} to order`}
                          >
                            +
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ── Right: Order Panel ─────────────────────── */}
                <div className={styles.orderPanel}>

                  {/* Cart */}
                  <div className={styles.orderCard}>
                    <div className={styles.orderCardHead}>
                      <h2>
                        Your Order
                        {cartEntries.length > 0 && (
                          <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-sans)', fontWeight: 400, marginLeft: '0.5rem', opacity: 0.6 }}>
                            ({cartEntries.length} item{cartEntries.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </h2>
                    </div>
                    <div className={styles.orderCardBody}>
                      {cartEntries.length === 0 ? (
                        <p className={styles.cartEmpty}>
                          Click items on the left to add them here.
                        </p>
                      ) : (
                        <>
                          {cartEntries.map(({ item, quantity }) => (
                            <div key={item.id} className={styles.cartItem}>
                              <span className={styles.cartName}>{item.name}</span>
                              <div className={styles.qtyControls}>
                                <button
                                  type="button"
                                  className={styles.qtyBtn}
                                  onClick={() => changeQty(item.id, -1)}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                >
                                  −
                                </button>
                                <span className={styles.qty}>{quantity}</span>
                                <button
                                  type="button"
                                  className={styles.qtyBtn}
                                  onClick={() => changeQty(item.id, 1)}
                                  aria-label={`Increase quantity of ${item.name}`}
                                >
                                  +
                                </button>
                              </div>
                              <span className={styles.cartSubtotal}>
                                £{(parseFloat(item.price) * quantity).toFixed(2)}
                              </span>
                              <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => removeItem(item.id)}
                                aria-label={`Remove ${item.name} from order`}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <div className={styles.cartTotal}>
                            <span>Total</span>
                            <span className={styles.cartTotalAmount}>
                              £{cartTotal.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className={styles.orderCard}>
                    <div className={styles.orderCardHead}>
                      <h2>Details</h2>
                    </div>
                    <div className={styles.orderCardBody}>
                      <div className={styles.formGrid}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="customerName">
                            Customer Name
                          </label>
                          <input
                            id="customerName"
                            type="text"
                            className="form-input"
                            placeholder="e.g. James & Sarah"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="tableId">
                            Table
                          </label>
                          <select
                            id="tableId"
                            className="form-select"
                            value={tableId}
                            onChange={(e) => setTableId(e.target.value)}
                          >
                            <option value="">Takeout / No table</option>
                            {tables.map((t) => (
                              <option key={t.id} value={t.id}>
                                Table {t.number} (seats {t.capacity})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="notes">
                          Notes <span className="form-hint">(optional)</span>
                        </label>
                        <textarea
                          id="notes"
                          className="form-textarea"
                          rows={3}
                          placeholder="Allergies, special requests…"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  {submitError && <AlertMessage type="error" message={submitError} />}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full"
                    disabled={submitting || cartEntries.length === 0}
                  >
                    {submitting ? 'Placing Order…' : `Place Order · £${cartTotal.toFixed(2)}`}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
