const amqp = require('amqplib');

/**
 * All services use this same file to publish and subscribe to events.
 * Services never talk to each other directly — only through this bus.
 */

let channel = null;
const EXCHANGE = 'ecommerce_events';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672';

// Connect to RabbitMQ and create a channel
const connect = async () => {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log('✅ Event Bus connected to RabbitMQ');

    // Handle connection errors
    conn.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err.message);
      channel = null;
    });

  } catch (err) {
    console.error('❌ Failed to connect to RabbitMQ:', err.message);
    throw err;
  }
};

// Publish an event to the bus
const publish = async (eventName, payload) => {
  try {
    if (!channel) await connect();
    const message = Buffer.from(JSON.stringify({
      event:     eventName,
      payload,
      timestamp: new Date(),
    }));
    channel.publish(EXCHANGE, eventName, message, { persistent: true });
    console.log(`[EventBus] ✅ Published: ${eventName}`);
  } catch (err) {
    console.error(`[EventBus] ❌ Failed to publish ${eventName}:`, err.message);
  }
};

// Subscribe to an event from the bus
const subscribe = async (eventPattern, queueName, handler) => {
  try {
    if (!channel) await connect();
    const q = await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(q.queue, EXCHANGE, eventPattern);
    channel.consume(q.queue, async (msg) => {
      if (!msg) return;
      try {
        const { event, payload } = JSON.parse(msg.content.toString());
        console.log(`[EventBus] 📩 Received: ${event}`);
        await handler(payload);
        channel.ack(msg);
      } catch (err) {
        console.error(`[EventBus] ❌ Handler error:`, err.message);
        channel.nack(msg, false, false);
      }
    });
    console.log(`[EventBus] 👂 Subscribed to: ${eventPattern}`);
  } catch (err) {
    console.error(`[EventBus] ❌ Failed to subscribe to ${eventPattern}:`, err.message);
  }
};

module.exports = { publish, subscribe, connect };