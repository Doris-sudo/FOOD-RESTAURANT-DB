/**
 * controllers/menuItemsController.js
 *
 * CRUD operations for menu items.
 * Supports filtering by category, availability, and featured status.
 */

const pool = require('../db/pool');

// GET /api/menu-items?category_id=&available=&featured=
async function getAllMenuItems(req, res, next) {
  try {
    const { category_id, available, featured } = req.query;

    // Build a dynamic WHERE clause
    const conditions = [];
    const params     = [];

    if (category_id) {
      params.push(parseInt(category_id, 10));
      conditions.push(`mi.category_id = $${params.length}`);
    }
    if (available !== undefined) {
      params.push(available === 'true');
      conditions.push(`mi.is_available = $${params.length}`);
    }
    if (featured !== undefined) {
      params.push(featured === 'true');
      conditions.push(`mi.is_featured = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT
         mi.*,
         c.name AS category_name,
         c.sort_order AS category_sort_order
       FROM menu_items mi
       JOIN categories c ON c.id = mi.category_id
       ${where}
       ORDER BY c.sort_order ASC, mi.name ASC`,
      params
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/menu-items/:id
async function getMenuItemById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT mi.*, c.name AS category_name
       FROM menu_items mi
       JOIN categories c ON c.id = mi.category_id
       WHERE mi.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// POST /api/menu-items
async function createMenuItem(req, res, next) {
  try {
    const {
      category_id,
      name,
      description,
      price,
      image_url,
      is_available = true,
      is_featured  = false,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO menu_items
         (category_id, name, description, price, image_url, is_available, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [category_id, name, description, price, image_url, is_available, is_featured]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/menu-items/:id
async function updateMenuItem(req, res, next) {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      image_url,
      is_available,
      is_featured,
    } = req.body;

    const result = await pool.query(
      `UPDATE menu_items
       SET category_id  = COALESCE($1, category_id),
           name         = COALESCE($2, name),
           description  = COALESCE($3, description),
           price        = COALESCE($4, price),
           image_url    = COALESCE($5, image_url),
           is_available = COALESCE($6, is_available),
           is_featured  = COALESCE($7, is_featured)
       WHERE id = $8
       RETURNING *`,
      [category_id, name, description, price, image_url, is_available, is_featured, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/menu-items/:id
async function deleteMenuItem(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM menu_items WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item deleted', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
