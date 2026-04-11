const mongoose = require('mongoose');

const escrowEntrySchema = new mongoose.Schema({
  storeId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  sellerId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  amount:     { type: Number, required: true },
  released:   { type: Boolean, default: false },
  releasedAt: { type: Date, default: null },
});

const escrowSchema = new mongoose.Schema({
  orderId:         { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  buyerId:         { type: mongoose.Schema.Types.ObjectId, required: true },
  totalAmount:     { type: Number, required: true },
  paymentIntentId: { type: String, default: null },
  status:          {
    type: String,
    enum: ['held', 'partial_released', 'fully_released', 'refunded'],
    default: 'held'
  },
  sellerEntries:   [escrowEntrySchema],
  createdAt:       { type: Date, default: Date.now },
});

module.exports = mongoose.model('Escrow', escrowSchema);