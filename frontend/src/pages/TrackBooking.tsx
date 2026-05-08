import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Scissors, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';

const statusConfig = {
  pending: { icon: <AlertCircle size={20} />, label: 'Pending Confirmation', color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
  confirmed: { icon: <CheckCircle size={20} />, label: 'Confirmed', color: 'text-pink-400', border: 'border-pink-400/30', bg: 'bg-pink-400/10' },
  'in-progress': { icon: <Scissors size={20} />, label: 'In Progress', color: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/10' },
  completed: { icon: <CheckCircle size={20} />, label: 'Completed', color: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' },
  cancelled: { icon: <XCircle size={20} />, label: 'Cancelled', color: 'text-red-400', border: 'border-red-400/30', bg: 'bg-red-400/10' },
};

const timelineSteps = ['pending', 'confirmed', 'in-progress', 'completed'];

export default function TrackBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedBooking = location.state?.booking;

  const [refId, setRefId] = useState(passedBooking?.bookingReference || passedBooking?.bookingRef || '');
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  // Fetch fresh booking data (from localStorage mock or API)
  const fetchBooking = async (ref: string) => {
    if (!ref) return;
    setLoading(true);
    setNotFound(false);
    setAppointment(null);

    // Check mock bookings first (for latest status)
    try {
      const mockBookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      const mockFound = mockBookings.find((b: any) => (b.bookingReference || b.bookingRef) === ref.trim().toUpperCase());
      if (mockFound) {
        setAppointment(mockFound);
        setLoading(false);
        return;
      }
    } catch (e) {}

    // Fetch from backend API
    try {
      const res = await API.get(`/appointments/track/${ref.trim().toUpperCase()}`);
      setAppointment(res.data.appointment);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // If API says not found, fall back to passed booking data (might be mock)
        if (passedBooking) {
          setAppointment(passedBooking);
        } else {
          setNotFound(true);
        }
      } else {
        // Network error — use passed data if available
        if (passedBooking) {
          setAppointment(passedBooking);
        } else {
          toast.error('Error fetching booking. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount when we have a reference (always get fresh status)
  useEffect(() => {
    const ref = passedBooking?.bookingReference || passedBooking?.bookingRef;
    if (ref) {
      setRefId(ref);
      fetchBooking(ref);
    }
  }, [passedBooking]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim()) return toast.error('Please enter a booking reference ID');
    fetchBooking(refId);
  };

  // Support both 'status' (real DB) and 'bookingStatus' (mock bookings)
  const currentStatus = appointment ? (appointment.status || appointment.bookingStatus || 'pending').toLowerCase() : null;
  const statusInfo = currentStatus ? statusConfig[currentStatus as keyof typeof statusConfig] : null;

  const getStepStatus = (step: string) => {
    if (currentStatus === 'cancelled') return 'cancelled';
    const currentIndex = timelineSteps.indexOf(currentStatus!);
    const stepIndex = timelineSteps.indexOf(step);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[100px] pb-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-amber-200 mb-4">
            Track Booking
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Enter your booking reference ID to see real-time updates and status.
          </p>
        </div>

        {/* Search Box */}
        <motion.div 
          className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="e.g. SBP-2026-1234"
              value={refId}
              onChange={(e) => setRefId(e.target.value.toUpperCase())}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-pink-500/80 to-amber-500/80 hover:from-pink-500 hover:to-amber-500 text-white font-medium px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={18} /> Track
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Not Found */}
        {notFound && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto"
          >
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Booking Not Found</h3>
            <p className="text-red-200/70">We couldn't find a booking with reference <strong>{refId}</strong>. Please verify the ID and try again.</p>
          </motion.div>
        )}

        {/* Result */}
        {appointment && statusInfo && (
          <motion.div 
            className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-2xl shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b border-white/5 gap-6">
              <div>
                <p className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-1">Booking Reference</p>
                <h2 className="text-3xl font-serif text-white">{appointment.bookingReference || appointment.bookingRef}</h2>
              </div>
              <div className={`flex items-center gap-2 px-6 py-3 rounded-full border ${statusInfo.border} ${statusInfo.bg}`}>
                <span className={statusInfo.color}>{statusInfo.icon}</span>
                <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
              </div>
            </div>

            {/* Timeline UI */}
            {currentStatus !== 'cancelled' ? (
              <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 hidden md:block rounded-full"></div>
                <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                  {timelineSteps.map((step, idx) => {
                    const stepState = getStepStatus(step);
                    return (
                      <div key={step} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                          ${stepState === 'completed' ? 'bg-pink-500 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]' : ''}
                          ${stepState === 'current' ? 'bg-black border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]' : ''}
                          ${stepState === 'upcoming' ? 'bg-black border-white/20' : ''}
                        `}>
                          {stepState === 'completed' && <CheckCircle size={20} className="text-white" />}
                          {stepState === 'current' && <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" />}
                          {stepState === 'upcoming' && <div className="w-2 h-2 bg-white/20 rounded-full" />}
                        </div>
                        <p className={`font-medium capitalize ${stepState === 'upcoming' ? 'text-gray-500' : 'text-white'}`}>
                          {step.replace('-', ' ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-12 bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center">
                <p className="text-red-400 font-medium">This booking has been cancelled.</p>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-pink-400">
                    <Scissors size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Service Details</p>
                    <p className="text-white font-medium text-lg">{appointment.serviceId?.serviceName || appointment.service?.name}</p>
                    <p className="text-gray-500 mt-1">{appointment.serviceId?.duration || appointment.service?.duration} minutes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-amber-400">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Date & Time</p>
                    <p className="text-white font-medium text-lg">
                      {new Date(appointment.appointmentDate || appointment.bookingDate || appointment.date).toLocaleDateString('en-IN', {
                        weekday: 'long', month: 'long', day: 'numeric'
                      })}
                    </p>
                    <p className="text-amber-400/80 mt-1">{appointment.startTime || appointment.bookingTime || appointment.timeSlot}</p>
                  </div>
                </div>
              </div>

              {(appointment.userId?.name || appointment.user?.name) && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Customer</p>
                    <p className="text-white font-medium">{appointment.userId?.name || appointment.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                    <p className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-300">
                      ₹{appointment.amount?.toLocaleString('en-IN') || (appointment.serviceId?.price || appointment.service?.price || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Booking Created</p>
                  <p className="text-white font-medium">
                    {appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
