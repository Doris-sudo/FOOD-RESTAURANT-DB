/**
 * db/pool.js
 *
 * Creates and exports a single pg.Pool instance.
 *
 * Render (and most cloud platforms) provide a single DATABASE_URL
 * connection string instead of individual host/port/name/user/password vars.
 * This file handles both cases:
 *   - Production (Render):  DATABASE_URL=postgres://user:pass@host/db
 *   - Local development:    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

const { Pool } = require('pg');
const path     = require('path');

// Load .env when running locally (no-op in production where vars are injected)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let pool;

if (process.env.DATABASE_URL) {
  // ── Render / cloud deployment ──────────────────────────────
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Render's managed Postgres
  });
} else {
  // ── Local development ──────────────────────────────────────
  if (!process.env.DB_PASSWORD) {
    console.warn('⚠️   DB_PASSWORD is not set — check that backend/.env exists.');
  }
  pool = new Pool({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'restaurant_db',
    user:     process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });
}

// Verify connectivity on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Database connection error:', err.message);
    console.error('    Check DATABASE_URL (production) or DB_* vars (local) in your environment.');
  } else {
    const db = process.env.DATABASE_URL
      ? process.env.DATABASE_URL.split('@')[1] || 'remote'
      : `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'restaurant_db'}`;
    console.log(`✅  Connected to PostgreSQL  (${db})`);
    release();
  }
});

module.exports = pool;
