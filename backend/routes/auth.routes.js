const router = require('express').Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.patch('/profile', protect, updateProfile); // frontend uses PATCH
router.put('/change-password', protect, changePassword);
router.post('/change-password', protect, changePassword); // accept both

// Logout — stateless JWT, just acknowledge
router.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Refresh token stub — not implemented (JWT is stateless)
router.post('/refresh', (_req, res) => {
  res.status(501).json({ success: false, message: 'Token refresh not implemented. Please login again.' });
});

module.exports = router;
