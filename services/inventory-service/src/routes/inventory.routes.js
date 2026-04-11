const express   = require('express');
const router    = express.Router();
const inventory = require('../controllers/inventory.controller');

router.get('/:productId', inventory.getStock);
router.post('/',          inventory.createStock);

module.exports = router;