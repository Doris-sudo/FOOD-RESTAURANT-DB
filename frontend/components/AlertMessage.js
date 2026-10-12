'use client';

/**
 * AlertMessage
 * Renders success, error, or info banners.
 *
 * Props:
 *   type    — 'success' | 'error' | 'info'
 *   message — string to display
 *   onClose — optional callback to dismiss
 */
export default function AlertMessage({ type = 'info', message, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`alert alert-${type}`}
      role="alert"
      aria-live="assertive"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: 1,
            marginLeft: '1rem',
            opacity: 0.6,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
