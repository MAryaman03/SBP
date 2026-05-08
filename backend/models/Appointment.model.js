const mongoose = require('mongoose');
const generateUniqueBookingRef = require('../utils/generateBookingRef');

const appointmentSchema = new mongoose.Schema(
  {
    // ─── Booking Reference ───────────────────────────────────────────────
    bookingReference: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      // Generated in pre-save hook: SBP-<YEAR>-<4-digit-random>
    },

    // ─── Relations ───────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },

    // ─── Appointment Details ─────────────────────────────────────────────
    bookingDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    bookingTime: {
      type: String,          // e.g. "10:00 AM"
      required: [true, 'Time slot is required'],
    },
    duration: {
      type: Number,          // in minutes, copied from service at booking time
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },

    // ─── Guest Info (in case booking without account) ────────────────────
    guestName: String,
    guestEmail: String,
    guestPhone: String,

    // ─── Status ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },

    // ─── Payment ─────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentId: String,
    amount: {
      type: Number,
      default: 0,
    },

    // ─── Flags ───────────────────────────────────────────────────────────
    isNotificationSent: {
      type: Boolean,
      default: false,
    },
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

// ─── Generate bookingRef before saving ────────────────────────────────────────
appointmentSchema.pre('save', function (next) {
  if (this.isNew && !this.bookingReference) {
    // Use fast, collision-resistant reference generation
    this.bookingReference = generateUniqueBookingRef();
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
appointmentSchema.index({ userId: 1, bookingDate: -1 });
appointmentSchema.index({ bookingDate: 1, bookingTime: 1 });
appointmentSchema.index({ status: 1, bookingDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
