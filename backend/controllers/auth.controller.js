const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// ─── Generate JWT token ───────────────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// ─── @desc   Register user ────────────────────────────────────────────────────
// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, phone, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((v) => v.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @desc   Login user ───────────────────────────────────────────────────────
// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.warn(`[LOGIN FAILED] User not found for email: ${email}`);
      return res.status(401).json({ success: false, message: `No account found with email: ${email}` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`[LOGIN FAILED] Incorrect password for email: ${email}`);
      return res.status(401).json({ success: false, message: 'Password incorrect' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @desc   Get current user profile ────────────────────────────────────────
// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @desc   Update profile ───────────────────────────────────────────────────
// ─── @route  PUT /api/auth/profile ───────────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @desc   Change password ──────────────────────────────────────────────────
// ─── @route  PUT /api/auth/change-password ───────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
