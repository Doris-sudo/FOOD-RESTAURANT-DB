-- ============================================================
-- Restaurant Management System - Database Schema
-- ============================================================
-- Run this file first to create all tables and relationships.
-- psql -U postgres -d restaurant_db -f schema.sql
-- ============================================================

-- Drop tables in reverse dependency order (clean slate for re-runs)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;

-- ============================================================
-- CATEGORIES
-- Groups menu items (e.g. Starters, Mains, Desserts, Drinks)
-- ============================================================
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MENU ITEMS
-- Individual dishes or drinks available to order
-- ============================================================
CREATE TABLE menu_items (
  id           SERIAL PRIMARY KEY,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url    TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLES
-- Physical restaurant tables that orders are placed for
-- ============================================================
CREATE TABLE tables (
  id         SERIAL PRIMARY KEY,
  number     INTEGER NOT NULL UNIQUE,
  capacity   INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- A single order placed at a table (or for takeout)
-- ============================================================
CREATE TABLE orders (
  id           SERIAL PRIMARY KEY,
  table_id     INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  customer_name VARCHAR(150),
  status       VARCHAR(50) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  notes        TEXT,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- Line items within an order (menu_item + quantity + price snapshot)
-- Price is snapshotted at order time so historical records stay accurate
-- ============================================================
CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal     NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for common query patterns
-- ============================================================
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_featured ON menu_items(is_featured);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item ON order_items(menu_item_id);

-- ============================================================
-- TRIGGER: auto-update updated_at on menu_items and orders
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
