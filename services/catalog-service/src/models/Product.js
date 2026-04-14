const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true },
  images:      [{ type: String }],
  sellerId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  storeId:     { type: mongoose.Schema.Types.ObjectId, required: true },
  isActive:    { type: Boolean, default: true },
  tags:        [{ type: String }],
  stock:       { type: Number, default: 0 },
  avgRating:   { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
});
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
module.exports = mongoose.model('Product', productSchema);