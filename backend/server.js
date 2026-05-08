require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

// ─── Environment Validation ──────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  JWT_SECRET is too short. Use at least 32 characters for production.');
}

const IS_PROD = process.env.NODE_ENV === 'production';

// Fix ISP blocking MongoDB DNS SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ─── Security Middleware (load safely — skip if not installed yet) ────────────
let helmet, compression, mongoSanitize, xssClean, hpp, rateLimit;
try { helmet = require('helmet'); } catch (e) { helmet = null; }
try { compression = require('compression'); } catch (e) { compression = null; }
try { mongoSanitize = require('express-mongo-sanitize'); } catch (e) { mongoSanitize = null; }
try { xssClean = require('xss-clean'); } catch (e) { xssClean = null; }
try { hpp = require('hpp'); } catch (e) { hpp = null; }
try { rateLimit = require('express-rate-limit'); } catch (e) { rateLimit = null; }

// Route imports
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const galleryRoutes = require('./routes/gallery.routes');

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
if (helmet) app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
if (compression) app.use(compression());
if (mongoSanitize) app.use(mongoSanitize());
if (xssClean) app.use(xssClean());
if (hpp) app.use(hpp());

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = IS_PROD
  ? [process.env.CLIENT_URL].filter(Boolean)
  : [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
if (rateLimit && IS_PROD) {
  // Global: 200 requests per 15 min per IP
  app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

  // Auth: 10 attempts per 15 min
  app.use('/api/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000, max: 10,
    message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
  }));
  app.use('/api/auth/register', rateLimit({
    windowMs: 60 * 60 * 1000, max: 5,
    message: { success: false, message: 'Too many registration attempts. Try again later.' }
  }));

  // Reviews: 3 per 15 min
  app.use('/api/reviews', rateLimit({
    windowMs: 15 * 60 * 1000, max: 3, skipSuccessfulRequests: false,
    message: { success: false, message: 'Review rate limit reached. Please try again later.' }
  }));
}

// ─── Mock Admin Auth Bypass (DEVELOPMENT ONLY) ──────────────────────────────
if (!IS_PROD) {
  app.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer mock_admin_token_')) {
      req.user = { _id: 'admin_123', role: 'admin', name: 'Admin', email: 'hello@sbp.com' };
    }
    next();
  });
  console.log('⚠️  DEV MODE: Mock admin auth bypass is ACTIVE');
}

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`🐌 SLOW: ${req.method} ${req.originalUrl} — ${duration}ms`);
    }
  });
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);

// ─── Real Dashboard Endpoint ─────────────────────────────────────────────────
const { protect } = require('./middleware/auth.middleware');
const Appointment = require('./models/Appointment.model');
const Notification = require('./models/Notification.model');

app.get('/api/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalBookings, confirmedBookings, completedBookings, unreadCount] = await Promise.all([
      Appointment.countDocuments({ userId }),
      Appointment.countDocuments({ userId, status: 'confirmed' }),
      Appointment.countDocuments({ userId, status: 'completed' }),
      Notification.countDocuments({ userId, read: false }).catch(() => 0),
    ]);

    const upcomingBookings = await Appointment.find({
      userId,
      status: { $in: ['pending', 'confirmed'] },
      bookingDate: { $gte: new Date() },
    }).populate('service', 'name category price duration image').sort({ bookingDate: 1 }).limit(10);

    const bookingHistory = await Appointment.find({
      userId,
      $or: [{ status: { $in: ['completed', 'cancelled'] } }, { bookingDate: { $lt: new Date() } }],
    }).populate('service', 'name category price duration image').sort({ bookingDate: -1 }).limit(20);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }).limit(20).catch(() => []);

    res.json({
      success: true,
      data: {
        statistics: { totalBookings, confirmedBookings, completedBookings },
        upcomingBookings,
        bookingHistory,
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({
  status: 'OK',
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[ERROR] ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: IS_PROD ? 'Internal Server Error' : err.message,
    ...(IS_PROD ? {} : { stack: err.stack }),
  });
});

// ─── MongoDB Connection & Admin Seeding ────────────────────────────────────────
const User = require('./models/User.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    
    // Auto-seed admin user — delete and recreate to guarantee password integrity
    try {
      const bcrypt = require('bcryptjs');
      const adminEmail = 'admin@sbp.com';
      const plainPassword = 'admin!@#$%';

      // Delete any existing admin with this email to prevent double-hashing issues
      await User.deleteOne({ email: adminEmail });

      // Create fresh admin — the pre-save hook will hash the password exactly once
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: plainPassword,
        role: 'admin',
        isVerified: true,
      });

      // Verify login will work silently
      const testAdmin = await User.findOne({ email: adminEmail }).select('+password');
      if (testAdmin) {
        const isMatch = await bcrypt.compare(plainPassword, testAdmin.password);
        console.log(isMatch
          ? '✅ Admin account ready'
          : '❌ Admin account error — password mismatch'
        );
      }

    } catch (seedErr) {
      console.error('⚠️ Admin seeder error:', seedErr.message);
    }

  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

app.use(cors({
  origin: [
    "https://YOUR-VERCEL-APP.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
