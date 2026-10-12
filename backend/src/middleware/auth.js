/**
 * middleware/auth.js
 *
 * Verifies the JWT sent in the Authorization header.
 * Usage:  router.get('/protected', requireAuth, handler)
 * Optionally restrict to a role: requireRole('admin')
 */

const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name, role }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid token. Please log in again.';
    return res.status(401).json({ success: false, error: message });
  }
}

/**
 * requireRole('admin') — use after requireAuth
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
