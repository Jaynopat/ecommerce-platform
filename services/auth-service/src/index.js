require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Mount routes
app.use('/api/auth', require('./routes/auth.routes'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth' }));

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(process.env.PORT || 3001, () => {
      console.log(`✅ Auth Service running on port ${process.env.PORT || 3001}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });