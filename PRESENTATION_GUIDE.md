# Presentation Guide — Maison Laurel Restaurant Management System

This guide explains, in plain language, how data moves through the system —
from PostgreSQL all the way to what the user sees in the browser.
It is written for beginners but is detailed enough to use in a technical presentation.

---

## The Big Picture

This system has three distinct layers that talk to each other in sequence:

```
Browser (Next.js)
     ↕  HTTP requests
Express API (Node.js)
     ↕  SQL queries
PostgreSQL Database
```

When a user clicks "View Menu", data travels through all three layers and back
in well under a second. Here is exactly what happens at each step.

---

## Layer 1 — The Database (PostgreSQL)

### What is it?

PostgreSQL is a relational database. Think of it as a collection of spreadsheets
(called **tables**) where every row is a record and every column is a field.
Unlike a real spreadsheet, the database enforces rules: you cannot delete a
category that still has menu items, prices cannot be negative, and every row
gets a unique ID automatically.

### Our five tables

**`categories`** — the menu sections
```
id | name       | description               | sort_order
1  | Starters   | Light bites...            | 1
2  | Soups      | House-made soups...       | 2
4  | Mains      | Hearty main courses       | 4
```

**`menu_items`** — every dish
```
id | category_id | name               | price  | is_available | is_featured
1  | 1           | Bruschetta         | 9.50   | true         | true
9  | 4           | Grilled Ribeye     | 42.00  | true         | true
```
Notice `category_id` — this is a **foreign key**. It links each dish back to
its category. The database ensures you cannot set `category_id` to a number
that does not exist in `categories`.

**`tables`** — the physical restaurant tables
```
id | number | capacity
1  | 1      | 2
3  | 3      | 4
```

**`orders`** — a single customer order
```
id | table_id | customer_name | status      | total_amount
1  | 3        | James & Sarah | served      | 68.00
3  | 1        | Marco Rossi   | pending     | 35.50
```

**`order_items`** — the line items inside an order
```
id | order_id | menu_item_id | quantity | unit_price | subtotal
1  | 1        | 1            | 1        | 9.50       | 9.50
2  | 1        | 9            | 1        | 42.00      | 42.00
```

**Key design decision — price snapshot:** `unit_price` is copied from the menu
at the moment the order is placed. This means if a dish's price changes
tomorrow, old orders still show the correct historic price. `subtotal` is a
**generated column** — the database calculates it automatically as
`quantity × unit_price` so it is always accurate without any extra code.

### How tables relate

```
categories ──< menu_items     (one category has many items)
tables     ──< orders         (one table has many orders over time)
orders     ──< order_items    (one order has many line items)
menu_items ──< order_items    (one item can appear in many orders)
```

This is called a **relational** database. The relationships are enforced by
foreign keys. If you try to delete a category that still has menu items,
PostgreSQL will refuse with an error — this protects data integrity.

---

## Layer 2 — The Express API (Node.js)

### What is it?

Express is a web framework for Node.js. Its job is to listen for HTTP requests
from the browser, run a SQL query against PostgreSQL, and send the result back
as JSON.

### File layout

```
backend/src/
├── index.js            Starts the server, wires everything together
├── db/pool.js          Manages the database connection
├── middleware/
│   ├── errorHandler.js Catches errors from any route and formats them
│   └── validate.js     Checks request bodies for required fields
├── routes/
│   ├── categories.js   Defines the URL paths (GET /api/categories etc.)
│   └── orders.js       Same for orders
└── controllers/
    ├── categoriesController.js  Runs the actual SQL queries
    └── ordersController.js      Same for orders
```

### How a single request flows through the backend

Let's trace `GET /api/menu-items?category_id=4`:

**Step 1 — index.js receives the request**
```js
app.use('/api/menu-items', menuItemsRouter);
```
Express sees the URL starts with `/api/menu-items` and hands it to the router.

