const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app, verifyToken) => {

  app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/products', verifyToken, createProxyMiddleware({
    target: process.env.CATALOG_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/orders', verifyToken, createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/payments', verifyToken, createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/inventory', verifyToken, createProxyMiddleware({
    target: process.env.INVENTORY_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/shipping', verifyToken, createProxyMiddleware({
    target: process.env.SHIPPING_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/reviews', verifyToken, createProxyMiddleware({
    target: process.env.REVIEW_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/sellers', verifyToken, createProxyMiddleware({
    target: process.env.SELLER_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/analytics', verifyToken, createProxyMiddleware({
    target: process.env.ANALYTICS_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/search', createProxyMiddleware({
    target: process.env.SEARCH_SERVICE_URL,
    changeOrigin: true,
  }));

  app.use('/api/messages', verifyToken, createProxyMiddleware({
    target: process.env.MESSAGING_SERVICE_URL || 'http://messaging-service:3012',
    changeOrigin: true,
  }));

  app.use('/api', (req, res) => {
    res.status(503).json({ error: 'Service not available' });
  });
};