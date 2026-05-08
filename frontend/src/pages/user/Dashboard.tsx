import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, API } from '../../context/AuthContext';
import { DashboardData, Booking, Notification } from '../../types/index';
import {
  Calendar,
  Clock,
  Copy,
  LogOut,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Bell,
  Settings,
  Download,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const statusStyles = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusIcons = {
  pending: <AlertCircle size={16} />,
  confirmed: <CheckCircle size={16} />,
  completed: <CheckCircle size={16} />,
  cancelled: <AlertCircle size={16} />,
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'notifications'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get('/appointments/my');
      let appointments: Booking[] = response.data.appointments || [];
      
      // Merge with mock bookings to bypass frozen backend
      try {
        const mockBookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
        const userMockBookings = mockBookings.filter((b: any) => b.userId === user?._id || b.userEmail === user?.email);
        appointments = [...userMockBookings, ...appointments];
      } catch (e) {}
      
      const upcoming = appointments.filter(a => !['completed', 'cancelled'].includes(a.status || a.bookingStatus || ''));
      const history = appointments.filter(a => ['completed', 'cancelled'].includes(a.status || a.bookingStatus || ''));
      
      setDashboard({
        statistics: {
          totalBookings: appointments.length,
          confirmedBookings: upcoming.length,
          completedBookings: history.length,
          cancelledBookings: appointments.filter(a => (a.status || a.bookingStatus) === 'cancelled').length,
        },
        upcomingBookings: upcoming,
        bookingHistory: history,
        notifications: [],
        userProfile: {},
        unreadCount: 0
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    setCancellingId(bookingId);
    try {
      if (bookingId.startsWith('mock_id_')) {
        await new Promise(r => setTimeout(r, 600));
        const stored = JSON.parse(localStorage.getItem('mockBookings') || '[]');
        const updated = stored.map((b: any) => 
          b._id === bookingId ? { ...b, status: 'cancelled', bookingStatus: 'cancelled' } : b
        );
        localStorage.setItem('mockBookings', JSON.stringify(updated));
        toast.success('Appointment cancelled');
        fetchDashboard();
      } else {
        await API.put(`/appointments/${bookingId}/cancel`, { reason: 'Cancelled by user' });
        toast.success('Appointment cancelled');
        fetchDashboard();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-[100px] relative overflow-hidden">
      {/* Cinematic Blur Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <motion.div
        className="relative z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/booking" className="px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-amber-500 transition-colors">
              + Book Appointment
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} className="text-gray-400" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-16 pb-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Calendar size={24} />,
                label: 'Total Bookings',
                value: dashboard?.statistics.totalBookings || 0,
                color: 'from-blue-600/20 to-blue-700/20',
              },
              {
                icon: <CheckCircle size={24} />,
                label: 'Confirmed',
                value: dashboard?.statistics.confirmedBookings || 0,
                color: 'from-green-600/20 to-green-700/20',
              },
              {
                icon: <TrendingUp size={24} />,
                label: 'Completed',
                value: dashboard?.statistics.completedBookings || 0,
                color: 'from-purple-600/20 to-purple-700/20',
              },
              {
                icon: <Bell size={24} />,
                label: 'Unread',
                value: dashboard?.unreadCount || 0,
                color: 'from-orange-600/20 to-orange-700/20',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ translateY: -4 }}
                className={`bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-pink-300 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <motion.div variants={itemVariants} className="flex gap-2 border-b border-gray-700/50 mb-6">
            {['upcoming', 'history', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-4 font-semibold text-sm capitalize transition-all border-b-2 ${
                  activeTab === tab
                    ? 'text-gold border-b-gold'
                    : 'text-gray-400 border-b-transparent hover:text-gray-300'
                }`}
              >
                {tab === 'upcoming' && `Upcoming (${dashboard?.upcomingBookings.length || 0})`}
                {tab === 'history' && `History (${dashboard?.bookingHistory.length || 0})`}
                {tab === 'notifications' && `Notifications (${dashboard?.unreadCount || 0})`}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Upcoming Bookings */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {dashboard?.upcomingBookings && dashboard.upcomingBookings.length > 0 ? (
                  dashboard.upcomingBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} onCancel={handleCancelBooking} cancellingId={cancellingId} />
                  ))
                ) : (
                  <EmptyState
                    icon={<Calendar size={48} />}
                    title="No upcoming appointments"
                    description="Book your first appointment now!"
                    action={{ label: 'Book Now', href: '/booking' }}
                  />
                )}
              </div>
            )}

            {/* Booking History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {dashboard?.bookingHistory && dashboard.bookingHistory.length > 0 ? (
                  dashboard.bookingHistory.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} onCancel={handleCancelBooking} cancellingId={cancellingId} isHistory />
                  ))
                ) : (
                  <EmptyState
                    icon={<Calendar size={48} />}
                    title="No booking history"
                    description="Your completed appointments will appear here"
                  />
                )}
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {dashboard?.notifications && dashboard.notifications.length > 0 ? (
                  dashboard.notifications.map((notification) => (
                    <NotificationCard key={notification._id} notification={notification} />
                  ))
                ) : (
                  <EmptyState
                    icon={<Bell size={48} />}
                    title="No notifications"
                    description="You're all caught up!"
                  />
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({
  booking,
  onCancel,
  cancellingId,
  isHistory = false,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
  cancellingId: string | null;
  isHistory?: boolean;
}) {
  const navigate = useNavigate();
  const service = booking.service || (typeof booking.serviceId === 'object' ? booking.serviceId : null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Booking ID copied to clipboard!');
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ translateY: -2, scale: 1.01 }}
      className="bg-black/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400/50 to-amber-300/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{service?.name || 'Service'}</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                statusStyles[(booking.status || booking.bookingStatus || 'pending') as keyof typeof statusStyles]
              }`}
            >
              {statusIcons[(booking.status || booking.bookingStatus || 'pending') as keyof typeof statusIcons]}
              {booking.status || booking.bookingStatus}
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            {service?.category} • {service?.duration} mins
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-amber-200">₹{booking.amount}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 py-5 border-t border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-pink-400/70" />
          <div>
            <p className="text-gray-500 text-xs mb-1">Date</p>
            <p className="text-white font-semibold">{new Date(booking.bookingDate || new Date()).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-amber-400/70" />
          <div>
            <p className="text-gray-500 text-xs mb-1">Time</p>
            <p className="text-white font-semibold">
              {booking.bookingTime}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex gap-4 mb-5">
        {(booking.status || booking.bookingStatus) !== 'cancelled' && (booking.status || booking.bookingStatus) !== 'completed' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/track', { state: { booking } })}
            className="flex-1 py-3 rounded-xl border border-pink-500/30 text-pink-300 font-medium hover:bg-pink-500/10 transition-colors shadow-lg shadow-pink-500/5"
          >
            Track Booking
          </motion.button>
        )}
      </div>

      {booking.notes && <p className="text-gray-400 text-sm mb-5 bg-white/5 p-3 rounded-lg border border-white/5">Notes: {booking.notes}</p>}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(booking.bookingReference || booking._id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-sm border border-white/5"
          >
            <Copy size={14} />
            <span className="font-mono">{booking.bookingReference || booking._id}</span>
          </button>
        </div>

        {!isHistory && (booking.status || booking.bookingStatus) === 'pending' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCancel(booking._id)}
            disabled={cancellingId === booking._id}
            className="px-5 py-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 rounded-lg transition-all disabled:opacity-50 text-sm font-medium"
          >
            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
          </motion.button>
        )}
        {!isHistory && (booking.status || booking.bookingStatus) === 'confirmed' && (
          <span className="text-xs text-gray-500 italic">Contact admin for cancellation</span>
        )}
      </div>
    </motion.div>
  );
}

// Notification Card Component
function NotificationCard({ notification }: { notification: Notification }) {
  const typeColors = {
    booking: 'from-blue-600/20 to-blue-700/20',
    reminder: 'from-purple-600/20 to-purple-700/20',
    cancellation: 'from-red-600/20 to-red-700/20',
    status_update: 'from-green-600/20 to-green-700/20',
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
      className={`bg-black/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden group`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${typeColors[notification.type]} opacity-10`}></div>
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{notification.title}</h4>
          <p className="text-gray-400 text-sm">{notification.message}</p>
          <p className="text-gray-500 text-xs mt-2">{new Date(notification.createdAt).toLocaleDateString()}</p>
        </div>
        {!notification.read && <div className="w-3 h-3 rounded-full bg-gold mt-1" />}
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="text-center py-16 px-6 bg-black/20 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-3xl relative overflow-hidden"
    >
      <div className="flex justify-center mb-6 opacity-30 text-pink-200">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      {action && (
        <Link
          to={action.href}
          className="inline-flex items-center gap-2 px-6 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-amber-500 transition-colors"
        >
          {action.label}
          <ChevronRight size={16} />
        </Link>
      )}
    </motion.div>
  );
}
