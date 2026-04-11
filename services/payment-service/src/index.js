require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const { subscribe, connect } = require('../shared/eventBus');
const { EVENTS } = require('../shared/constants/events');
const { holdEscrow, releaseEscrow } = require('./controllers/payment.controller');

const app = express();
app.use(express.json());

app.use('/api/payments', require('./routes/payment.routes'));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'payment' }));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB (payment-db)');

    // Subscribe to events
    await connect();
    await subscribe(EVENTS.ORDER_PLACED,       'payment-order-placed-queue',    holdEscrow);
    await subscribe(EVENTS.SHIPMENT_DELIVERED, 'payment-shipment-delivered-queue', async (payload) => {
      for (const group of payload.sellerGroups || []) {
        await releaseEscrow({ orderId: payload.orderId, storeId: group.storeId });
      }
    });

    app.listen(process.env.PORT || 3004, () => {
      console.log(`✅ Payment Service running on port ${process.env.PORT || 3004}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });