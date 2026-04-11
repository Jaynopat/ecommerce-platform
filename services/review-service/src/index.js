require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const { subscribe, connect } = require('../shared/eventBus');
const { EVENTS } = require('../shared/constants/events');
const { unlockReview } = require('./controllers/review.controller');

const app = express();
app.use(express.json());

app.use('/api/reviews', require('./routes/review.routes'));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'review' }));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB (review-db)');
    await connect();
    await subscribe(EVENTS.SHIPMENT_DELIVERED, 'review-shipment-delivered-queue', unlockReview);
    app.listen(process.env.PORT || 3007, () => {
      console.log(`✅ Review Service running on port ${process.env.PORT || 3007}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });