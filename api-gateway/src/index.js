require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const { verifyToken } = require('./middleware/auth.middleware');
const registerRoutes  = require('./routes/proxy.routes');

const app = express();

app.use(helmet());
app.use(cors());

// Max 100 requests per 15 minutes per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gateway' }));

// Register all proxy routes
registerRoutes(app, verifyToken);

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ API Gateway running on port ${process.env.PORT || 3000}`);
});