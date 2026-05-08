# 🔍 Production-Readiness Audit — Snigdha Beauty Parlour

**Date:** 2026-05-07  
**Auditor:** Senior Production Engineering Review  
**Stack:** React 19 + Vite 8 / Express 4 + MongoDB (Mongoose) / Nodemailer / Brevo / Cloudinary

---

## 🚨 CRITICAL SECURITY VULNERABILITIES

### 1. Mock Admin Auth Bypass in Production Code

> **Severity: 🔴 CRITICAL**

**Problem:** [server.js:30-38](file:///e:/SBP/backend/server.js#L30-L38) contains a global middleware that grants admin access to **anyone** who sends `Authorization: Bearer mock_admin_token_ANYTHING`. This is duplicated in [auth.middleware.js:18-21](file:///e:/SBP/backend/middleware/auth.middleware.js#L18-L21).

**Why it matters:** Any attacker can send `curl -H "Authorization: Bearer mock_admin_token_x" http://yoursite.com/api/admin/users` and get full admin access to all user data, bookings, and reviews. This is a **complete authentication bypass**.

**Fix:** Gate behind `NODE_ENV`:
```diff
- app.use((req, res, next) => {
-   const auth = req.headers.authorization;
-   if (auth && auth.startsWith('Bearer mock_admin_token_')) {
-     req.user = { _id: 'admin_123', role: 'admin', name: 'Admin', email: 'hello@sbp.com' };
-   }
-   next();
- });
+ if (process.env.NODE_ENV === 'development') {
+   app.use((req, res, next) => {
+     const auth = req.headers.authorization;
+     if (auth && auth.startsWith('Bearer mock_admin_token_')) {
+       req.user = { _id: 'admin_123', role: 'admin', name: 'Admin', email: 'hello@sbp.com' };
+     }
+     next();
+   });
+ }
```
Do the same in `auth.middleware.js`.

---

### 2. Frontend Mock Admin Login Bypass

> **Severity: 🔴 CRITICAL**

**Problem:** [AuthContext.tsx:132-151](file:///e:/SBP/frontend/src/context/AuthContext.tsx#L132-L151) — Anyone typing `hello@sbp.com` or `admin@snigdhabeautyparlour.com` as email gets instant admin access with no password verification.

**Fix:** Remove this entirely for production. Create a real admin user in the database with a strong password:
```bash
# In mongo shell or via a seed script:
db.users.insertOne({ 
  name: "Admin", 
  email: "purnimamohanty662@gmail.com", 
  password: "<bcrypt-hashed-password>", 
  role: "admin" 
})
```

---

### 3. JWT Secret is a Public URL

> **Severity: 🔴 CRITICAL**

**Problem:** [.env:4](file:///e:/SBP/backend/.env#L4) — `JWT_SECRET=https://dev-5unzfuylm7hvxnhk.ca.auth0.com/api/v2/` is a publicly known Auth0 URL, not a secret. Anyone can forge JWT tokens.

**Fix:** Generate a cryptographically secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
```env
JWT_SECRET=<paste-64-byte-hex-here>
```

---

### 4. MongoDB Credentials Exposed in `.env`

> **Severity: 🔴 CRITICAL**

**Problem:** The `.env` file contains `MONGO_URI=mongodb+srv://aryaan375_db_user:SBP986@sbp.yglgf3w.mongodb.net/` with a weak password. If this repo is ever pushed to GitHub, the database is compromised.

**Fix:**
- Add `.env` to `.gitignore` (verify it's there)
- Change the MongoDB password immediately
- Use MongoDB Atlas IP whitelisting
- Use a longer password: 20+ random characters

---

### 5. Track Booking API Exposes User PII Without Auth

> **Severity: 🟠 HIGH**

**Problem:** [appointment.routes.js:9](file:///e:/SBP/backend/routes/appointment.routes.js#L9) — `GET /api/appointments/track/:bookingRef` is **public** and returns user name, email, and phone via `.populate('userId', 'name email phone')`.

**Fix:** Either require authentication, or strip PII from the response:
```js
const appointment = await Appointment.findOne({ bookingReference: req.params.bookingRef })
  .populate('service', 'name category price duration')
  // Don't populate userId for public access
  .select('-userId');
```

---

### 6. Review Submission Has No Auth & No Rate Limiting

> **Severity: 🟠 HIGH**

**Problem:** [review.routes.js:6](file:///e:/SBP/backend/routes/review.routes.js#L6) — `POST /api/reviews` has no authentication. Anyone can spam fake reviews with arbitrary ratings, flooding your review queue and potentially DoS-ing the admin panel.

**Fix:** Add rate limiting and optional auth:
```js
const rateLimit = require('express-rate-limit');
const reviewLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3 });
router.post('/', reviewLimiter, createReview);
```

---

### 7. No Rate Limiting on Auth Endpoints

> **Severity: 🟠 HIGH**

**Problem:** Login and registration have zero rate limiting. Attackers can brute-force passwords.

**Fix:**
```bash
npm install express-rate-limit
```
```js
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' }
});
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
```

---

### 8. No Input Sanitization (XSS Risk)

> **Severity: 🟠 HIGH**

**Problem:** User-submitted `notes`, `comment`, `guestName` etc. are stored and rendered without sanitization. HTML/script injection is possible.

**Fix:**
```bash
npm install express-mongo-sanitize xss-clean helmet
```
```js
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const helmet = require('helmet');

app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean());
```

---

## ⚙️ BACKEND ARCHITECTURE ISSUES

### 9. Dead TypeScript `src/` Directory

> **Severity: 🟡 MEDIUM**

**Problem:** `backend/src/` contains TypeScript files (`booking.ts`, `admin.ts`) that are **never loaded** by the running `server.js`. This causes confusion — edits to `src/` have no effect.

**Fix:** Delete `backend/src/` entirely, or migrate fully to TypeScript. Currently it's dead code that creates confusion.

---

### 10. `/api/dashboard` Returns Hardcoded Mock Data

> **Severity: 🟡 MEDIUM**

**Problem:** [server.js:50-62](file:///e:/SBP/backend/server.js#L50-L62) — The user dashboard endpoint returns hardcoded `{ totalBookings: 1 }`. The frontend falls back to this when real data fetch fails.

**Fix:** Replace with a proper controller that queries real data:
```js
app.get('/api/dashboard', protect, async (req, res) => {
  const [total, confirmed, completed, unread] = await Promise.all([
    Appointment.countDocuments({ userId: req.user._id }),
    Appointment.countDocuments({ userId: req.user._id, status: 'confirmed' }),
    Appointment.countDocuments({ userId: req.user._id, status: 'completed' }),
    Notification.countDocuments({ userId: req.user._id, read: false }),
  ]);
  const upcoming = await Appointment.find({ userId: req.user._id, status: { $nin: ['cancelled', 'completed'] } })
    .populate('service').sort({ bookingDate: 1 }).limit(10);
  res.json({ success: true, data: { statistics: { totalBookings: total, confirmedBookings: confirmed, completedBookings: completed }, upcomingBookings: upcoming, unreadCount: unread }});
});
```

---

### 11. No CORS Origin Restriction for Production

> **Severity: 🟡 MEDIUM**

**Problem:** CORS allows `localhost:5173` always. In production, this should be restricted to your actual domain.

**Fix:**
```js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL] 
    : [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
```

---

### 12. Booking Slot Query Has Date Parsing Bug

> **Severity: 🟡 MEDIUM**

**Problem:** [appointment.controller.js:207](file:///e:/SBP/backend/controllers/appointment.controller.js#L207) — `new Date(date)` without timezone handling. A "2026-05-08" query might match different dates depending on server timezone vs. the `noon` date stored during creation.

**Fix:** Use the same noon-parsing logic consistently:
```js
const [y, m, d] = date.split('-').map(Number);
const queryDate = new Date(y, m - 1, d, 12, 0, 0);
```

---

### 13. No Request Validation Library

> **Severity: 🟡 MEDIUM**

**Problem:** All input validation is manual `if (!field)` checks. Easy to miss edge cases.

**Fix:** Install `express-validator` or `joi`:
```bash
npm install express-validator
```

---

### 14. Duplicate Booking Reference Collision Risk

> **Severity: 🟡 MEDIUM**

**Problem:** [generateBookingRef.js](file:///e:/SBP/backend/utils/generateBookingRef.js) uses 4 timestamp digits + 3 random chars = ~46,000 combinations per second. Under load, collisions are likely, relying on the retry loop.

**Fix:** Use `crypto.randomBytes` for better entropy:
```js
const crypto = require('crypto');
function generateUniqueBookingRef() {
  const year = new Date().getFullYear();
  const id = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `SBP-${year}-${id}`;
}
```

---

## 🎨 FRONTEND ISSUES

### 15. No Code Splitting / Lazy Loading

> **Severity: 🟡 MEDIUM**

**Problem:** [App.tsx](file:///e:/SBP/frontend/src/App.tsx) eagerly imports ALL pages. The entire admin dashboard, booking page, etc. are loaded even for homepage visitors.

**Fix:**
```tsx
import { lazy, Suspense } from 'react';
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Booking = lazy(() => import('./pages/Booking'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));

// Wrap routes:
<Suspense fallback={<div className="loading-spinner" />}>
  <AdminDashboard />
</Suspense>
```

---

### 16. Duplicate Route Definition

> **Severity: 🟢 LOW**

**Problem:** [App.tsx:38](file:///e:/SBP/frontend/src/App.tsx#L38) and [App.tsx:83](file:///e:/SBP/frontend/src/App.tsx#L83) both define `<Route path="/track" ...>`. The second one will never match.

**Fix:** Remove line 83.

---

### 17. `CinematicLuxuryIntro forceShow={true}` on Every Visit

> **Severity: 🟡 MEDIUM**

**Problem:** [App.tsx:114](file:///e:/SBP/frontend/src/App.tsx#L114) — The cinematic intro plays on **every page load**. Returning users are forced to wait every time.

**Fix:** Use `sessionStorage` to show only once per session:
```tsx
<CinematicLuxuryIntro forceShow={!sessionStorage.getItem('introSeen')} />
```

---

### 18. Token Stored in localStorage (XSS Risk)

> **Severity: 🟡 MEDIUM**

**Problem:** JWT stored in `localStorage` is accessible to any XSS attack. Combined with the lack of input sanitization (issue #8), this is exploitable.

**Fix (long-term):** Use `httpOnly` cookies for token storage. Short-term: ensure XSS sanitization is bulletproof.

---

### 19. No Error Boundary

> **Severity: 🟡 MEDIUM**

**Problem:** If any component throws a runtime error, the entire app crashes to a white screen.

**Fix:** Add a React Error Boundary:
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div>Something went wrong. <a href="/">Go home</a></div>;
    return this.props.children;
  }
}
```

---

### 20. Missing SEO Meta Tags

> **Severity: 🟡 MEDIUM**

**Problem:** No `<title>`, `<meta description>`, or Open Graph tags on any page. Google will index the page poorly.

**Fix:** Install `react-helmet-async`:
```bash
npm install react-helmet-async
```
```tsx
<Helmet>
  <title>Snigdha Beauty Parlour — Premium Beauty Experience in Puri</title>
  <meta name="description" content="Book luxury beauty services at Snigdha Beauty Parlour, Puri. Hair styling, skincare, bridal packages & more." />
</Helmet>
```

---

## 🗄️ DATABASE ISSUES

### 21. No Database Indexes on Frequently Queried Fields

> **Severity: 🟡 MEDIUM**

**Problem:** Missing indexes on `Review.isApproved`, `Appointment.status`, `User.email` (has unique, but explicit index improves query planning).

**Fix:** Add to models:
```js
reviewSchema.index({ isApproved: 1, createdAt: -1 });
reviewSchema.index({ service: 1, isApproved: 1 });
appointmentSchema.index({ status: 1 });
```

---

### 22. No Pagination on Admin Endpoints

> **Severity: 🟡 MEDIUM**

**Problem:** `getAllUsers` and `getAllReviews` return **all records** with no pagination. At 10,000+ users, this will crash or timeout.

**Fix:** Add pagination like `getAllAppointments` already has.

---

## 📦 DEPLOYMENT & DEVOPS

### 23. No Production Build Configuration

> **Severity: 🟡 MEDIUM**

**Problem:** No `Dockerfile`, no deployment scripts, no production environment config. Backend `build` script is `echo 'No build required'`.

**Deployment Checklist:**
- [ ] Set `NODE_ENV=production` in production
- [ ] Remove mock auth bypass
- [ ] Set real JWT secret
- [ ] Configure real email credentials
- [ ] Set up proper CORS origins
- [ ] Add compression middleware
- [ ] Serve frontend via CDN/Vercel
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set up health check monitoring

---

### 24. No Compression Middleware

> **Severity: 🟢 LOW**

```bash
npm install compression
```
```js
const compression = require('compression');
app.use(compression());
```

---

### 25. No Logging Infrastructure

> **Severity: 🟡 MEDIUM**

**Problem:** Only `console.log`/`console.error`. No structured logging, no request logging.

**Fix:**
```bash
npm install morgan winston
```

---

## 📊 PRODUCTION READINESS SCORES

| Category | Score | Status |
|----------|-------|--------|
| **Overall** | **3.5/10** | 🔴 Not Ready |
| **Security** | **2/10** | 🔴 Critical Issues |
| **Backend** | **4/10** | 🟠 Needs Work |
| **Frontend** | **5/10** | 🟡 Fair |
| **Database** | **5/10** | 🟡 Fair |
| **Scalability** | **3/10** | 🔴 Limited |
| **Performance** | **5/10** | 🟡 Fair |
| **UI/UX** | **7/10** | 🟢 Good |
| **DevOps** | **2/10** | 🔴 Missing |

---

## 🔥 TOP 10 CRITICAL FIXES BEFORE LAUNCH

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Remove/gate mock admin bypass | 10 min | Prevents total auth bypass |
| 2 | Generate real JWT secret | 2 min | Prevents token forgery |
| 3 | Change MongoDB password | 5 min | Prevents database theft |
| 4 | Add rate limiting to auth + reviews | 15 min | Prevents brute force/spam |
| 5 | Add helmet + XSS protection | 10 min | Prevents injection attacks |
| 6 | Strip PII from public track endpoint | 10 min | Prevents data leak |
| 7 | Fix `/api/dashboard` to return real data | 30 min | Makes user dashboard functional |
| 8 | Add lazy loading to frontend | 20 min | Cuts initial bundle 60% |
| 9 | Add Error Boundary | 10 min | Prevents white-screen crashes |
| 10 | Fix intro `forceShow` to session-only | 5 min | Stops annoying returning users |

---

## ⚡ QUICK WINS (< 15 min each)

1. `npm install helmet compression express-rate-limit express-mongo-sanitize` → add 4 lines to server.js
2. Remove duplicate `/track` route in App.tsx
3. Change `forceShow={true}` to session-based
4. Add `<title>` tags via react-helmet-async
5. Add `compression()` middleware (30-50% smaller responses)

---

## 🏗️ LONG-TERM ARCHITECTURE IMPROVEMENTS

1. **Migrate to httpOnly cookie auth** — eliminates localStorage XSS vector
2. **Add Redis caching** — cache service list, available slots (refreshed hourly)
3. **WebSocket for real-time** — admin gets live booking notifications
4. **Add CI/CD pipeline** — GitHub Actions: lint → test → build → deploy
5. **Separate admin frontend** — reduces main bundle, better code organization
6. **Payment integration** — Razorpay/Stripe for actual payment collection
7. **Proper admin user management** — database-backed roles, not hardcoded emails
8. **Automated backups** — MongoDB Atlas scheduled backups
9. **APM monitoring** — Sentry for error tracking, Uptime Robot for health
10. **CDN for static assets** — Cloudinary/Cloudflare for images

---

## 🚀 DEPLOYMENT CHECKLIST

```
PRE-DEPLOY:
□ Remove ALL mock auth bypass code (server.js + auth.middleware.js + AuthContext.tsx)
□ Create real admin user in database with bcrypt-hashed password
□ Generate and set 64-byte random JWT_SECRET
□ Change MongoDB password to 20+ char random string
□ Set NODE_ENV=production
□ Configure real CORS origin (your domain only)
□ Set up real email credentials (Gmail App Password or Brevo IP whitelist)
□ Install security middleware (helmet, rate-limit, mongo-sanitize)

DEPLOY:
□ Frontend → Vercel/Netlify (set VITE_API_URL env var)
□ Backend → Render/Railway/AWS (set all env vars)
□ MongoDB Atlas → whitelist deploy server IP
□ Test all critical flows: register → login → book → track → admin approve

POST-DEPLOY:
□ Set up Sentry for error monitoring
□ Set up UptimeRobot for health checks
□ Enable MongoDB Atlas automated backups
□ Set up SSL (automatic on Vercel/Render)
□ Run Lighthouse audit (target: 90+ scores)
□ Test on mobile devices
```

> [!CAUTION]
> **Do NOT deploy to production until issues #1-#4 are fixed.** The mock auth bypass alone means anyone can access all admin functionality and user data.
