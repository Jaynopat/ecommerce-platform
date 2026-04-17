const { createProxyMiddleware } = require('http-proxy-middleware');

function proxy(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        res.status(502).json({ error: 'Service unavailable', detail: err.message });
      }
    }
  });
}

module.exports = (app, verifyToken) => {

  app.use('/api/auth',      proxy(process.env.AUTH_SERVICE_URL));
  app.use('/api/products',  verifyToken, proxy(process.env.CATALOG_SERVICE_URL));
  app.use('/api/orders',    verifyToken, proxy(process.env.ORDER_SERVICE_URL));
  app.use('/api/payments',  verifyToken, proxy(process.env.PAYMENT_SERVICE_URL));
  app.use('/api/inventory', verifyToken, proxy(process.env.INVENTORY_SERVICE_URL));
  app.use('/api/shipping',  verifyToken, proxy(process.env.SHIPPING_SERVICE_URL));
  app.use('/api/reviews',   verifyToken, proxy(process.env.REVIEW_SERVICE_URL));
  app.use('/api/sellers',   verifyToken, proxy(process.env.SELLER_SERVICE_URL));
  app.use('/api/analytics', verifyToken, proxy(process.env.ANALYTICS_SERVICE_URL));
  app.use('/api/search',    proxy(process.env.SEARCH_SERVICE_URL));
  app.use('/api/messages',  verifyToken, proxy(process.env.MESSAGING_SERVICE_URL || 'http://messaging-service:3012'));

  app.use('/api', (req, res) => {
    res.status(503).json({ error: 'Service not available' });
  });
};