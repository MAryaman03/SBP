const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const IS_PROD = process.env.NODE_ENV === 'production';

// ─── Protect routes (JWT required) ────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    // If already authenticated by dev middleware (mock admin), skip
    if (req.user && req.user.role) return next();

    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token)
      return res.status(401).json({ success: false, message: 'Not authorized. Token missing.' });

    // Dev-only mock token bypass (stripped in production)
    if (!IS_PROD && token.startsWith('mock_admin_token_')) {
      req.user = { _id: 'admin_123', role: 'admin', name: 'Admin', email: 'hello@sbp.com' };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user)
      return res.status(401).json({ success: false, message: 'User not found' });

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
};

// ─── Admin-only middleware ────────────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  next();
};
