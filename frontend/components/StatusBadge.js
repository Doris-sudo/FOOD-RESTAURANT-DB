/**
 * StatusBadge
 * Renders a coloured pill for an order status.
 * Statuses: pending | confirmed | preparing | ready | served | cancelled
 */
export default function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`badge badge-${status}`} role="status">
      {label}
    </span>
  );
}
