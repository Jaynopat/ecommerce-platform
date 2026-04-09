require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.use('/api/products', require('./routes/product.routes'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'catalog' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (catalog-db)');
    app.listen(process.env.PORT || 3002, () => {
      console.log(`✅ Catalog Service running on port ${process.env.PORT || 3002}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });