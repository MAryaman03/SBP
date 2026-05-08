const Appointment = require('../models/Appointment.model');
const Service = require('../models/Service.model');
const { sendBookingConfirmationEmail, sendAdminNotificationEmail } = require('../utils/email.utils');
const { notifyBookingConfirmed } = require('../services/notificationService');

// ─── @desc   Create appointment ───────────────────────────────────────────────
// ─── @route  POST /api/appointments ──────────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
exports.createAppointment = async (req, res) => {
  try {
    const { serviceId, date, bookingDate, timeSlot, bookingTime, notes, guestName, guestEmail, guestPhone } = req.body;
    
    // Accept both field name variants from frontend
    const rawDate = date || bookingDate;
    const finalTime = timeSlot || bookingTime;

    if (!rawDate || !finalTime) {
      return res.status(400).json({ success: false, message: 'Please provide both date and time slot' });
    }

    // Robust date parsing — handle ISO strings, "YYYY-MM-DD", and Date objects
    let parsedDate;
    if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      // "2026-05-08" → parse as local date (noon to avoid timezone shifts)
      const [y, m, d] = rawDate.split('-').map(Number);
      parsedDate = new Date(y, m - 1, d, 12, 0, 0);
    } else {
      parsedDate = new Date(rawDate);
    }

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: `Invalid date value received: "${rawDate}"` });
    }

    // Validate service
    const service = await Service.findById(serviceId);
    if (!service)
      return res.status(404).json({ success: false, message: 'Service not found' });

    // Check for slot conflict
    const conflict = await Appointment.findOne({
      bookingDate: parsedDate,
      bookingTime: finalTime,
      status: { $nin: ['cancelled'] },
    });
    if (conflict)
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });

    // Create appointment with automatic retry on E11000 error
    let appointment;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      try {
        appointment = await Appointment.create({
          userId: req.user._id,
          service: serviceId,
          bookingDate: parsedDate,
          bookingTime: finalTime,
          duration: service.duration,
          notes,
          guestName,
          guestEmail,
          guestPhone,
          amount: service.price,
        });
        break; // Success - exit retry loop
      } catch (err) {
        if (err.code === 11000) {
          // E11000 duplicate key error - retry with new reference
          retries++;
          console.log(`⚠ E11000 error (attempt ${retries}/${maxRetries}) - retrying...`);
          if (retries >= maxRetries) {
            throw new Error('Failed to generate unique booking reference after multiple attempts. Please try again.');
          }
          // Continue to next iteration to retry
          continue;
        }
        // For other errors, throw immediately
        throw err;
      }
    }

    await appointment.populate(['userId', 'service']);

    const customerEmail = appointment.userId?.email || guestEmail;
    const customerName = appointment.userId?.name || guestName;

    // Trigger Modern Brevo Notification (Email + SMS)
    notifyBookingConfirmed({ user: req.user || {}, appointment, service }).catch(err => {
      console.error('[Notification Trigger Error]', err.message);
    });

    // Fallback/Admin classic notifications
    if (customerEmail) {
      sendBookingConfirmationEmail({
        to: customerEmail,
        name: customerName,
        bookingRef: appointment.bookingReference,
        serviceName: service.name,
        date: appointment.bookingDate,
        timeSlot: appointment.bookingTime,
      }).catch(console.error);
    }

    // Notify admin
    sendAdminNotificationEmail({
      bookingRef: appointment.bookingReference,
      customerName,
      customerEmail,
      serviceName: service.name,
      date: appointment.bookingDate,
      timeSlot: appointment.bookingTime,
    }).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @desc   Get my appointments ──────────────────────────────────────────────
// ─── @route  GET /api/appointments/my ────────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('service', 'name category price image duration')
      .sort({ bookingDate: -1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @desc   Get single appointment by bookingRef ─────────────────────────────
// ─── @route  GET /api/appointments/track/:bookingRef ─────────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
exports.trackAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ bookingReference: req.params.bookingRef })
      .populate('service', 'name category price image duration')
      .populate('userId', 'name'); // Strip email/phone for public tracking

    if (!appointment)
      return res.status(404).json({ success: false, message: 'Booking not found with this reference ID' });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @desc   Cancel appointment ───────────────────────────────────────────────
// ─── @route  PUT /api/appointments/:id/cancel ────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment.status === 'completed')
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment' });

    if (appointment.status === 'confirmed')
      return res.status(400).json({ success: false, message: 'Cannot cancel a confirmed appointment. Contact admin for cancellation.' });

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelReason = req.body.reason || 'Cancelled by user';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @desc   Get available time slots for a date ─────────────────────────────
// ─── @route  GET /api/appointments/slots?date=YYYY-MM-DD ─────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date)
      return res.status(400).json({ success: false, message: 'Date is required' });

    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
      '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
      '05:00 PM', '05:30 PM', '06:00 PM',
    ];

    const booked = await Appointment.find({
      bookingDate: new Date(date),
      status: { $nin: ['cancelled'] },
    }).select('bookingTime');

    const bookedSlots = booked.map((a) => a.bookingTime);
    const available = allSlots.filter((s) => !bookedSlots.includes(s));

    res.json({ success: true, slots: available, bookedSlots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
