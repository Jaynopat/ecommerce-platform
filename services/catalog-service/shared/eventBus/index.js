const amqp = require('amqplib');

let channel = null;
const EXCHANGE = 'ecommerce_events';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672';

// Retry connection with delay
const connect = async (retries = 10, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      channel = await conn.createChannel();
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      console.log('✅ Event Bus connected to RabbitMQ');
      conn.on('error', () => { channel = null; });
      return;
    } catch (err) {
      console.log(`[EventBus] Waiting for RabbitMQ... attempt ${i + 1}/${retries}`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Could not connect to RabbitMQ after multiple attempts');
};

const publish = async (eventName, payload) => {
  try {
    if (!channel) await connect();
    const message = Buffer.from(JSON.stringify({
      event: eventName, payload, timestamp: new Date(),
    }));
    channel.publish(EXCHANGE, eventName, message, { persistent: true });
    console.log(`[EventBus] ✅ Published: ${eventName}`);
  } catch (err) {
    console.error(`[EventBus] ❌ Failed to publish ${eventName}:`, err.message);
  }
};

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
    console.error(`[EventBus] ❌ Failed to subscribe:`, err.message);
  }
};

module.exports = { publish, subscribe, connect };