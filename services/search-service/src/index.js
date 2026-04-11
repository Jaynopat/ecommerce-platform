require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const search   = require('./controllers/search.controller');

const app = express();
app.use(express.json());

app.get('/api/search',            search.search);
app.get('/api/search/categories', search.getCategories);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'search' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (catalog-db for search)');
    app.listen(process.env.PORT || 3011, () => {
      console.log(`✅ Search Service running on port ${process.env.PORT || 3011}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });