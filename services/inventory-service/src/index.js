require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const { subscribe, connect } = require('../shared/eventBus');
const { EVENTS } = require('../shared/constants/events');
const { reserveStock } = require('./controllers/inventory.controller');

const app = express();
app.use(express.json());

app.use('/api/inventory', require('./routes/inventory.routes'));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'inventory' }));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB (inventory-db)');
    await connect();
    await subscribe(EVENTS.ORDER_PLACED, 'inventory-order-placed-queue', reserveStock);
    app.listen(process.env.PORT || 3005, () => {
      console.log(`✅ Inventory Service running on port ${process.env.PORT || 3005}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });