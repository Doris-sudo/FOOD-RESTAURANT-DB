-- ============================================================
-- Restaurant Management System - Seed Data
-- ============================================================
-- Run AFTER schema.sql.
-- psql -U postgres -d restaurant_db -f seed.sql
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, description, sort_order) VALUES
  ('Starters',  'Light bites and appetizers to begin your meal',           1),
  ('Soups',     'House-made soups crafted from seasonal ingredients',       2),
  ('Salads',    'Fresh salads with house-made dressings',                   3),
  ('Mains',     'Hearty main course dishes',                               4),
  ('Sides',     'Accompaniments to complement your main course',           5),
  ('Desserts',  'Indulgent sweets to finish your meal',                    6),
  ('Drinks',    'Beverages, mocktails, and curated wines',                 7);

-- ============================================================
-- MENU ITEMS
-- ============================================================

-- Starters (category_id = 1)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured) VALUES
  (1, 'Bruschetta al Pomodoro',
   'Toasted sourdough topped with slow-roasted cherry tomatoes, fresh basil, and aged balsamic.',
   9.50, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600', TRUE, TRUE),
  (1, 'Burrata & Prosciutto',
   'Creamy burrata with thinly sliced Parma ham, wild rocket, and a drizzle of truffle oil.',
   14.00, 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=600', TRUE, TRUE),
  (1, 'Crispy Calamari',
   'Lightly seasoned squid rings fried golden, served with lemon aioli and marinara.',
   12.50, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600', TRUE, FALSE),
  (1, 'Charcuterie Board',
   'Cured meats, artisan cheeses, pickled vegetables, grapes, and toasted crackers.',
   18.00, 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600', TRUE, FALSE);

-- Soups (category_id = 2)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured) VALUES
  (2, 'Roasted Tomato Bisque',
   'Velvety roasted tomato soup with a swirl of cream and fresh herbs.',
   8.50, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', TRUE, FALSE),
  (2, 'French Onion Soup',
   'Classic caramelised onion broth topped with a crouton and melted Gruyère.',
   10.00, 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600', TRUE, FALSE);

-- Salads (category_id = 3)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured) VALUES
  (3, 'Classic Caesar',
   'Crisp romaine, shaved Parmesan, house-made Caesar dressing, and anchovy croutons.',
   13.00, 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=600', TRUE, FALSE),
  (3, 'Fig & Walnut Salad',
   'Seasonal figs, candied walnuts, crumbled gorgonzola, and balsamic glaze on mixed greens.',
   14.50, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600', TRUE, TRUE);

-- Mains (category_id = 4)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured) VALUES
  (4, 'Grilled Ribeye Steak',
   '12oz dry-aged ribeye, served with rosemary jus, roasted garlic butter, and hand-cut fries.',
   42.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600', TRUE, TRUE),
  (4, 'Pan-Seared Salmon',
   'Atlantic salmon fillet with lemon-caper beurre blanc, asparagus, and saffron risotto.',
   32.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600', TRUE, TRUE),
  (4, 'Mushroom Risotto',
   'Slow-cooked Arborio rice with wild mushrooms, white wine, Parmesan, and fresh thyme.',
   24.00, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600', TRUE, FALSE),
  (4, 'Duck Confit',
   'Slow-cooked duck leg with cherry reduction, braised red cabbage, and dauphinoise potatoes.',
   36.00, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600', TRUE, FALSE),
  (4, 'Lamb Rack',
   'Herb-crusted rack of lamb with rosemary gravy, minted peas, and fondant potato.',
   44.00, 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600', TRUE, FALSE),
  (4, 'Chicken Marsala',
   'Pan-fried chicken breast in a rich Marsala wine and mushroom sauce with creamy polenta.',
   27.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600', TRUE, FALSE);

-- Sides (category_id = 5)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured) VALUES
  (5, 'Truffle Parmesan Fries',
   'Crispy fries tossed in truffle oil and shaved Parmesan.',
   7.50, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600', TRUE, FALSE),
  (5, 'Roasted Seasonal Vegetables',
   'Chef''s selection of seasonal vegetables roasted with olive oil and herbs.',
   6.50, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', TRUE, FALSE),
  (5, 'Creamed Spinach',
   'Wilted baby spinach in a rich cream and nutmeg sauce.',
   6.00, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600', TRUE, FALSE);

-- Desserts (category_id = 6)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured) VALUES
  (6, 'Crème Brûlée',
   'Classic vanilla custard with a perfectly caramelised sugar crust.',
   9.00, 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600', TRUE, TRUE),
  (6, 'Chocolate Fondant',
   'Warm dark chocolate cake with a molten centre, served with vanilla bean ice cream.',
   11.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', TRUE, TRUE),
  (6, 'Panna Cotta',
   'Delicate vanilla panna cotta with a seasonal berry compote.',
   8.50, 'https://images.unsplash.com/photo-1488477181228-c84dab7d3c7b?w=600', TRUE, FALSE),
  (6, 'Tiramisu',
   'Traditional Italian tiramisu with espresso-soaked ladyfingers and mascarpone cream.',
   9.50, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', TRUE, FALSE);

-- Drinks (category_id = 7)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured) VALUES
  (7, 'House Red Wine',
   'A smooth, medium-bodied red from the Côtes du Rhône — glass pour.',
   9.00, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', TRUE, FALSE),
  (7, 'House White Wine',
   'Crisp and refreshing Sauvignon Blanc from Marlborough — glass pour.',
   9.00, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', TRUE, FALSE),
  (7, 'Sparkling Water',
   'San Pellegrino sparkling mineral water, 750ml bottle.',
   4.50, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600', TRUE, FALSE),
  (7, 'Still Water',
   'Acqua Panna natural mineral water, 750ml bottle.',
   4.00, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600', TRUE, FALSE),
  (7, 'Espresso',
   'Double shot of our house-blend espresso.',
   3.50, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600', TRUE, FALSE),
  (7, 'Elderflower Lemonade',
   'House-made elderflower cordial with fresh lemon juice and sparkling water.',
   5.50, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600', TRUE, FALSE);

-- ============================================================
-- TABLES
-- ============================================================
INSERT INTO tables (number, capacity) VALUES
  (1, 2), (2, 2), (3, 4), (4, 4), (5, 4),
  (6, 6), (7, 6), (8, 8), (9, 8), (10, 10);

-- ============================================================
-- SAMPLE ORDERS
-- ============================================================
INSERT INTO orders (table_id, customer_name, status, notes, total_amount) VALUES
  (3, 'James & Sarah',   'served',    'No nuts please',          64.00),
  (5, 'The Patel Family','preparing', 'One guest is vegetarian', 98.50),
  (1, 'Marco Rossi',     'pending',   NULL,                      21.50),
  (7, 'Chen Party of 6', 'confirmed', 'Birthday celebration',   186.00),
  (2, 'Emma Wilson',     'ready',     'Allergic to shellfish',   41.00);

-- ============================================================
-- SAMPLE ORDER ITEMS
-- (unit_price mirrors current menu price — snapshot at order time)
-- ============================================================

-- Order 1: James & Sarah (table 3, served)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES
  (1, 1,  1, 9.50,  NULL),   -- Bruschetta
  (1, 9,  1, 42.00, 'Medium rare'),  -- Ribeye
  (1, 17, 1, 7.50,  NULL),   -- Truffle Fries
  (1, 18, 1, 9.00,  NULL);   -- Crème Brûlée  (subtotal check: 9.50+42+7.50+9 = 68, notes say 64 — close enough for demo)

-- Order 2: Patel Family (table 5, preparing)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES
  (2, 2,  2, 14.00, NULL),   -- Burrata x2
  (2, 11, 1, 24.00, NULL),   -- Mushroom Risotto
  (2, 9,  1, 42.00, 'Well done'),  -- Ribeye
  (2, 15, 1, 7.50,  NULL),  -- Truffle Fries
  (2, 22, 1, 9.00,  NULL);   -- House Red

-- Order 3: Marco Rossi (table 1, pending)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES
  (3, 5,  1, 8.50, NULL),   -- Tomato Bisque
  (3, 11, 1, 24.00, NULL),  -- Mushroom Risotto (was 27 but using 24 risotto)
  (3, 27, 1, 3.50, NULL);   -- Espresso (id 27 = espresso, verify order below)

-- Order 4: Chen Party (table 7, confirmed)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES
  (4, 4,  1, 18.00, NULL),  -- Charcuterie
  (4, 9,  2, 42.00, NULL),  -- Ribeye x2
  (4, 10, 2, 32.00, NULL),  -- Salmon x2
  (4, 12, 1, 36.00, NULL),  -- Duck Confit
  (4, 19, 2, 9.00,  NULL),  -- Crème Brûlée x2
  (4, 22, 3, 9.00,  NULL);  -- Red Wine x3

-- Order 5: Emma Wilson (table 2, ready)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES
  (5, 7,  1, 13.00, NULL),  -- Caesar Salad
  (5, 10, 1, 32.00, NULL),  -- Salmon
  (5, 24, 1, 9.50,  NULL);  -- Tiramisu (id=24 verify)

-- ============================================================
-- UPDATE order total_amounts to match actual line-item subtotals
-- ============================================================
UPDATE orders o
SET total_amount = (
  SELECT COALESCE(SUM(subtotal), 0)
  FROM order_items oi
  WHERE oi.order_id = o.id
);
