const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  sellerId:    { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  storeName:   { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  email:       { type: String, required: true },
  phone:       { type: String, default: '' },
  address:     { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Store', storeSchema);