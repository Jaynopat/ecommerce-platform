const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Helper: decide what scopes a role gets
const getScopesForRole = (role) => {
  const map = {
    buyer:  ['orders:read', 'orders:write', 'products:read'],
    seller: ['products:write', 'inventory:write', 'orders:read'],
    admin:  ['*'],
  };
  return map[role] || [];
};

// Helper: build and sign a JWT
const issueToken = (user) => {
  return jwt.sign(
    {
      userId:  user._id,
      role:    user.role,
      storeId: user.storeId,
      scopes:  getScopesForRole(user.role),
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const mongoose = require('mongoose');
const storeId = role === 'seller' ? new mongoose.Types.ObjectId() : null;
const user = new User({ email, passwordHash: password, role: role || 'buyer', storeId });
    await user.save();

    const token = issueToken(user);
    res.status(201).json({ token, userId: user._id, role: user.role });

  } catch (err) {
    res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = issueToken(user);
    res.json({ token, userId: user._id, role: user.role });

  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
};