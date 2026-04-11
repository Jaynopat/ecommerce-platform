const express = require('express');
const router  = express.Router();
const review  = require('../controllers/review.controller');

router.get('/:productId', review.getReviews);
router.post('/',          review.createReview);

module.exports = router;