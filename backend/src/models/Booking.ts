import mongoose, { Schema, Document } from 'mongoose';
import { IBooking } from '../types/index';

interface IBookingDocument extends IBooking, Document {}

const bookingSchema = new Schema<IBookingDocument>(
  {
    bookingReference: {
      type: String,
      unique: true,
      required: [true, 'Booking reference is required'],
      index: true,
      sparse: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    cancellationReason: String,
    cancelledAt: Date,
    completedAt: Date,
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Compound index for preventing double bookings
bookingSchema.index({ appointmentDate: 1, startTime: 1, bookingStatus: 1 });

// Compound index for user queries
bookingSchema.index({ userId: 1, appointmentDate: -1 });

// Validate that endTime > startTime
bookingSchema.pre('validate', function (next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    if (endTotalMin <= startTotalMin) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

// Auto-set completedAt when status changes to completed
bookingSchema.pre('save', function (next) {
  if (this.isModified('bookingStatus') && this.bookingStatus === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified('bookingStatus') && this.bookingStatus === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  next();
});

export default mongoose.model<IBookingDocument>('Booking', bookingSchema);
