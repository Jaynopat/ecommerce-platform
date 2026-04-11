const express = require('express');
const router  = express.Router();
const seller  = require('../controllers/seller.controller');

router.get('/stores',  seller.listStores);
router.get('/store',   seller.getMyStore);
router.post('/store',  seller.createStore);
router.put('/store',   seller.updateStore);

module.exports = router;