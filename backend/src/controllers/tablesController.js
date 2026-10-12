/**
 * controllers/tablesController.js
 *
 * Simple read-only access to restaurant tables.
 * Tables are seeded and rarely change, but the frontend needs the list
 * for the order-creation form.
 */

const pool = require('../db/pool');

// GET /api/tables
async function getAllTables(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM tables ORDER BY number ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllTables };
