/**
 * db/pool.js
 *
 * Creates and exports a single pg.Pool instance that all controllers share.
 * Using a pool (rather than a single client) allows the server to handle
 * multiple concurrent requests without blocking.
 */

const { Pool } = require('pg');
const path = require('path');

// Resolve .env relative to the backend root so it loads correctly
// regardless of which directory the process is started from.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DB_PASSWORD) {
  console.warn('⚠️   DB_PASSWORD is not set — check that backend/.env exists and has DB_PASSWORD filled in.');
}

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'restaurant_db',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD, // no empty-string fallback — pg needs a real string or undefined
});

// Verify connectivity on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Database connection error:', err.message);
    console.error('    Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in backend/.env');
  } else {
    console.log(`✅  Connected to PostgreSQL  (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'restaurant_db'})`);
    release();
  }
});

module.exports = pool;
