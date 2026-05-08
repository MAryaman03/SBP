import { Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import Service from '../models/Service';
import Notification from '../models/Notification';
import { IAuthRequest } from '../types/index';
import { NotFoundError, ValidationError, sendSuccess, handleAsync } from '../utils/errors';

// ─── GET ALL BOOKINGS (ADMIN) ─────────────────────────────────────────────────
export const getAllBookings = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { status, limit = '20', offset = '0', sortBy = 'appointmentDate' } = req.query;

    const query: any = {};
    if (status) {
      query.bookingStatus = status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('serviceId', 'serviceName price duration')
      .sort({ [sortBy as string]: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    sendSuccess(res, { bookings, total });
  }
);

// ─── UPDATE BOOKING STATUS (ADMIN) ────────────────────────────────────────────
export const updateBookingStatus = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid booking status');
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { bookingStatus: status },
      { new: true, runValidators: true }
    ).populate(['userId', 'serviceId']);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Send notification to user
    const statusMessages: { [key: string]: string } = {
      confirmed: 'Your appointment has been confirmed!',
      completed: 'Your appointment is complete. Thank you for visiting us!',
      cancelled: 'Your appointment has been cancelled.',
    };

    if (statusMessages[status]) {
      await Notification.create({
        userId: booking.userId,
        title: `Booking ${status}`,
        message: statusMessages[status],
        type: status === 'confirmed' ? 'status_update' : status === 'cancelled' ? 'cancellation' : 'status_update',
        relatedBookingId: booking._id,
      });
    }

    sendSuccess(res, booking, 'Booking status updated');
  }
);

// ─── DELETE BOOKING (ADMIN) ───────────────────────────────────────────────────
export const deleteBooking = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    sendSuccess(res, {}, 'Booking deleted permanently');
  }
);

// ─── GET ALL USERS (ADMIN) ───────────────────────────────────────────────────
export const getAllUsers = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { limit = '20', offset = '0' } = req.query;

    const total = await User.countDocuments({ role: 'user' });
    const users = await User.find({ role: 'user' })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    sendSuccess(res, { users, total });
  }
);

// ─── GET USER DETAILS (ADMIN) ────────────────────────────────────────────────
export const getUserDetails = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshToken');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get user's booking stats
    const bookings = await Booking.find({ userId: id });
    const stats = {
      totalBookings: bookings.length,
      completedBookings: bookings.filter((b) => b.bookingStatus === 'completed').length,
      totalSpent: bookings.reduce((sum, b) => sum + b.amount, 0),
    };

    sendSuccess(res, { user, stats });
  }
);

// ─── GET ADMIN STATISTICS ────────────────────────────────────────────────────
export const getAdminStats = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const bookings = await Booking.find();
    const users = await User.find({ role: 'user' });
    const services = await Service.find();

    const stats = {
      totalBookings: bookings.length,
      totalUsers: users.length,
      totalServices: services.length,
      totalRevenue: bookings
        .filter((b) => b.bookingStatus === 'completed')
        .reduce((sum, b) => sum + b.amount, 0),
      bookingsByStatus: {
        pending: bookings.filter((b) => b.bookingStatus === 'pending').length,
        confirmed: bookings.filter((b) => b.bookingStatus === 'confirmed').length,
        completed: bookings.filter((b) => b.bookingStatus === 'completed').length,
        cancelled: bookings.filter((b) => b.bookingStatus === 'cancelled').length,
      },
      recentBookings: bookings.slice(0, 10),
      recentUsers: users.slice(0, 10),
    };

    sendSuccess(res, stats);
  }
);

// ─── CREATE SERVICE (ADMIN) ───────────────────────────────────────────────────
export const createService = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { serviceName, description, duration, price, category, image } = req.body;

    if (!serviceName || !description || !duration || !price || !category) {
      throw new ValidationError('All required fields must be provided');
    }

    const service = await Service.create({
      serviceName,
      description,
      duration,
      price,
      category,
      image,
      isActive: true,
    });

    sendSuccess(res, service, 'Service created successfully', 201);
  }
);

// ─── UPDATE SERVICE (ADMIN) ───────────────────────────────────────────────────
export const updateService = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const service = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    sendSuccess(res, service, 'Service updated');
  }
);

// ─── DELETE SERVICE (ADMIN) ───────────────────────────────────────────────────
export const deleteService = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    sendSuccess(res, {}, 'Service deactivated');
  }
);
