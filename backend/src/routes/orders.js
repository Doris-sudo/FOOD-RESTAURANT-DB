const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/ordersController');

// Stats must come before /:id so Express doesn't treat 'stats' as an id
router.get('/stats', ctrl.getOrderStats);

router.get('/',    ctrl.getAllOrders);
router.get('/:id', ctrl.getOrderById);
router.post('/',   ctrl.createOrder);
router.patch('/:id/status', ctrl.updateOrderStatus);
router.delete('/:id', ctrl.deleteOrder);

module.exports = router;
