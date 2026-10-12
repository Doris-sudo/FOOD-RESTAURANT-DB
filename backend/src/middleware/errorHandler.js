/**
 * middleware/errorHandler.js
 *
 * Central error-handling middleware.
 * Express calls this when next(err) is used in a route handler.
 * Always returns a consistent JSON shape so the frontend can rely on it.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('Server error:', err);

  // PostgreSQL foreign-key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Related record not found. Check that all IDs are valid.',
    });
  }

  // PostgreSQL unique-constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'A record with that value already exists.',
    });
  }

  // PostgreSQL check-constraint violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      error: 'One or more values failed a database constraint.',
    });
  }

  const status  = err.status  || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ success: false, error: message });
}

module.exports = errorHandler;
