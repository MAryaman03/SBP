import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';
import CinematicLuxuryIntro from './components/CinematicLuxuryIntro';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages (Lazy Loaded)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Booking = lazy(() => import('./pages/Booking'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const TrackBooking = lazy(() => import('./pages/TrackBooking'));

import './index.css';

// Loading Fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// ─── App Shell ────────────────────────────────────────────────────────────────
const AppShell = () => (
  <>
    <Navbar />
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/track" element={<TrackBooking />} />

        {/* Auth Routes - Redirect if logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/confirmation"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    <Footer />
  </>
);

// ─── Error Boundary ─────────────────────────────────────────────────────────────
import React from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-4xl font-bold mb-4 text-gold">Oops! Something went wrong.</h1>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            We're sorry, but an unexpected error occurred. Please try refreshing the page or navigating back to the home page.
          </p>
          <a href="/" className="px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-amber-500 transition-colors">
            Return Home
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const isFirstVisit = !sessionStorage.getItem('introSeen');
  
  // Mark intro as seen after a short delay
  if (isFirstVisit) {
    setTimeout(() => sessionStorage.setItem('introSeen', 'true'), 1000);
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            containerStyle={{ top: '90px', right: '20px' }}
            toastOptions={{
              style: { fontFamily: 'Jost, sans-serif', fontSize: '14px', background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
              success: { iconTheme: { primary: '#c9a96e', secondary: '#fff' } },
            }}
          />
          <CinematicLuxuryIntro forceShow={isFirstVisit} />
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
