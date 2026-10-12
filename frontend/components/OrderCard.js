import Link from 'next/link';
import StatusBadge from './StatusBadge';
import styles from './OrderCard.module.css';

/**
 * OrderCard
 * Summary card shown in the orders list.
 *
 * Props:
 *   order — order object from GET /api/orders
 */
export default function OrderCard({ order }) {
  const createdAt = new Date(order.created_at).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const total = parseFloat(order.total_amount).toFixed(2);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.orderId}>Order #{order.id}</span>
          <span className={styles.customerName}>
            {order.customer_name || 'Walk-in guest'}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className={styles.details}>
        {order.table_number && (
          <span>🪑 Table {order.table_number}</span>
        )}
        <span>📋 {order.item_count ?? 0} item{order.item_count !== 1 ? 's' : ''}</span>
        <span>🕐 {createdAt}</span>
      </div>

      {order.notes && (
        <p className={styles.notes}>"{order.notes}"</p>
      )}

      <div className={styles.footer}>
        <span className={styles.total}>£{total}</span>
        <div className={styles.actions}>
          <Link href={`/orders/${order.id}`} className={styles.viewBtn}>
            View Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
