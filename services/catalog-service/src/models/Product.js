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
  createdAt:   { type: Date, default: Date.now },
});

// Enables text search on name, description and tags
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);