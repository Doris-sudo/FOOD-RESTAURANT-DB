# Maison Laurel — Restaurant Management System

A full-stack restaurant management application built with **Next.js**, **Express.js**, and **PostgreSQL**.

---

## Project Structure

```
Food restaurant db/
├── backend/                  Express REST API
│   ├── sql/
│   │   ├── schema.sql        Database table definitions
│   │   └── seed.sql          Sample categories, menu items, and orders
│   ├── src/
│   │   ├── db/
│   │   │   └── pool.js       PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   ├── errorHandler.js  Central error handling
│   │   │   └── validate.js      Request body validation
│   │   ├── controllers/
│   │   │   ├── categoriesController.js
│   │   │   ├── menuItemsController.js
│   │   │   ├── ordersController.js
│   │   │   └── tablesController.js
│   │   ├── routes/
│   │   │   ├── categories.js
│   │   │   ├── menuItems.js
│   │   │   ├── orders.js
│   │   │   └── tables.js
│   │   └── index.js          Express entry point
│   ├── .env.example          Environment variable template
│   └── package.json
│
└── frontend/                 Next.js App Router application
    ├── app/
    │   ├── layout.js         Root layout (Navbar + Footer)
    │   ├── globals.css       Design system & global styles
    │   ├── page.js           / — Homepage
    │   ├── menu/
    │   │   └── page.js       /menu — Full menu with filtering
    │   ├── orders/
    │   │   ├── page.js       /orders — Orders list
    │   │   ├── [id]/
    │   │   │   └── page.js   /orders/:id — Order detail & status update
    │   │   └── new/
    │   │       └── page.js   /orders/new — Create an order
    │   └── admin/
    │       └── page.js       /admin — Management dashboard
    ├── components/           Reusable UI components
    ├── lib/
    │   └── api.js            Centralised API helper (uses NEXT_PUBLIC_API_URL)
    ├── .env.local.example    Frontend environment variable template
    └── package.json
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18 or higher | https://nodejs.org |
| npm | 9 or higher | Comes with Node.js |
| PostgreSQL | 14 or higher | https://www.postgresql.org/download |

---

## 1 — Set Up PostgreSQL

### 1a. Create the database

Open **psql** (the PostgreSQL command-line tool) and run:

```sql
CREATE DATABASE restaurant_db;
```

Or use pgAdmin: right-click "Databases" → Create → Database → name it `restaurant_db`.

### 1b. Run the schema

From the project root, run both SQL files in order:

```bash
# Windows PowerShell
psql -U postgres -d restaurant_db -f "backend/sql/schema.sql"
psql -U postgres -d restaurant_db -f "backend/sql/seed.sql"
```

Or open each file in pgAdmin's Query Tool and click Run.

**What this creates:**

| Table | Purpose |
|-------|---------|
| `categories` | Menu categories (Starters, Mains, etc.) |
| `menu_items` | Individual dishes with price, description, image |
| `tables` | Physical restaurant tables 1–10 |
| `orders` | Customer orders with status tracking |
| `order_items` | Line items linking orders to menu items |

---

## 2 — Configure Environment Variables

### Backend

```bash
cd backend
copy .env.example .env
```

Open `backend/.env` and fill in your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend

```bash
cd frontend
copy .env.local.example .env.local
```

The default value is correct if the backend runs on port 5000:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 3 — Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a separate terminal)
cd frontend
npm install
```

---

## 4 — Run the Applications

You need **two terminal windows** — one for each application.

### Terminal 1 — Backend (Express API)

```bash
cd backend
npm run dev
```

Expected output:
```
✅  Connected to PostgreSQL database
🍽️  Restaurant API running on http://localhost:5000
   Health: http://localhost:5000/api/health
```

### Terminal 2 — Frontend (Next.js)

```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 5 — Pages

| URL | Description |
|-----|-------------|
| `http://localhost:3000/` | Homepage with featured dishes |
| `http://localhost:3000/menu` | Full menu with category filtering and search |
| `http://localhost:3000/orders` | All orders with status filtering |
| `http://localhost:3000/orders/new` | Create a new order |
| `http://localhost:3000/orders/:id` | Order detail + update status |
| `http://localhost:3000/admin` | Admin dashboard |

---

## 6 — API Endpoints

Base URL: `http://localhost:5000/api`

### Health Check
```
GET  /health
```

### Categories
```
GET    /categories
GET    /categories/:id
POST   /categories          Body: { name, description?, sort_order? }
PUT    /categories/:id      Body: any field to update
DELETE /categories/:id
```

### Menu Items
```
GET    /menu-items?category_id=&available=&featured=
GET    /menu-items/:id
POST   /menu-items          Body: { category_id, name, price, description?, image_url?, is_available?, is_featured? }
PUT    /menu-items/:id      Body: any field to update
DELETE /menu-items/:id
```

### Orders
```
GET    /orders?status=&table_id=
GET    /orders/stats
GET    /orders/:id           Returns order + full line items
POST   /orders               Body: { customer_name?, table_id?, notes?, items: [{ menu_item_id, quantity, notes? }] }
PATCH  /orders/:id/status    Body: { status: 'pending'|'confirmed'|'preparing'|'ready'|'served'|'cancelled' }
DELETE /orders/:id
```

### Tables
```
GET    /tables
```

All responses follow this shape:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Descriptive message" }
```

---

## 7 — Database Relationships

```
categories (1) ──< menu_items (N)
tables     (1) ──< orders    (N)
orders     (1) ──< order_items (N) >── menu_items (1)
```

Key design decisions:
- `order_items.unit_price` is **snapshotted** at order creation so price changes don't affect historical orders.
- `order_items.subtotal` is a **generated column** (`quantity × unit_price`) — the database always keeps it accurate.
- `orders.total_amount` is recalculated after every insert via a single `UPDATE` inside the same transaction.
- Creating an order uses a **database transaction** — either all items are saved or none are.

---

## 8 — Troubleshooting

**"Database connection error"**
- Make sure PostgreSQL is running.
- Double-check `DB_PASSWORD` in `backend/.env`.
- Confirm the database exists: `psql -U postgres -l`.

**"Route not found" / 404 from API**
- Confirm the backend is running on port 5000.
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

**Menu page shows empty state**
- Make sure you ran both `schema.sql` and `seed.sql`.
- Visit `http://localhost:5000/api/menu-items` directly to confirm the API returns data.

**Next.js image error**
- Images are served from `images.unsplash.com`. An internet connection is required to load them.
- The `next.config.js` already whitelists this hostname.

---

## 9 — Production Build

```bash
# Backend
cd backend
npm start           # runs node src/index.js directly (no nodemon)

# Frontend
cd frontend
npm run build       # creates .next/ production bundle
npm start           # serves the production build
```

For a real deployment, use a process manager like **PM2** for the backend and **Vercel** or a Node.js host for the frontend.
#   R E S T A U R A N T - D B 2  
 