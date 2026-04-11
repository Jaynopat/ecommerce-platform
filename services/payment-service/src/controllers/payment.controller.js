const Escrow = require('../models/Escrow');
const { publish } = require('../../shared/eventBus');
const { EVENTS } = require('../../shared/constants/events');

// Called when order.placed event is received
exports.holdEscrow = async (payload) => {
  try {
    const { orderId, buyerId, totalAmount, sellerGroups } = payload;

    // Check if escrow already exists
    const existing = await Escrow.findOne({ orderId });
    if (existing) return;

    const sellerEntries = sellerGroups.map(g => ({
      storeId:  g.storeId,
      sellerId: g.sellerId,
      amount:   g.subtotal,
    }));

    const escrow = new Escrow({
      orderId,
      buyerId,
      totalAmount,
      paymentIntentId: `pi_mock_${Date.now()}`,  // mock Stripe ID
      sellerEntries,
    });

    await escrow.save();
    console.log(`[Payment] ✅ Escrow held for order ${orderId}`);

    // Notify order service that payment was captured
    await publish(EVENTS.PAYMENT_CAPTURED, {
      orderId,
      paymentIntentId: escrow.paymentIntentId,
    });

  } catch (err) {
    console.error('[Payment] ❌ holdEscrow failed:', err.message);
  }
};

// Called when shipment.delivered event is received
exports.releaseEscrow = async (payload) => {
  try {
    const { orderId, storeId } = payload;
    const escrow = await Escrow.findOne({ orderId });
    if (!escrow) return;

    const entry = escrow.sellerEntries.find(
      e => e.storeId.toString() === storeId.toString()
    );

    if (!entry || entry.released) return;

    entry.released   = true;
    entry.releasedAt = new Date();

    const allReleased = escrow.sellerEntries.every(e => e.released);
    escrow.status = allReleased ? 'fully_released' : 'partial_released';
    await escrow.save();

    console.log(`[Payment] ✅ Escrow released for store ${storeId}`);
  } catch (err) {
    console.error('[Payment] ❌ releaseEscrow failed:', err.message);
  }
};

// GET /api/payments/escrow/:orderId
exports.getEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findOne({ orderId: req.params.orderId });
    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });
    res.json(escrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};