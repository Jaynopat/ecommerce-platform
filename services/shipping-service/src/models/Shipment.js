const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  orderId:           { type: mongoose.Schema.Types.ObjectId, required: true },
  sellerId:          { type: mongoose.Schema.Types.ObjectId, required: true },
  storeId:           { type: mongoose.Schema.Types.ObjectId, required: true },
  buyerId:           { type: mongoose.Schema.Types.ObjectId, required: true },
  carrier:           { type: String, default: 'FedEx' },
  trackingNumber:    { type: String, default: null },
  status:            {
    type: String,
    enum: ['created', 'in_transit', 'out_for_delivery', 'delivered'],
    default: 'created'
  },
  estimatedDelivery: { type: Date, default: null },
  events:            [{
    status:    String,
    message:   String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt:         { type: Date, default: Date.now },
  updatedAt:         { type: Date, default: Date.now },
});

module.exports = mongoose.model('Shipment', shipmentSchema);