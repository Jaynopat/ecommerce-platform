const Review = require('../models/Review');
const ReviewEligibility = require('../models/ReviewEligibility');
const { publish } = require('../../shared/eventBus');
const { EVENTS } = require('../../shared/constants/events');

// Called when shipment.delivered event is received
exports.unlockReview = async (payload) => {
  try {
    const { orderId, buyerId, sellerGroups } = payload;
    const allItems = sellerGroups?.flatMap(g => g.items || []) || [];
    if (allItems.length === 0) {
      await ReviewEligibility.create({ buyerId, productId: orderId, orderId, eligible: true });
      return;
    }
    for (const item of allItems) {
      await ReviewEligibility.findOneAndUpdate(
        { buyerId, productId: item.productId, orderId },
        { eligible: true },
        { upsert: true, new: true }
      );
    }
    console.log(`[Review] ✅ Review unlocked for order ${orderId}`);
  } catch (err) {
    console.error('[Review] ❌ unlockReview failed:', err.message);
  }
};

// POST /api/reviews — buyer submits review (starts as pending)
exports.createReview = async (req, res) => {
  try {
    const buyerId = req.headers['x-user-id'];
    const role    = req.headers['x-user-role'];
    if (role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can submit reviews' });
    }
    const { productId, orderId, rating, comment } = req.body;
    const eligible = await ReviewEligibility.findOne({ buyerId, orderId, eligible: true });
    if (!eligible) {
      return res.status(403).json({ error: 'You can only review products from delivered orders' });
    }
    const review = new Review({
      productId, buyerId, orderId, rating, comment,
      verified: true,
      status: 'pending'
    });
    await review.save();
    res.status(201).json({ message: 'Review submitted and pending moderation', review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You have already reviewed this product for this order' });
    }
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/reviews/:id/approve — admin approves review
exports.approveReview = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve reviews' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    review.status = 'approved';
    await review.save();
    await publish(EVENTS.REVIEW_APPROVED, {
      productId: review.productId,
      rating:    review.rating,
      reviewId:  review._id,
    });
    console.log(`[Review] ✅ Review ${review._id} approved — event published`);
    res.json({ message: 'Review approved', review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/reviews/:id/flag — admin flags review
exports.flagReview = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can flag reviews' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    review.status = 'flagged';
    await review.save();
    res.json({ message: 'Review flagged', review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/reviews/:productId — public, only approved
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: 'approved'
    }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/reviews/pending — admin only, moderation queue
exports.getPendingReviews = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view pending reviews' });
    }
    const reviews = await Review.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};