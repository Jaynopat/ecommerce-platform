const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app, verifyToken) => {

  // Public — no JWT needed
  app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/auth/' },
  }));

  // Catalog — JWT required
  app.use('/api/products', verifyToken, createProxyMiddleware({
    target: process.env.CATALOG_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/products/' },
  }));

  // Orders — JWT required
  app.use('/api/orders', verifyToken, createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/orders/' },
  }));

  // Payments — JWT required
  app.use('/api/payments', verifyToken, createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/payments/' },
  }));

  // Inventory — JWT required
  app.use('/api/inventory', verifyToken, createProxyMiddleware({
    target: process.env.INVENTORY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/inventory/' },
  }));

  // Shipping — JWT required
  app.use('/api/shipping', verifyToken, createProxyMiddleware({
    target: process.env.SHIPPING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/shipping/' },
  }));

// Reviews — JWT required
  app.use('/api/reviews', verifyToken, createProxyMiddleware({
    target: process.env.REVIEW_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/reviews/' },
  }));

// Sellers — JWT required
  app.use('/api/sellers', verifyToken, createProxyMiddleware({
    target: process.env.SELLER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/sellers/' },
  }));

  // Analytics — JWT required
  app.use('/api/analytics', verifyToken, createProxyMiddleware({
    target: process.env.ANALYTICS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/analytics/' },
  }));

  // Search — public
  app.use('/api/search', createProxyMiddleware({
    target: process.env.SEARCH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/search/' },
  }));

  // Catch-all
  app.use('/api/*path', verifyToken, (req, res) => {
    res.status(503).json({ error: 'Service not yet available' });
  });

};