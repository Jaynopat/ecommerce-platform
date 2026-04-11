const mongoose = require('mongoose');

// GET /api/analytics/revenue
exports.getRevenue = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').aggregate([
      { $match: { status: 'delivered' } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders:  { $sum: 1 },
        avgOrderValue: { $avg: '$totalAmount' }
      }}
    ]).toArray();

    res.json({ revenue: orders[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/orders
exports.getOrderStats = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.collection('orders').aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$totalAmount' }
      }},
      { $sort: { count: -1 } }
    ]).toArray();

    res.json({ orderStats: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/daily
exports.getDailyStats = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const daily = await db.collection('orders').aggregate([
      { $group: {
        _id: {
          year:  { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day:   { $dayOfMonth: '$createdAt' }
        },
        orders:  { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]).toArray();

    res.json({ daily });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};