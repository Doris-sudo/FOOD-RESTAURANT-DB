/**
 * controllers/authController.js
 *
 * Handles user registration, login, logout, and profile.
 *
 * Passwords are hashed with bcrypt (salt rounds = 12).
 * JWTs expire after 7 days; the secret comes from process.env.JWT_SECRET.
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/pool');

const SALT_ROUNDS = 12;

// Guard: fail fast at startup if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  console.error('❌  JWT_SECRET is not set in backend/.env — authentication will not work.');
}

/** Sign a JWT for a user row */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/** Strip password_hash before sending user data to client */
function safeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

// ─────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
// ─────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name?.trim())     return res.status(400).json({ success: false, error: 'Name is required.' });
    if (!email?.trim())    return res.status(400).json({ success: false, error: 'Email is required.' });
    if (!password)         return res.status(400).json({ success: false, error: 'Password is required.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });

    // Email format check
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email))
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });

    // Check duplicate
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, error: 'An account with that email already exists.' });

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), email.toLowerCase().trim(), password_hash]
    );
    const user  = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required.' });

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    // Use a consistent timing to prevent user enumeration
    const validPassword = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.hash('dummy', 1); // consume similar time

    if (!user || !validPassword) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// GET /api/auth/me  (requires auth header)
// ─────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'User not found.' });

    res.json({ success: true, user: safeUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// GET /api/auth/users  (admin only)
// Returns all users with counts
// ─────────────────────────────────────────────
async function getAllUsers(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.role, u.created_at,
         COUNT(o.id)::int AS order_count
       FROM users u
       LEFT JOIN orders o ON o.customer_name = u.name  -- loose join for demo
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// PATCH /api/auth/users/:id/role  (admin only)
// Body: { role: 'customer'|'staff'|'admin' }
// ─────────────────────────────────────────────
async function updateUserRole(req, res, next) {
  try {
    const { id }   = req.params;
    const { role } = req.body;
    const valid    = ['customer', 'staff', 'admin'];
    if (!valid.includes(role))
      return res.status(400).json({ success: false, error: `Role must be one of: ${valid.join(', ')}` });

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'User not found.' });

    res.json({ success: true, user: safeUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, getAllUsers, updateUserRole };
