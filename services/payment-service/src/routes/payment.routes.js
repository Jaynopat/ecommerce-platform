const express = require('express');
const router  = express.Router();
const payment = require('../controllers/payment.controller');

router.get('/escrow/:orderId', payment.getEscrow);

module.exports = router;