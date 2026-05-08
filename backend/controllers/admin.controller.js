const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const Service = require('../models/Service.model');
const Review = require('../models/Review.model');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalAppointments, totalServices, pendingAppointments, cancelledAppointments, revenue] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Appointment.countDocuments(),
        Service.countDocuments({ isActive: true }),
        Appointment.countDocuments({ status: 'pending' }),
        Appointment.countDocuments({ status: 'cancelled' }),
        Appointment.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAppointments,
        totalServices,
        pendingAppointments,
        cancelledBookings: cancelledAppointments,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get All Appointments (Admin) ─────────────────────────────────────────────
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, bookingRef, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (bookingRef) filter.bookingReference = { $regex: bookingRef, $options: 'i' };

    const appointments = await Appointment.find(filter)
      .populate('userId', 'name email phone')
      .populate('service', 'name category price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({ success: true, appointments, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update Appointment Status (Admin) ────────────────────────────────────────
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    // First fetch the appointment to validate before updating
    const appointment = await Appointment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('service', 'name');

    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Block confirmation if essential fields are missing
    if (status === 'confirmed') {
      const missing = [];
      if (!appointment.bookingDate) missing.push('date');
      if (!appointment.bookingTime) missing.push('time');
      if (!appointment.service) missing.push('service');
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot confirm booking — missing: ${missing.join(', ')}`,
        });
      }
    }

    // Apply updates
    if (status) appointment.status = status;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;
    await appointment.save();

    // Send status update notification email to customer
    if (status && appointment.userId?.email) {
      const { sendStatusUpdateEmail } = require('../utils/email.utils');
      sendStatusUpdateEmail({
        to: appointment.userId.email,
        name: appointment.userId.name || 'Customer',
        bookingRef: appointment.bookingReference,
        serviceName: appointment.service?.name,
        date: appointment.bookingDate,
        timeSlot: appointment.bookingTime,
        newStatus: status,
      }).catch(err => console.error('[Status Email Error]', err.message));
    }

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete Appointment (Admin) ───────────────────────────────────────────────
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get All Users (Admin) ────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments();
    res.json({ success: true, users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Manage Reviews (Admin) ───────────────────────────────────────────────────
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments();
    res.json({ success: true, reviews, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { isApproved, isFeatured } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved, isFeatured },
      { new: true }
    );
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
