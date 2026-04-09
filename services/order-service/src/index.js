require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.use('/api/orders', require('./routes/order.routes'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'order' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (order-db)');
    app.listen(process.env.PORT || 3003, () => {
      console.log(`✅ Order Service running on port ${process.env.PORT || 3003}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });