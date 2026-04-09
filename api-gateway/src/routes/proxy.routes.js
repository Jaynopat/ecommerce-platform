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

  // Catch-all
  app.use('/api/*path', verifyToken, (req, res) => {
    res.status(503).json({ error: 'Service not yet available' });
  });

};