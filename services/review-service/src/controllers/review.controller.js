const Review = require('../models/Review');
const ReviewEligibility = require('../models/ReviewEligibility');

// Called when shipment.delivered event is received
// Unlocks review eligibility for buyer
exports.unlockReview = async (payload) => {
  try {
    const { orderId, buyerId, sellerGroups } = payload;
    const allItems = sellerGroups?.flatMap(g => g.items || []) || [];

    if (allItems.length === 0) {
      // If no items in payload, just mark orderId as eligible
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

// POST /api/reviews  (buyer submits review)
exports.createReview = async (req, res) => {
  try {
    const buyerId   = req.headers['x-user-id'];
    const role      = req.headers['x-user-role'];

    if (role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can submit reviews' });
    }

    const { productId, orderId, rating, comment } = req.body;

    // Check eligibility — must have a delivered order
    const eligible = await ReviewEligibility.findOne({ buyerId, orderId, eligible: true });
    if (!eligible) {
      return res.status(403).json({ error: 'You can only review products from delivered orders' });
    }

    const review = new Review({
      productId, buyerId, orderId, rating, comment, verified: true, status: 'approved'
    });
    await review.save();

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You have already reviewed this product for this order' });
    }
    res.status(500).json({ error: err.message });
  }
};

// GET /api/reviews/:productId
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