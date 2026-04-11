const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId:         { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  storeId:           { type: mongoose.Schema.Types.ObjectId, required: true },
  sellerId:          { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity:          { type: Number, required: true, min: 0, default: 0 },
  reserved:          { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  updatedAt:         { type: Date, default: Date.now },
});

// Virtual: available = quantity - reserved
inventorySchema.virtual('available').get(function () {
  return this.quantity - this.reserved;
});

module.exports = mongoose.model('Inventory', inventorySchema);