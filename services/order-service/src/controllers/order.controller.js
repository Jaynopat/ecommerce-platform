const Order = require('../models/Order');
const { transition } = require('../stateMachine/orderFSM');
const { publish } = require('../../shared/eventBus');
const { EVENTS } = require('../../shared/constants/events');

// POST /api/orders  (buyers only)
exports.placeOrder = async (req, res) => {
  try {
    const buyerId = req.headers['x-user-id'];
    const role    = req.headers['x-user-role'];

    if (role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can place orders' });
    }

    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Group items by storeId (multi-seller split)
    const groupMap = {};
    items.forEach(item => {
      const key = item.storeId.toString();
      if (!groupMap[key]) {
        groupMap[key] = {
          storeId:  item.storeId,
          sellerId: item.sellerId,
          items:    [],
          subtotal: 0,
        };
      }
      groupMap[key].items.push(item);
      groupMap[key].subtotal += item.quantity * item.unitPrice;
    });

    const sellerGroups = Object.values(groupMap);
    const totalAmount  = sellerGroups.reduce((sum, g) => sum + g.subtotal, 0);

    const order = new Order({
      buyerId,
      sellerGroups,
      totalAmount,
      shippingAddress,
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    });

    await order.save();

    // Publish event — other services will react to this
    await publish(EVENTS.ORDER_PLACED, {
      orderId:      order._id,
      buyerId,
      totalAmount,
      sellerGroups,
    });

    res.status(201).json({
      orderId:      order._id,
      status:       order.status,
      totalAmount:  order.totalAmount,
      sellerGroups: order.sellerGroups.length,
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to place order', detail: err.message });
  }
};

// PATCH /api/orders/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { id }        = req.params;
    const { newStatus } = req.body;
    const role          = req.headers['x-user-role'];

    if (role !== 'admin' && role !== 'seller') {
      return res.status(403).json({ error: 'Not authorized to update order status' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    transition(order, newStatus);
    await order.save();

    res.json({ orderId: order._id, status: order.status });

  } catch (err) {
    const code = err.message.startsWith('Invalid transition') ? 400 : 500;
    res.status(code).json({ error: err.message });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order   = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const userId  = req.headers['x-user-id'];
    const role    = req.headers['x-user-role'];
    const storeId = req.headers['x-store-id'];

    if (role === 'buyer' && order.buyerId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (role === 'seller') {
      const hasStore = order.sellerGroups.some(g => g.storeId.toString() === storeId);
      if (!hasStore) return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', detail: err.message });
  }
};

// GET /api/orders
exports.listOrders = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const role   = req.headers['x-user-role'];

    let query = {};
    if (role === 'buyer')  query = { buyerId: userId };
    if (role === 'seller') query = { 'sellerGroups.sellerId': userId };

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ orders });

  } catch (err) {
    res.status(500).json({ error: 'Failed to list orders', detail: err.message });
  }
};