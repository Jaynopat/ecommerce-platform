const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  orderId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  senderId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  senderRole: { type: String, enum: ['buyer', 'seller', 'admin'], required: true },
  content:    { type: String, required: true, maxlength: 1000 },
  createdAt:  { type: Date, default: Date.now },
});

messageSchema.index({ orderId: 1, createdAt: 1 });
module.exports = mongoose.model('Message', messageSchema);