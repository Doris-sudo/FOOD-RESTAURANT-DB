const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        requireAuth, ctrl.getMe);
router.get('/users',     requireAuth, requireRole('admin'), ctrl.getAllUsers);
router.patch('/users/:id/role', requireAuth, requireRole('admin'), ctrl.updateUserRole);

module.exports = router;
