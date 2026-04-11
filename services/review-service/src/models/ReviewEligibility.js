const mongoose = require('mongoose');

const eligibilitySchema = new mongoose.Schema({
  buyerId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  orderId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  eligible:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ReviewEligibility', eligibilitySchema);