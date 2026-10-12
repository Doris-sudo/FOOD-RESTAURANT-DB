/**
 * src/index.js — Express application entry point
 *
 * Wires together middleware, routes, and error handling.
 * The database pool is initialised when pool.js is first required
 * (which happens inside each controller).
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express    = require('express');
const cors       = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRouter       = require('./routes/auth');
const categoriesRouter = require('./routes/categories');
const menuItemsRouter  = require('./routes/menuItems');
const ordersRouter     = require('./routes/orders');
const tablesRouter     = require('./routes/tables');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Global middleware
// ─────────────────────────────────────────────

// CORS_ORIGIN can be a comma-separated list of allowed origins, e.g.:
//   http://localhost:3000,https://maison-laurel-frontend.onrender.com
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} is not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// API routes
// ─────────────────────────────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/categories',  categoriesRouter);
app.use('/api/menu-items',  menuItemsRouter);
app.use('/api/orders',      ordersRouter);
app.use('/api/tables',      tablesRouter);

// ─────────────────────────────────────────────
// 404 for unknown routes
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ─────────────────────────────────────────────
// Central error handler (must be last)
// ─────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🍽️  Restaurant API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
