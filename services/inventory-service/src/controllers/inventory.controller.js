const Inventory = require('../models/Inventory');
const { publish } = require('../../shared/eventBus');
const { EVENTS } = require('../../shared/constants/events');

// Reserve stock when order is placed
exports.reserveStock = async (payload) => {
  try {
    const { sellerGroups } = payload;
    const allItems = sellerGroups.flatMap(g => g.items);

    for (const item of allItems) {
      const inv = await Inventory.findOne({ productId: item.productId });
      if (!inv) {
        console.warn(`[Inventory] No record for product ${item.productId}`);
        continue;
      }
      const available = inv.quantity - inv.reserved;
      if (available < item.quantity) {
        console.warn(`[Inventory] Insufficient stock for ${item.productId}`);
        continue;
      }
      inv.reserved  += item.quantity;
      inv.updatedAt  = new Date();
      await inv.save();
      console.log(`[Inventory] ✅ Reserved ${item.quantity} of ${item.productId}`);

      // Check low stock
      if ((inv.quantity - inv.reserved) <= inv.lowStockThreshold) {
        await publish(EVENTS.NOTIFICATION_SEND, {
          type:     'low_stock',
          sellerId: inv.sellerId,
          productId: item.productId,
          available: inv.quantity - inv.reserved,
        });
      }
    }
  } catch (err) {
    console.error('[Inventory] ❌ reserveStock failed:', err.message);
  }
};

// GET /api/inventory/:productId
exports.getStock = async (req, res) => {
  try {
    const inv = await Inventory.findOne({ productId: req.params.productId });
    if (!inv) return res.status(404).json({ error: 'Inventory record not found' });
    res.json({
      productId: inv.productId,
      quantity:  inv.quantity,
      reserved:  inv.reserved,
      available: inv.quantity - inv.reserved,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/inventory  (seller creates stock record)
exports.createStock = async (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'];
    const storeId  = req.headers['x-store-id'];
    const role     = req.headers['x-user-role'];

    if (role !== 'seller' && role !== 'admin') {
      return res.status(403).json({ error: 'Only sellers can manage inventory' });
    }

    const { productId, quantity, lowStockThreshold } = req.body;
    const existing = await Inventory.findOne({ productId });
    if (existing) {
      existing.quantity  = quantity;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json(existing);
    }

    const inv = new Inventory({ productId, storeId, sellerId, quantity, lowStockThreshold });
    await inv.save();
    res.status(201).json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};