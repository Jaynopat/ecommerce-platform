require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const { connect, subscribe } = require('../shared/eventBus');
const { EVENTS } = require('../shared/constants/events');
const Order = require('./models/Order');

const app = express();
app.use(express.json());
app.use('/api/orders', require('./routes/order.routes'));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'order' }));

async function handlePaymentCaptured(payload) {
  try {
    const order = await Order.findById(payload.orderId);
    if (!order || order.status === 'paid') return;
    order.status = 'paid';
    order.statusHistory.push({ status: 'paid', timestamp: new Date() });
    await order.save();
    console.log(`✅ Order ${payload.orderId} advanced to paid`);
  } catch (err) {
    console.error('❌ handlePaymentCaptured error:', err.message);
  }
}

async function handleShipmentCreated(payload) {
  try {
    const order = await Order.findById(payload.orderId);
    if (!order || order.status === 'shipped') return;
    order.status = 'shipped';
    order.statusHistory.push({ status: 'shipped', timestamp: new Date() });
    await order.save();
    console.log(`✅ Order ${payload.orderId} advanced to shipped`);
  } catch (err) {
    console.error('❌ handleShipmentCreated error:', err.message);
  }
}

async function handleShipmentDelivered(payload) {
  try {
    const order = await Order.findById(payload.orderId);
    if (!order || order.status === 'delivered') return;
    order.status = 'delivered';
    order.statusHistory.push({ status: 'delivered', timestamp: new Date() });
    await order.save();
    console.log(`✅ Order ${payload.orderId} advanced to delivered`);
  } catch (err) {
    console.error('❌ handleShipmentDelivered error:', err.message);
  }
}

async function connectEventBus() {
  try {
    await connect();
    await subscribe(EVENTS.PAYMENT_CAPTURED,   'order-payment-captured',   handlePaymentCaptured);
    await subscribe(EVENTS.SHIPMENT_CREATED,   'order-shipment-created',   handleShipmentCreated);
    await subscribe(EVENTS.SHIPMENT_DELIVERED, 'order-shipment-delivered', handleShipmentDelivered);
    console.log('✅ Order Service subscribed to events');
  } catch (err) {
    console.error('⚠️ Event Bus connection failed — retrying in 10s:', err.message);
    setTimeout(connectEventBus, 10000);
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (order-db)');
    app.listen(process.env.PORT || 3003, () => {
      console.log(`✅ Order Service running on port ${process.env.PORT || 3003}`);
    });
    connectEventBus();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });