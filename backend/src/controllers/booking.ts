import { Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Service from '../models/Service';
import Notification from '../models/Notification';
import { IAuthRequest } from '../types/index';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  sendSuccess,
  handleAsync,
} from '../utils/errors';
import { generateBookingReference } from '../utils/bookingRef';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Parse "HH:mm" → total minutes since midnight. */
const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** Parse "YYYY-MM-DD" as a local-noon Date (avoids UTC-midnight timezone drift). */
const parseLocalDate = (dateStr: string): Date => {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, mo - 1, d, 12, 0, 0);
};

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Salon operating window (minutes since midnight)
const SALON_OPEN = 10 * 60; // 10:00
const SALON_CLOSE = 20 * 60; // 20:00

// ─── CREATE BOOKING ──────────────────────────────────────────────────────────
// @route  POST /api/bookings
// @access Private
export const createBooking = handleAsync(
  async (req: IAuthRequest, res: Response, _next: NextFunction) => {
    const { serviceId, appointmentDate, startTime, endTime, notes } = req.body;

    // ── Validate required fields ──
    if (!serviceId || !appointmentDate || !startTime || !endTime) {
      throw new ValidationError('serviceId, appointmentDate, startTime, and endTime are required');
    }

    if (!DATE_REGEX.test(appointmentDate)) {
      throw new ValidationError('appointmentDate must be in YYYY-MM-DD format');
    }

    if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
      throw new ValidationError('startTime and endTime must be in HH:mm format');
    }

    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);

    if (endMin <= startMin) {
      throw new ValidationError('endTime must be after startTime');
    }

    if (startMin < SALON_OPEN || endMin > SALON_CLOSE) {
      throw new ValidationError('Appointment must fall within salon hours (10:00–20:00)');
    }

    // ── Validate date is in the future ──
    const bookingDate = parseLocalDate(appointmentDate);
    if (bookingDate < new Date()) {
      throw new ValidationError('Cannot book appointments in the past');
    }

    // ── Validate service ──
    const service = await Service.findById(serviceId);
    if (!service) throw new NotFoundError('Service not found');
    if (!service.isActive) throw new ValidationError('This service is currently unavailable');

    // ── Check for overlap ──
    const conflict = await findConflict({ date: bookingDate, startTime, endTime });
    if (conflict) {
      throw new ConflictError('This time slot conflicts with an existing booking. Please choose a different time.');
    }

    // ── Generate unique booking reference ──
    const bookingReference = generateBookingReference();

    // ── Create booking ──
    const booking = await Booking.create({
      bookingReference,
      userId: req.user?._id,
      serviceId,
      appointmentDate: bookingDate,
      startTime,
      endTime,
      notes,
      amount: service.price,
    });

    await booking.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'serviceId', select: 'serviceName price duration category' },
    ]);

    await Notification.create({
      userId: req.user?._id,
      title: 'Booking Confirmed',
      message: `Your appointment for ${service.serviceName} is confirmed on ${appointmentDate} at ${startTime}.`,
      type: 'booking',
      relatedBookingId: booking._id,
    });

    sendSuccess(res, booking, 'Appointment booked successfully', 201);
  }
);

// ─── GET MY BOOKINGS ──────────────────────────────────────────────────────────
// @route  GET /api/bookings/my
// @access Private
export const getMyBookings = handleAsync(
  async (req: IAuthRequest, res: Response, _next: NextFunction) => {
    const { status, limit = '10', offset = '0' } = req.query;

    const limitNum = Math.max(1, parseInt(limit as string) || 10);
    const offsetNum = Math.max(0, parseInt(offset as string) || 0);

    const query: Record<string, unknown> = { userId: req.user?._id };
    if (status) query.bookingStatus = status;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('serviceId', 'serviceName price duration category image')
        .sort({ appointmentDate: -1 })
        .limit(limitNum)
        .skip(offsetNum),
      Booking.countDocuments(query),
    ]);

    sendSuccess(res, { bookings, total, limit: limitNum, offset: offsetNum });
  }
);

// ─── GET SINGLE BOOKING ───────────────────────────────────────────────────────
// @route  GET /api/bookings/:id
// @access Private
export const getBooking = handleAsync(
  async (req: IAuthRequest, res: Response, _next: NextFunction) => {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    }).populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'serviceId', select: 'serviceName price duration category image' },
    ]);

    if (!booking) throw new NotFoundError('Booking not found');

    sendSuccess(res, booking);
  }
);

// ─── UPDATE BOOKING ───────────────────────────────────────────────────────────
// @route  PATCH /api/bookings/:id
// @access Private
export const updateBooking = handleAsync(
  async (req: IAuthRequest, res: Response, _next: NextFunction) => {
    const { startTime, endTime, appointmentDate, notes } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!booking) throw new NotFoundError('Booking not found');

    if (['completed', 'cancelled'].includes(booking.bookingStatus)) {
      throw new ValidationError('Cannot update a completed or cancelled booking');
    }

    const isRescheduling = startTime || endTime || appointmentDate;

    if (isRescheduling) {
      // Merge with existing values so partial updates work
      const newStartTime = startTime || booking.startTime;
      const newEndTime = endTime || booking.endTime;
      const newDateStr = appointmentDate || booking.appointmentDate.toISOString().slice(0, 10);

      if (!TIME_REGEX.test(newStartTime) || !TIME_REGEX.test(newEndTime)) {
        throw new ValidationError('startTime and endTime must be in HH:mm format');
      }

      if (!DATE_REGEX.test(newDateStr)) {
        throw new ValidationError('appointmentDate must be in YYYY-MM-DD format');
      }

      const startMin = toMinutes(newStartTime);
      const endMin = toMinutes(newEndTime);

      if (endMin <= startMin) {
        throw new ValidationError('endTime must be after startTime');
      }

      if (startMin < SALON_OPEN || endMin > SALON_CLOSE) {
        throw new ValidationError('Appointment must fall within salon hours (10:00–20:00)');
      }

      const newDate = parseLocalDate(newDateStr);
      if (newDate < new Date()) {
        throw new ValidationError('Cannot reschedule to a date in the past');
      }

      const conflict = await findConflict({
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        excludeId: String(booking._id),
      });

      if (conflict) {
        throw new ConflictError('The new time slot conflicts with an existing booking');
      }

      booking.appointmentDate = newDate;
      booking.startTime = newStartTime;
      booking.endTime = newEndTime;
    }

    if (notes !== undefined) booking.notes = notes;

    await booking.save();
    await booking.populate('serviceId', 'serviceName price duration');

    sendSuccess(res, booking, 'Booking updated successfully');
  }
);

// ─── CANCEL BOOKING ───────────────────────────────────────────────────────────
// @route  PATCH /api/bookings/:id/cancel
// @access Private
export const cancelBooking = handleAsync(
  async (req: IAuthRequest, res: Response, _next: NextFunction) => {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.bookingStatus === 'completed') {
      throw new ValidationError('Cannot cancel a completed appointment');
    }

    if (booking.bookingStatus === 'cancelled') {
      throw new ValidationError('This appointment is already cancelled');
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();

    await Notification.create({
      userId: req.user?._id,
      title: 'Booking Cancelled',
      message: `Your appointment has been cancelled. Reason: ${booking.cancellationReason}`,
      type: 'cancellation',
      relatedBookingId: booking._id,
    });

    sendSuccess(res, booking, 'Appointment cancelled successfully');
  }
);

// ─── GET AVAILABLE SLOTS ──────────────────────────────────────────────────────
// @route  GET /api/bookings/slots?date=YYYY-MM-DD&duration=60
// @access Public
export const getAvailableSlots = handleAsync(
  async (req: IAuthRequest, res: Response, _next: NextFunction) => {
    const { date, duration = '60' } = req.query;

    if (!date) throw new ValidationError('date is required');

    if (!DATE_REGEX.test(date as string)) {
      throw new ValidationError('date must be in YYYY-MM-DD format');
    }

    const slotDuration = parseInt(duration as string);
    if (isNaN(slotDuration) || slotDuration <= 0 || slotDuration > 480) {
      throw new ValidationError('duration must be a positive number (max 480 minutes)');
    }

    const selectedDate = parseLocalDate(date as string);

    // Fetch all non-cancelled bookings for the day
    const bookings = await Booking.find({
      appointmentDate: selectedDate,
      bookingStatus: { $nin: ['cancelled'] },
    }).select('startTime endTime');

    // Pre-convert to minute ranges once
    const bookedRanges = bookings.map((b) => ({
      start: toMinutes(b.startTime),
      end: toMinutes(b.endTime),
    }));

    // Walk every 30-minute boundary and test for overlap
    const slots: string[] = [];

    for (let slotStart = SALON_OPEN; slotStart < SALON_CLOSE; slotStart += 30) {
      const slotEnd = slotStart + slotDuration;

      if (slotEnd > SALON_CLOSE) break; // no further slot can fit either

      const hasConflict = bookedRanges.some(
        ({ start, end }) => slotStart < end && slotEnd > start
      );

      if (!hasConflict) {
        const h = Math.floor(slotStart / 60);
        const m = slotStart % 60;
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }

    sendSuccess(res, { date, duration: slotDuration, slots }, 'Available slots retrieved');
  }
);

// ─── SHARED CONFLICT QUERY ────────────────────────────────────────────────────

interface ConflictOptions {
  date: Date;
  startTime: string;
  endTime: string;
  excludeId?: string;
}

/**
 * Returns a conflicting booking if one exists, otherwise null.
 * Uses string comparison (HH:mm sorts lexicographically = numerically).
 */
async function findConflict({ date, startTime, endTime, excludeId }: ConflictOptions) {
  const query: Record<string, unknown> = {
    appointmentDate: date,
    bookingStatus: { $nin: ['cancelled'] },
    // Overlap condition: existing.start < newEnd AND existing.end > newStart
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeId) query._id = { $ne: excludeId };

  return Booking.findOne(query).select('_id startTime endTime');
}