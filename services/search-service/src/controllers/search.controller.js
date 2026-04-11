const mongoose = require('mongoose');

// GET /api/search?q=headphones&category=Electronics&minPrice=50&maxPrice=200
exports.search = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const db = mongoose.connection.db;

    const query = { isActive: true };

    if (q) query.$text = { $search: q };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await db.collection('products')
      .find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .toArray();

    const total = await db.collection('products').countDocuments(query);

    res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/search/categories
exports.getCategories = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const categories = await db.collection('products').distinct('category', { isActive: true });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};