/**
 * LoadingSpinner
 * Centred spinner with an optional label.
 */
export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="loading-center" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="text-muted">{label}</p>
    </div>
  );
}
