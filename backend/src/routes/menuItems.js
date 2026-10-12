const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/menuItemsController');
const { requireFields } = require('../middleware/validate');

router.get('/',    ctrl.getAllMenuItems);
router.get('/:id', ctrl.getMenuItemById);
router.post('/',   requireFields(['category_id', 'name', 'price']), ctrl.createMenuItem);
router.put('/:id', ctrl.updateMenuItem);
router.delete('/:id', ctrl.deleteMenuItem);

module.exports = router;
