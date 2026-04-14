require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const { connect, subscribe } = require('../shared/eventBus');
const { EVENTS } = require('../shared/constants/events');
const Product = require('./models/Product');

const app = express();
app.use(express.json());
app.use('/api/products', require('./routes/product.routes'));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'catalog' }));

async function handleReviewApproved(payload) {
  try {
    const { productId, rating } = payload;
    const product = await Product.findById(productId);
    if (!product) return;
    const newCount = (product.reviewCount || 0) + 1;
    const newAvg = (((product.avgRating || 0) * (newCount - 1)) + rating) / newCount;
    product.avgRating = Math.round(newAvg * 10) / 10;
    product.reviewCount = newCount;
    await product.save();
    console.log(`✅ Updated avgRating for product ${productId} to ${product.avgRating}`);
  } catch (err) {
    console.error('❌ handleReviewApproved error:', err.message);
  }
}

async function connectEventBus() {
  try {
    await connect();
    await subscribe(EVENTS.REVIEW_APPROVED, 'catalog-review-approved', handleReviewApproved);
    console.log('✅ Catalog Service subscribed to events');
  } catch (err) {
    console.error('⚠️ Event Bus connection failed — retrying in 10s:', err.message);
    setTimeout(connectEventBus, 10000);
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (catalog-db)');
    app.listen(process.env.PORT || 3002, () => {
      console.log(`✅ Catalog Service running on port ${process.env.PORT || 3002}`);
    });
    connectEventBus();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });