# Snigdha Beauty Parlour - Luxury Salon Booking Platform

## 📋 Project Overview

A production-ready, full-stack luxury salon booking platform built with **React + TypeScript**, **Node.js + Express + TypeScript**, **MongoDB**, and **Framer Motion** animations. The application features a modern, premium UI with cinematic animations, secure authentication, real-time booking management, and an admin dashboard.

---

## ✨ Key Features

### 🎯 Authentication System
- ✅ Secure JWT-based authentication with refresh tokens
- ✅ Sign Up with email validation
- ✅ Sign In with persistent login state
- ✅ Automatic token refresh
- ✅ Session persistence across page reloads
- ✅ Password visibility toggle
- ✅ Secure logout

### 📅 Booking Management
- ✅ Multi-step booking flow (Service → Date/Time → Confirm)
- ✅ Real-time slot availability checking
- ✅ Double booking prevention
- ✅ Service filtering by category
- ✅ Booking history and status tracking
- ✅ Cancellation with reason tracking
- ✅ Email confirmations

### 👤 User Dashboard
- ✅ Personalized dashboard with statistics
- ✅ Upcoming appointments view
- ✅ Booking history
- ✅ Notifications system
- ✅ Profile management
- ✅ Quick booking access

### 🛡️ Admin Features
- ✅ Admin dashboard with analytics
- ✅ Booking management and status updates
- ✅ User management
- ✅ Service management (CRUD)
- ✅ Revenue tracking
- ✅ Booking statistics

### 🎨 UI/UX Design
- ✅ Premium dark theme with gold accents
- ✅ Glassmorphism effects
- ✅ Smooth animations and transitions
- ✅ Responsive design (mobile-first)
- ✅ Loading states and skeleton screens
- ✅ Toast notifications
- ✅ Cinematic intro animation

---

## 🏗️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Efficient form handling
- **Axios** - HTTP client with interceptors
- **React Router v7** - Client-side routing
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** with TypeScript
- **Express.js** - REST API framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM with schema validation
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

---

## 📁 Project Structure

```
root/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.ts         # Authentication logic
│   │   │   ├── booking.ts      # Booking operations
│   │   │   ├── dashboard.ts    # User dashboard
│   │   │   ├── admin.ts        # Admin operations
│   │   │   └── service.ts      # Service management
│   │   ├── models/
│   │   │   ├── User.ts         # User schema
│   │   │   ├── Booking.ts      # Booking schema
│   │   │   ├── Service.ts      # Service schema
│   │   │   └── Notification.ts # Notification schema
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT verification
│   │   │   └── errorHandler.ts # Global error handling
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── booking.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── admin.ts
│   │   │   └── service.ts
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript interfaces
│   │   ├── config/
│   │   │   └── index.ts        # Environment config
│   │   ├── utils/
│   │   │   └── errors.ts       # Error classes
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Auth state management
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── user/
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── Booking.tsx
│   │   │   ├── Home.jsx
│   │   │   ├── Services.jsx
│   │   │   └── ...
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces
│   │   ├── App.tsx              # Main app component
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your values
MONGO_URI=mongodb://localhost:27017/salon_booking
JWT_SECRET=your_super_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLIENT_URL=http://localhost:5173

# Build TypeScript
npm run build

# Start development server
npm run dev
```

**API runs on:** `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
echo 'VITE_API_URL=http://localhost:5000/api' > .env.local

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## 🔐 Authentication Flow

### Sign Up
1. User enters name, email, phone, password
2. Backend validates and hashes password
3. User document created in MongoDB
4. JWT access token and refresh token generated
5. User redirected to dashboard
6. Welcome notification created

### Sign In
1. User enters email and password
2. Backend validates credentials
3. Tokens generated and stored in localStorage
4. User redirected to dashboard (or admin if admin role)
5. Auth context updated with user data

### Auto-Redirect
- If logged-in user visits `/login` or `/register` → redirected to dashboard/admin
- If logged-out user tries to access protected route → redirected to login

### Token Refresh
- Access token expires in 7 days
- Refresh token expires in 30 days
- API interceptor automatically refreshes access token when it expires
- If refresh fails → user logged out and redirected to login

---

## 📅 Booking System

### Creating a Booking
1. User selects service (price, duration, category)
2. User selects appointment date (tomorrow to 30 days)
3. System fetches available slots based on service duration
4. User selects time slot
5. User can add optional notes
6. Booking confirmed with:
   - Auto-generated booking ID
   - Email confirmation sent
   - Dashboard updated in real-time
   - Notification created

### Double Booking Prevention
- Before creating booking, system checks for conflicts
- Checks against all non-cancelled bookings
- Prevents overlapping time slots
- Returns clear error message if conflict exists

### Slot Calculation
- Salon hours: 10 AM - 8 PM
- Slots generated at 30-min intervals
- Each slot checks against service duration
- Unavailable slots excluded from options

---

## 🛠️ API Endpoints

### Authentication
```
POST   /api/auth/signup          # Create account
POST   /api/auth/signin          # Login
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/logout          # Logout
GET    /api/auth/me              # Get current user
PATCH  /api/auth/profile         # Update profile
POST   /api/auth/change-password # Change password
```

### Bookings
```
POST   /api/bookings                  # Create booking
GET    /api/bookings                  # Get user's bookings
GET    /api/bookings/:id              # Get booking details
PATCH  /api/bookings/:id              # Update booking
POST   /api/bookings/:id/cancel       # Cancel booking
GET    /api/bookings/available-slots  # Get available slots
```

### Dashboard
```
GET  /api/dashboard              # Get dashboard data
GET  /api/dashboard/notifications # Get notifications
GET  /api/dashboard/stats        # Get booking statistics
PATCH /api/dashboard/notifications/:id/read  # Mark notification as read
```

### Services
```
GET /api/services               # Get all services
GET /api/services/categories    # Get service categories
GET /api/services/:id           # Get service details
```

### Admin
```
GET    /api/admin/bookings              # Get all bookings
PATCH  /api/admin/bookings/:id/status   # Update booking status
GET    /api/admin/users                 # Get all users
GET    /api/admin/users/:id             # Get user details
POST   /api/admin/services              # Create service
PATCH  /api/admin/services/:id          # Update service
DELETE /api/admin/services/:id          # Delete service
GET    /api/admin/stats                 # Get admin statistics
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Refresh Token Rotation** - Automatic token refresh
- ✅ **Password Hashing** - bcryptjs with salt rounds 12
- ✅ **CORS Protection** - Origin-based access control
- ✅ **Input Validation** - Server and client-side
- ✅ **MongoDB Injection Protection** - Mongoose schema validation
- ✅ **Protected Routes** - Role-based access control
- ✅ **Error Handling** - No sensitive data in errors

---

## 📊 Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (user|admin),
  profileImage: String,
  isVerified: Boolean,
  refreshToken: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings
```javascript
{
  userId: ObjectId (ref: User),
  serviceId: ObjectId (ref: Service),
  appointmentDate: Date,
  startTime: String,
  endTime: String,
  bookingStatus: String (pending|confirmed|completed|cancelled),
  notes: String,
  paymentStatus: String (unpaid|paid|refunded),
  amount: Number,
  cancellationReason: String,
  reminderSent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Services
```javascript
{
  serviceName: String,
  description: String,
  duration: Number,
  price: Number,
  category: String,
  image: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Notifications
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  message: String,
  type: String (booking|reminder|cancellation|status_update),
  read: Boolean,
  relatedBookingId: ObjectId,
  createdAt: Date (TTL: 30 days)
}
```

---

## 🎨 Color Scheme & Typography

### Colors
- **Primary Gold:** #c9a96e
- **Secondary Gold:** #e8d5b7
- **Dark Background:** #1a1a1a (RGB: 26, 26, 26)
- **Text Color:** rgba(255, 255, 255, 0.95)
- **Cream Background:** #f5f1e8

### Typography
- **Headings:** Cormorant Garamond (serif)
- **Body:** Jost (sans-serif)
- **Accent:** Abril Fatface

---

## 🚢 Deployment

### Backend Deployment (Heroku/Railway)
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy dist folder
```

### Environment Variables

**Backend .env**
```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLIENT_URL=https://yourdomain.com
```

**Frontend .env.production**
```
VITE_API_URL=https://api.yourdomain.com
```

---

## 📝 .env Files Examples

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/salon_booking

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_change_this
REFRESH_TOKEN_EXPIRE=30d

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@salonbooking.com
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- ✅ Touch-friendly buttons and forms
- ✅ Optimized for all screen sizes
- ✅ Fast loading on slow networks

---

## 🐛 Troubleshooting

### "Failed to load dashboard"
- Check if backend is running
- Verify MongoDB connection
- Check JWT token in localStorage

### "No available slots"
- Verify salon hours (10 AM - 8 PM)
- Check if date is within 30 days
- Check for double bookings

### "Token expired"
- Page should auto-refresh automatically
- If not, clear localStorage and login again

### CORS errors
- Check `CLIENT_URL` in backend .env
- Ensure credentials are enabled in API calls

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

## 📄 License

MIT License - feel free to use this project for commercial purposes.

---

## 🎉 Features Coming Soon

- [ ] Payment integration (Stripe/Razorpay)
- [ ] Email reminders 24 hours before appointment
- [ ] SMS notifications
- [ ] Rating and review system
- [ ] Staff management
- [ ] Service availability calendar
- [ ] Discount coupons
- [ ] Customer loyalty program
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

---

**Built with ❤️ for a premium salon experience**