**Step 2 — routes/menuItems.js matches the method**
```js
router.get('/', ctrl.getAllMenuItems);
```
It's a GET request with no ID, so it calls `getAllMenuItems` in the controller.

**Step 3 — controllers/menuItemsController.js runs SQL**
```js
// Query string: ?category_id=4
const { category_id } = req.query;

// Build a parameterised query (prevents SQL injection)
const result = await pool.query(
  `SELECT mi.*, c.name AS category_name
   FROM menu_items mi
   JOIN categories c ON c.id = mi.category_id
   WHERE mi.category_id = $1`,
  [4]  // $1 is replaced with the actual value safely
);
```
The `JOIN` pulls in the category name in the same query so the frontend does
not need to make a second request.

**Step 4 — The response is sent**
```js
res.json({ success: true, data: result.rows });
```
Express converts the JavaScript array of rows into JSON text and sends it back
over HTTP with a `200 OK` status code.

### Transactions — the key to safe order creation

Creating an order involves multiple steps: insert a row into `orders`, look up
prices, insert rows into `order_items`, and update the total. If the server
crashes halfway through, you would have a half-created order.

The solution is a **database transaction** — a group of SQL statements that
either all succeed or all fail together:

```js
await client.query('BEGIN');          // start transaction

// 1. Create the order
const order = await client.query('INSERT INTO orders …');

// 2. Look up current prices
const prices = await client.query('SELECT id, price FROM menu_items WHERE …');

// 3. Insert each line item
for (const item of items) {
  await client.query('INSERT INTO order_items …');
}

// 4. Update total_amount on the order
await client.query('UPDATE orders SET total_amount = … WHERE id = $1');

await client.query('COMMIT');         // save everything at once
```
If anything goes wrong between BEGIN and COMMIT, `ROLLBACK` is called and the
database is left exactly as it was — no partial data.

---

## Layer 3 — The Next.js Frontend

### What is it?

Next.js is a framework built on top of React. It renders the UI in the browser
(and optionally on the server) and communicates with the Express API using
`fetch()` calls.

### App Router and file-based routing

Every file inside `app/` that is named `page.js` automatically becomes a URL:

```
app/page.js           →  http://localhost:3000/
app/menu/page.js      →  http://localhost:3000/menu
app/orders/page.js    →  http://localhost:3000/orders
app/orders/new/page.js → http://localhost:3000/orders/new
app/orders/[id]/page.js → http://localhost:3000/orders/1, /orders/2, etc.
```

The `[id]` folder name means "match any value here". The page receives that
value through `useParams()`.

### The API helper (lib/api.js)

Instead of writing `fetch('http://localhost:5000/api/menu-items')` in every
single component, there is one central file that handles all communication:

```js
// lib/api.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL; // set in .env.local

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);   // surface API errors to the UI
  return json.data;
}

// Every page imports from here — the URL is never hardcoded elsewhere
export async function getMenuItems(filters) { ... }
export async function createOrder(body)     { ... }
```

Centralising this means changing the API URL is a one-line change in `.env.local`.

### A full page data flow — the Menu page

```
User opens /menu
  │
  ▼
app/menu/page.js (Client Component — runs in the browser)
  │
  ├── On mount: calls getMenuItems() and getCategories() in parallel
  │       │
  │       └── lib/api.js → fetch("http://localhost:5000/api/menu-items")
  │                              │
  │                              └── Express → PostgreSQL → JSON response
  │
  ├── Stores results in React state: setItems(data)
  │
  ├── User clicks "Mains" category filter
  │       │
  │       └── setSelected(4) → filtered list recalculated via useMemo()
  │               (no new API call — filtering is done in the browser)
  │
  └── React renders <MenuCard /> for each filtered item
```

### Creating an order — end-to-end

