import { Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Notification from '../models/Notification';
import { IAuthRequest, IDashboardData } from '../types/index';
import { NotFoundError, sendSuccess, handleAsync } from '../utils/errors';

// ─── GET DASHBOARD DATA ───────────────────────────────────────────────────────
export const getDashboard = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    // Get all bookings for the user
    const allBookings = await Booking.find({ userId })
      .populate('serviceId', 'serviceName price duration category image')
      .sort({ appointmentDate: -1 });

    // Separate upcoming and history
    const now = new Date();
    const upcomingBookings = allBookings.filter(
      (b) => b.appointmentDate > now && ['pending', 'confirmed'].includes(b.bookingStatus)
    );
    const bookingHistory = allBookings.filter((b) => !upcomingBookings.includes(b));

    // Get statistics
    const statistics = {
      totalBookings: allBookings.length,
      confirmedBookings: allBookings.filter((b) => b.bookingStatus === 'confirmed').length,
      completedBookings: allBookings.filter((b) => b.bookingStatus === 'completed').length,
      cancelledBookings: allBookings.filter((b) => b.bookingStatus === 'cancelled').length,
      upcomingBookings: upcomingBookings.length,
    };

    // Get notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    const dashboardData: IDashboardData = {
      upcomingBookings: upcomingBookings.slice(0, 5),
      bookingHistory: bookingHistory.slice(0, 10),
      statistics,
      notifications,
      userProfile: req.user,
    };

    sendSuccess(res, { ...dashboardData, unreadCount });
  }
);

// ─── GET NOTIFICATIONS ───────────────────────────────────────────────────────
export const getNotifications = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { limit = '20', offset = '0' } = req.query;

    const total = await Notification.countDocuments({ userId: req.user?._id });
    const notifications = await Notification.find({ userId: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    sendSuccess(res, { notifications, total });
  }
);

// ─── MARK NOTIFICATION AS READ ────────────────────────────────────────────────
export const markNotificationAsRead = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    sendSuccess(res, notification);
  }
);

// ─── MARK ALL NOTIFICATIONS AS READ ───────────────────────────────────────────
export const markAllNotificationsAsRead = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    await Notification.updateMany({ userId: req.user?._id, read: false }, { read: true });

    sendSuccess(res, {}, 'All notifications marked as read');
  }
);

// ─── GET BOOKING STATS ────────────────────────────────────────────────────────
export const getBookingStats = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const bookings = await Booking.find({ userId: req.user?._id });

    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.bookingStatus === 'pending').length,
      confirmed: bookings.filter((b) => b.bookingStatus === 'confirmed').length,
      completed: bookings.filter((b) => b.bookingStatus === 'completed').length,
      cancelled: bookings.filter((b) => b.bookingStatus === 'cancelled').length,
      totalSpent: bookings
        .filter((b) => ['completed', 'confirmed'].includes(b.bookingStatus))
        .reduce((sum, b) => sum + b.amount, 0),
    };

    sendSuccess(res, stats);
  }
);
