import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Calendar, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './BookingConfirmation.css';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const appointment = state?.appointment;

  const copyRef = () => {
    const ref = appointment?.bookingRef || 'SALON-2026-0001';
    navigator.clipboard.writeText(ref);
    toast.success('Booking reference copied!');
  };

  // Demo data if no state (direct navigation)
  const bookingRef = appointment?.bookingRef || 'SALON-2026-1234';
  const serviceName = appointment?.service?.name || 'Signature Haircut & Style';
  const date = appointment?.date ? new Date(appointment.date) : new Date();
  const timeSlot = appointment?.timeSlot || '10:00 AM';
  const amount = appointment?.amount || 1200;

  return (
    <main className="confirmation-page" style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <motion.div
          className="confirmation-card"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Success Icon */}
          <motion.div
            className="confirmation__icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle size={56} />
          </motion.div>

          <motion.h1
            className="confirmation__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Booking Confirmed!
          </motion.h1>

          <motion.p
            className="confirmation__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Your appointment has been successfully booked. A confirmation has been sent to your email.
          </motion.p>

          {/* Reference ID */}
          <motion.div
            className="confirmation__ref-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="confirmation__ref-label">Your Booking Reference ID</p>
            <div className="confirmation__ref-id">
              <span>{bookingRef}</span>
              <button
                className="confirmation__copy-btn"
                onClick={copyRef}
                title="Copy reference ID"
              >
                <Copy size={18} />
              </button>
            </div>
            <p className="confirmation__ref-hint">
              Save this ID to track or manage your booking
            </p>
          </motion.div>

          {/* Details */}
          <motion.div
            className="confirmation__details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <div className="confirmation__detail-row">
              <span>Service</span>
              <strong>{serviceName}</strong>
            </div>
            <div className="confirmation__detail-row">
              <span className="flex gap-8 items-center">
                <Calendar size={14} /> Date
              </span>
              <strong>
                {date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </strong>
            </div>
            <div className="confirmation__detail-row">
              <span className="flex gap-8 items-center">
                <Clock size={14} /> Time
              </span>
              <strong>{timeSlot}</strong>
            </div>
            <div className="confirmation__detail-row confirmation__detail-row--total">
              <span>Amount Due at Salon</span>
              <strong className="text-gold">₹{amount?.toLocaleString('en-IN')}</strong>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="confirmation__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Link to="/dashboard" className="btn btn-primary">
              View My Bookings <ArrowRight size={16} />
            </Link>
            <Link to="/track" className="btn btn-outline">
              Track Booking
            </Link>
            <Link to="/" className="btn btn-dark">
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
