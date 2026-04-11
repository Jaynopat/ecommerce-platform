const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, required: true },
  buyerId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  orderId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: '' },
  status:     { type: String, enum: ['pending', 'approved', 'flagged'], default: 'pending' },
  verified:   { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
});

// One review per buyer per product per order
reviewSchema.index({ productId: 1, buyerId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);