```
User builds cart on /orders/new
User clicks "Place Order · £XX.XX"
  │
  ├── handleSubmit() in new/page.js
  │       │
  │       └── createOrder({ customer_name, table_id, items }) in lib/api.js
  │               │
  │               └── POST http://localhost:5000/api/orders
  │                     Body: { customer_name, table_id, items: [...] }
  │                              │
  │                              └── ordersController.js
  │                                    ├── BEGIN transaction
  │                                    ├── INSERT INTO orders
  │                                    ├── SELECT prices from menu_items
  │                                    ├── INSERT INTO order_items (×N)
  │                                    ├── UPDATE orders total_amount
  │                                    └── COMMIT → return new order
  │
  └── router.push(`/orders/${created.id}`)
        │
        └── Browser navigates to /orders/5 showing the new order detail
```

---

## Environment Variables — Why They Matter

You will notice two `.env` files:

**`backend/.env`**
```env
DB_HOST=localhost
DB_PASSWORD=your_password
PORT=5000
```
These are secrets and server-side config. They are never sent to the browser.

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Any variable starting with `NEXT_PUBLIC_` is baked into the browser bundle.
That is how the frontend knows where to find the API — without hardcoding
`localhost:5000` everywhere.

---

## The Design System

All visual styling lives in `frontend/app/globals.css`. It defines CSS custom
properties (variables) for the colour palette:

```css
:root {
  --burgundy:   #6B2639;   /* primary brand colour */
  --cream:      #F8F3EC;   /* background */
  --terracotta: #C47758;   /* accent */
  --espresso:   #302927;   /* text */
}
```

Every component uses these variables instead of hardcoded hex codes. To
change the entire look of the app, you only need to edit these four lines.

Individual component styles are in **CSS Modules** (e.g. `MenuCard.module.css`).
Next.js scopes these automatically — `.card` in `MenuCard.module.css` and
`.card` in `OrderCard.module.css` will never conflict with each other, even
though they have the same name.

---

## Summary — The Data Journey

| Step | Technology | What happens |
|------|-----------|--------------|
| 1 | PostgreSQL | Data is stored in relational tables with enforced constraints |
| 2 | pg Pool | Node.js maintains a pool of database connections, reusing them across requests |
| 3 | Express Router | Incoming HTTP request is matched to the right controller function |
| 4 | Controller | Parameterised SQL query runs and returns rows as JavaScript objects |
| 5 | Express Response | Objects are serialised to JSON and sent with the correct HTTP status code |
| 6 | fetch() in Next.js | Browser receives JSON and the API helper checks for errors |
| 7 | React State | Data is stored in `useState` hooks, triggering a re-render |
| 8 | JSX / CSS Modules | React converts component trees into HTML; CSS Modules apply scoped styles |
| 9 | DOM | The browser paints the final result the user sees |

---

## Suggested Demo Walkthrough (10 minutes)

1. **Homepage** — Show featured dishes loaded live from PostgreSQL. Point out
   the hero image and info bar.

2. **Menu page** — Click through category filters to show client-side filtering.
   Use the search box. Toggle "Available only".

3. **Place an order** — Go to `/orders/new`. Pick a few items, set a table,
   add a note. Click "Place Order" and watch the page navigate to the new order.

4. **Order detail** — Show the line items table with snapshotted prices and the
   generated subtotals. Change the status from `pending` to `confirmed`.

5. **Orders list** — Go to `/orders`. Filter by `confirmed` status. Show the
   card for the just-created order.

6. **Admin dashboard** — Show the stat cards. Open the Menu Items tab, add a
   new dish, toggle it to featured. Then delete it. Show the Categories tab.

7. **API directly** — Open the browser and visit
   `http://localhost:5000/api/menu-items?featured=true` to show the raw JSON
   the frontend is consuming.

8. **Database** — Open psql or pgAdmin and run:
   ```sql
   SELECT o.id, o.customer_name, o.total_amount, o.status,
          COUNT(oi.id) AS items
   FROM orders o
   JOIN order_items oi ON oi.order_id = o.id
   GROUP BY o.id
   ORDER BY o.created_at DESC;
   ```
   Point out that the row you just created in the browser is right there.
