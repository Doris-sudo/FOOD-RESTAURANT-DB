'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '../../../components/StatusBadge';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AlertMessage from '../../../components/AlertMessage';
import { getOrderById, updateOrderStatus } from '../../../lib/api';
import styles from './page.module.css';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [newStatus,    setNewStatus]    = useState('');
  const [updating,     setUpdating]     = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError,   setUpdateError]   = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getOrderById(id);
        setOrder(data);
        setNewStatus(data.status);
      } catch (err) {
        setError(err.message || 'Order not found.');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  async function handleStatusUpdate(e) {
    e.preventDefault();
    if (newStatus === order.status) return;
    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrder((prev) => ({ ...prev, status: updated.status }));
      setUpdateSuccess(`Status updated to "${updated.status}".`);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <LoadingSpinner label="Loading order…" />
    </div>
  );

  if (error) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <AlertMessage type="error" message={error} />
      <Link href="/orders" className="btn btn-ghost mt-2">← Back to Orders</Link>
    </div>
  );

  if (!order) return null;

  const createdAt = new Date(order.created_at).toLocaleString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const total = parseFloat(order.total_amount).toFixed(2);

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <Link href="/orders" className={styles.backLink}>
            ← Back to Orders
          </Link>
          <div className={styles.headerInner}>
            <div className={styles.titleRow}>
              <h1>Order #{order.id}</h1>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className="container">
          <div className={styles.layout}>
            {/* Items */}
            <div>
              <div className={styles.itemsCard}>
                <h2>Order Items</h2>
                {order.items && order.items.length > 0 ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className={styles.itemName}>{item.item_name}</div>
                            {item.notes && (
                              <div className={styles.itemNote}>Note: {item.notes}</div>
                            )}
                          </td>
                          <td>{item.quantity}</td>
                          <td>£{parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className={styles.itemTotal}>
                            £{parseFloat(item.subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className={styles.totalRow}>
                        <td colSpan={3}>Total</td>
                        <td className={styles.totalAmount}>£{total}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>No items in this order.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>
              {/* Order Info */}
              <div className={styles.infoCard}>
                <h3>Order Info</h3>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Customer</span>
                  <span className={styles.infoValue}>
                    {order.customer_name || 'Walk-in guest'}
                  </span>
                </div>
                {order.table_number && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Table</span>
                    <span className={styles.infoValue}>Table {order.table_number}</span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Placed at</span>
                  <span className={styles.infoValue}>{createdAt}</span>
                </div>
                {order.notes && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Notes</span>
                    <span className={styles.infoValue} style={{ fontStyle: 'italic' }}>
                      {order.notes}
                    </span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Total</span>
                  <span className={styles.infoValue} style={{ color: 'var(--burgundy)', fontSize: '1.1rem' }}>
                    £{total}
                  </span>
                </div>
              </div>

              {/* Update status */}
              <div className={styles.statusCard}>
                <h3>Update Status</h3>
                {updateSuccess && <AlertMessage type="success" message={updateSuccess} />}
                {updateError   && <AlertMessage type="error"   message={updateError}   />}
                <form onSubmit={handleStatusUpdate}>
                  <select
                    className={styles.statusSelect}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    aria-label="Order status"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} style={{ textTransform: 'capitalize' }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={updating || newStatus === order.status}
                  >
                    {updating ? 'Saving…' : 'Save Status'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
