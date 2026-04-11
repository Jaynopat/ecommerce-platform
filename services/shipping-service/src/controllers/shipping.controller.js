const Shipment = require('../models/Shipment');
const { publish } = require('../../shared/eventBus');
const { EVENTS }  = require('../../shared/constants/events');

// POST /api/shipping  (seller creates shipment)
exports.createShipment = async (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'];
    const storeId  = req.headers['x-store-id'];
    const role     = req.headers['x-user-role'];

    if (role !== 'seller' && role !== 'admin') {
      return res.status(403).json({ error: 'Only sellers can create shipments' });
    }

    const { orderId, buyerId, carrier, estimatedDelivery } = req.body;

    const trackingNumber = `TRK${Date.now()}`;

    const shipment = new Shipment({
      orderId, sellerId, storeId, buyerId,
      carrier: carrier || 'FedEx',
      trackingNumber,
      estimatedDelivery,
      events: [{ status: 'created', message: 'Shipment created', timestamp: new Date() }],
    });

    await shipment.save();

    // Notify order service to advance to 'shipped'
    await publish(EVENTS.SHIPMENT_CREATED, {
      orderId,
      storeId,
      trackingNumber,
      carrier: shipment.carrier,
    });

    res.status(201).json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/shipping/:id/deliver  (simulate delivery webhook)
exports.markDelivered = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    shipment.status = 'delivered';
    shipment.updatedAt = new Date();
    shipment.events.push({
      status: 'delivered',
      message: 'Package delivered to buyer',
      timestamp: new Date(),
    });
    await shipment.save();

    // Trigger escrow release + review unlock
    await publish(EVENTS.SHIPMENT_DELIVERED, {
      orderId:      shipment.orderId,
      storeId:      shipment.storeId,
      sellerId:     shipment.sellerId,
      buyerId:      shipment.buyerId,
      sellerGroups: [{ storeId: shipment.storeId, sellerId: shipment.sellerId }],
    });

    res.json({ message: 'Shipment marked as delivered', shipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/shipping/:orderId
exports.getShipment = async (req, res) => {
  try {
    const shipments = await Shipment.find({ orderId: req.params.orderId });
    res.json({ shipments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};