const express  = require('express');
const router   = express.Router();
const shipping = require('../controllers/shipping.controller');

router.get('/:orderId',       shipping.getShipment);
router.post('/',              shipping.createShipment);
router.patch('/:id/deliver',  shipping.markDelivered);

module.exports = router;