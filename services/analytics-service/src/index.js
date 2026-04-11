require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const analytics = require('./controllers/analytics.controller');

const app = express();
app.use(express.json());

app.get('/api/analytics/revenue', analytics.getRevenue);
app.get('/api/analytics/orders',  analytics.getOrderStats);
app.get('/api/analytics/daily',   analytics.getDailyStats);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'analytics' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (order-db for analytics)');
    app.listen(process.env.PORT || 3010, () => {
      console.log(`✅ Analytics Service running on port ${process.env.PORT || 3010}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });