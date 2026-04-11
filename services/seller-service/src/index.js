require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.use('/api/sellers', require('./routes/seller.routes'));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'seller' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (seller-db)');
    app.listen(process.env.PORT || 3009, () => {
      console.log(`✅ Seller Service running on port ${process.env.PORT || 3009}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });