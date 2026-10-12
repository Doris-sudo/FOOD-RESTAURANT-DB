/**
 * controllers/categoriesController.js
 *
 * CRUD operations for menu categories.
 * All database work goes through the shared pg Pool.
 */

const pool = require('../db/pool');

// GET /api/categories
async function getAllCategories(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY sort_order ASC, name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/categories/:id
async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// POST /api/categories
async function createCategory(req, res, next) {
  try {
    const { name, description, sort_order = 0 } = req.body;
    const result = await pool.query(
      `INSERT INTO categories (name, description, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, sort_order]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/categories/:id
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, sort_order } = req.body;
    const result = await pool.query(
      `UPDATE categories
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           sort_order  = COALESCE($3, sort_order)
       WHERE id = $4
       RETURNING *`,
      [name, description, sort_order, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/categories/:id
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
