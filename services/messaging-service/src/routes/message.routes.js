const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/message.controller');

router.get('/:orderId', getMessages);

module.exports = router;