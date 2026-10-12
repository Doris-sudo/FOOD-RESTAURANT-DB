/**
 * middleware/validate.js
 *
 * Simple request-body validation helpers used by route handlers.
 * Returns 400 with a descriptive message when required fields are missing
 * or contain invalid values.
 */

/**
 * Checks that all keys listed in `fields` exist and are non-empty on req.body.
 * Usage:  requireFields(['name', 'price'])(req, res, next)
 */
function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter(
      (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
    );
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = { requireFields };
