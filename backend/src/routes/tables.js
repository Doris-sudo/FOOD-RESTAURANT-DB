const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/tablesController');

router.get('/', ctrl.getAllTables);

module.exports = router;
