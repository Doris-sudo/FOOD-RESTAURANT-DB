'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OrderCard from '../../components/OrderCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { getOrders } from '../../lib/api';
import styles from './page.module.css';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [status,  setStatus]  = useState('all');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const filters = status !== 'all' ? { status } : {};
        const data = await getOrders(filters);
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to load orders. Is the API server running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status]);

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerInner}>
            <div>
              <h1>Orders</h1>
              {!loading && (
                <p className={styles.count}>
                  {orders.length} order{orders.length !== 1 ? 's' : ''}
                  {status !== 'all' ? ` · ${status}` : ''}
                </p>
              )}
            </div>
            <Link href="/orders/new" className="btn btn-primary">
              + New Order
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className="container">
          {error && <AlertMessage type="error" message={error} />}

          {/* Status filters */}
          <div className={styles.filters}>
            <span className={styles.filterLabel}>Filter:</span>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                className={`${styles.filterBtn} ${status === s ? styles.filterActive : ''}`}
                onClick={() => setStatus(s)}
                style={{ textTransform: 'capitalize' }}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <LoadingSpinner label="Loading orders…" />
          ) : orders.length > 0 ? (
            <div className={styles.grid}>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">📋</span>
              <h3>No orders found</h3>
              <p>
                {status !== 'all'
                  ? `No ${status} orders at the moment.`
                  : 'No orders have been placed yet.'}
              </p>
              <Link href="/orders/new" className="btn btn-primary mt-2">
                Place First Order
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
