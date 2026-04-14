const express = require('express');
const router  = express.Router();
const review  = require('../controllers/review.controller');

router.get('/pending',          review.getPendingReviews);
router.get('/:productId',       review.getReviews);
router.post('/',                review.createReview);
router.patch('/:id/approve',    review.approveReview);
router.patch('/:id/flag',       review.flagReview);

module.exports = router;