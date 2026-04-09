const mongoose = require('mongoose');

// Each item inside a seller's group
const orderItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  productName: { type: String, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true },
  sellerId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  storeId:     { type: mongoose.Schema.Types.ObjectId, required: true },
});

// One group per seller inside the order
const sellerGroupSchema = new mongoose.Schema({
  storeId:        { type: mongoose.Schema.Types.ObjectId, required: true },
  sellerId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  items:          [orderItemSchema],
  subtotal:       { type: Number, required: true },
  status:         {
    type: String,
    enum: ['pending','paid','processing','shipped','delivered','cancelled'],
    default: 'pending'
  },
  trackingNumber: { type: String, default: null },
  payoutReleased: { type: Boolean, default: false },
});

// The main order document
const orderSchema = new mongoose.Schema({
  buyerId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  sellerGroups: [sellerGroupSchema],
  totalAmount:  { type: Number, required: true },
  status:       {
    type: String,
    enum: ['pending','paid','processing','shipped','delivered','cancelled'],
    default: 'pending'
  },
  statusHistory: [{ status: String, timestamp: Date }],
  paymentId:     { type: String, default: null },
  shippingAddress: {
    street:     String,
    city:       String,
    province:   String,
    postalCode: String,
    country:    String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Order', orderSchema);