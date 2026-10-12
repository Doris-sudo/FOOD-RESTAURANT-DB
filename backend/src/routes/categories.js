const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/categoriesController');
const { requireFields } = require('../middleware/validate');

router.get('/',    ctrl.getAllCategories);
router.get('/:id', ctrl.getCategoryById);
router.post('/',   requireFields(['name']), ctrl.createCategory);
router.put('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;
