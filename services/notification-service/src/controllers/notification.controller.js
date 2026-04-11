const { EVENTS } = require('../../shared/constants/events');

/**
 * Handles all notification events.
 * In production: use Nodemailer to send real emails.
 * For this project: logs to console (mock email).
 */

const sendEmail = (to, subject, body) => {
  // Mock email — replace with Nodemailer in production
  console.log(`[Notification] 📧 Email to: ${to}`);
  console.log(`[Notification] Subject: ${subject}`);
  console.log(`[Notification] Body: ${body}`);
};

exports.handleOrderPlaced = async (payload) => {
  const { orderId, buyerId, totalAmount } = payload;
  sendEmail(
    `buyer-${buyerId}@store.com`,
    'Order Confirmed',
    `Your order #${orderId} has been placed. Total: $${totalAmount}`
  );
};

exports.handlePaymentCaptured = async (payload) => {
  const { orderId } = payload;
  sendEmail(
    'seller@store.com',
    'Payment Received',
    `Payment captured for order #${orderId}. Start processing.`
  );
};

exports.handleShipmentDelivered = async (payload) => {
  const { orderId, buyerId } = payload;
  sendEmail(
    `buyer-${buyerId}@store.com`,
    'Order Delivered',
    `Your order #${orderId} has been delivered. Please leave a review!`
  );
};

exports.handleNotificationSend = async (payload) => {
  const { type, sellerId, productId, available } = payload;
  if (type === 'low_stock') {
    sendEmail(
      `seller-${sellerId}@store.com`,
      'Low Stock Alert',
      `Product #${productId} has only ${available} units left.`
    );
  }
};