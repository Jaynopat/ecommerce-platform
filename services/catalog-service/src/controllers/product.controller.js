const Product = require('../models/Product');

// GET /api/products?search=shoes&category=electronics&page=1&limit=20
exports.listProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search)   query.$text = { $search: search };

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ products, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/products  (sellers only)
exports.createProduct = async (req, res) => {
  try {
    const role    = req.headers['x-user-role'];
    const sellerId = req.headers['x-user-id'];
    const storeId  = req.headers['x-store-id'];

    if (role !== 'seller' && role !== 'admin') {
      return res.status(403).json({ error: 'Only sellers can create products' });
    }
    if (!storeId) {
      return res.status(400).json({ error: 'Seller must have a store assigned' });
    }

    const product = new Product({ ...req.body, sellerId, storeId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/products/:id  (seller must own the product)
exports.updateProduct = async (req, res) => {
  try {
    const storeId = req.headers['x-store-id'];
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.storeId.toString() !== storeId) {
      return res.status(403).json({ error: 'You do not own this product' });
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/products/:id  (seller must own the product)
exports.deleteProduct = async (req, res) => {
  try {
    const storeId = req.headers['x-store-id'];
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.storeId.toString() !== storeId) {
      return res.status(403).json({ error: 'You do not own this product' });
    }

    product.isActive = false;  // soft delete
    await product.save();
    res.json({ message: 'Product removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};