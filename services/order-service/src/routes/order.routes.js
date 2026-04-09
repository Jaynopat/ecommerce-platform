const express = require('express');
const router  = express.Router();
const order   = require('../controllers/order.controller');

router.get('/',           order.listOrders);
router.get('/:id',        order.getOrder);
router.post('/',          order.placeOrder);
router.patch('/:id/status', order.updateStatus);

module.exports = router;