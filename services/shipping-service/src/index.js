require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.use('/api/shipping', require('./routes/shipping.routes'));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'shipping' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (shipping-db)');
    app.listen(process.env.PORT || 3006, () => {
      console.log(`✅ Shipping Service running on port ${process.env.PORT || 3006}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });