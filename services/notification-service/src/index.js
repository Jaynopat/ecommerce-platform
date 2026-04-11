require('dotenv').config();

process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@rabbitmq:5672';

const { subscribe, connect } = require('../shared/eventBus');
const { EVENTS } = require('../shared/constants/events');
const {
  handleOrderPlaced,
  handlePaymentCaptured,
  handleShipmentDelivered,
  handleNotificationSend,
} = require('./controllers/notification.controller');

const start = async () => {
  await connect();
  await subscribe(EVENTS.ORDER_PLACED,       'notification-order-placed-queue',       handleOrderPlaced);
  await subscribe(EVENTS.PAYMENT_CAPTURED,   'notification-payment-captured-queue',   handlePaymentCaptured);
  await subscribe(EVENTS.SHIPMENT_DELIVERED, 'notification-shipment-delivered-queue', handleShipmentDelivered);
  await subscribe(EVENTS.NOTIFICATION_SEND,  'notification-send-queue',               handleNotificationSend);
  console.log('✅ Notification Service running — listening for events');
};

start().catch(err => {
  console.error('❌ Notification Service failed:', err.message);
  process.exit(1);
});