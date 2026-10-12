/**
 * controllers/ordersController.js
 *
 * Manages orders and their line items.
 *
 * Key design decisions:
 *  - Creating an order and its items is done in a single database transaction
 *    so the database never holds a partial order.
 *  - unit_price is snapshotted from the current menu item price at order time.
 *  - total_amount on the orders table is updated automatically after items are inserted.
 */

const pool = require('../db/pool');

// ─────────────────────────────────────────────
// GET /api/orders?status=&table_id=
// ─────────────────────────────────────────────
async function getAllOrders(req, res, next) {
  try {
    const { status, table_id } = req.query;
    const conditions = [];
    const params     = [];

    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }
    if (table_id) {
      params.push(parseInt(table_id, 10));
      conditions.push(`o.table_id = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT
         o.*,
         t.number AS table_number,
         COUNT(oi.id)::int AS item_count
       FROM orders o
       LEFT JOIN tables t  ON t.id = o.table_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${where}
       GROUP BY o.id, t.number
       ORDER BY o.created_at DESC`,
      params
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// GET /api/orders/:id  (with full line items)
// ─────────────────────────────────────────────
async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `SELECT o.*, t.number AS table_number
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE o.id = $1`,
      [id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const itemsResult = await pool.query(
      `SELECT
         oi.*,
         mi.name         AS item_name,
         mi.description  AS item_description,
         mi.image_url    AS item_image_url,
         c.name          AS category_name
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.menu_item_id
       JOIN categories c  ON c.id  = mi.category_id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...orderResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// POST /api/orders
// Body: { table_id?, customer_name?, notes?, items: [{ menu_item_id, quantity, notes? }] }
// ─────────────────────────────────────────────
async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const { table_id, customer_name, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'An order must contain at least one item.',
      });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.menu_item_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          error: 'Each item requires a valid menu_item_id and quantity >= 1.',
        });
      }
    }

    await client.query('BEGIN');

    // 1. Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (table_id, customer_name, notes, status, total_amount)
       VALUES ($1, $2, $3, 'pending', 0)
       RETURNING *`,
      [table_id || null, customer_name || null, notes || null]
    );
    const order = orderResult.rows[0];

    // 2. Fetch the current price for each menu item (price snapshot)
    const menuItemIds = [...new Set(items.map((i) => i.menu_item_id))];
    const priceResult = await client.query(
      `SELECT id, price, name, is_available
       FROM menu_items
       WHERE id = ANY($1::int[])`,
      [menuItemIds]
    );
    const priceMap = {};
    for (const row of priceResult.rows) {
      if (!row.is_available) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Menu item "${row.name}" is currently unavailable.`,
        });
      }
      priceMap[row.id] = row.price;
    }

    // Ensure all requested items were found
    for (const item of items) {
      if (priceMap[item.menu_item_id] === undefined) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Menu item with id ${item.menu_item_id} not found.`,
        });
      }
    }

    // 3. Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.menu_item_id, item.quantity, priceMap[item.menu_item_id], item.notes || null]
      );
    }

    // 4. Recalculate and update total_amount
    const totalResult = await client.query(
      `UPDATE orders
       SET total_amount = (
         SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1
       )
       WHERE id = $1
       RETURNING *`,
      [order.id]
    );

    await client.query('COMMIT');

    // Return the full order with items
    const newOrder = totalResult.rows[0];
    const newItems = await pool.query(
      `SELECT oi.*, mi.name AS item_name, mi.image_url AS item_image_url
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1`,
      [newOrder.id]
    );

    res.status(201).json({
      success: true,
      data: { ...newOrder, items: newItems.rows },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────
// PATCH /api/orders/:id/status
// Body: { status: 'pending'|'confirmed'|'preparing'|'ready'|'served'|'cancelled' }
// ─────────────────────────────────────────────
async function updateOrderStatus(req, res, next) {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/orders/:id
// ─────────────────────────────────────────────
async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// GET /api/orders/stats  — summary numbers for admin dashboard
// ─────────────────────────────────────────────
async function getOrderStats(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*)                                                    AS total_orders,
         COUNT(*) FILTER (WHERE status = 'pending')                 AS pending,
         COUNT(*) FILTER (WHERE status = 'confirmed')               AS confirmed,
         COUNT(*) FILTER (WHERE status = 'preparing')               AS preparing,
         COUNT(*) FILTER (WHERE status = 'ready')                   AS ready,
         COUNT(*) FILTER (WHERE status = 'served')                  AS served,
         COUNT(*) FILTER (WHERE status = 'cancelled')               AS cancelled,
         COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0) AS total_revenue
       FROM orders`
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
};
