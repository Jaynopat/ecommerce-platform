const Store = require('../models/Store');

// POST /api/sellers/store
exports.createStore = async (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'];
    const role     = req.headers['x-user-role'];
    if (role !== 'seller') return res.status(403).json({ error: 'Only sellers can create stores' });

    const existing = await Store.findOne({ sellerId });
    if (existing) return res.status(409).json({ error: 'Store already exists' });

    const store = new Store({ sellerId, ...req.body });
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/sellers/store
exports.getMyStore = async (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'];
    const store = await Store.findOne({ sellerId });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/sellers/store
exports.updateStore = async (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'];
    const store = await Store.findOneAndUpdate(
      { sellerId },
      { ...req.body },
      { new: true }
    );
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/sellers/stores  (public - list all stores)
exports.listStores = async (req, res) => {
  try {
    const stores = await Store.find({ isActive: true });
    res.json({ stores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};