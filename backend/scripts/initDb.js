/**
 * scripts/initDb.js
 *
 * Runs schema.sql and seed.sql against the connected database.
 * Safe to run multiple times — schema uses DROP IF EXISTS + CREATE,
 * seed data is cleared and re-inserted.
 *
 * Usage:
 *   node scripts/initDb.js
 *
 * On Render, run this once from the Shell tab of your backend service
 * after the first deploy:
 *   node scripts/initDb.js
 */

const path = require('path');
const fs   = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME     || 'restaurant_db',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD,
    });

const sqlDir = path.join(__dirname, '../sql');

async function run() {
  const client = await pool.connect();
  try {
    console.log('🗄️  Running schema.sql…');
    const schema = fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅  Schema applied.');

    console.log('🌱  Running seed.sql…');
    const seed = fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8');
    await client.query(seed);
    console.log('✅  Seed data inserted.');

    console.log('\n🎉  Database initialised successfully.');
  } catch (err) {
    console.error('❌  Init failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
