const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'reminder', 'cancellation', 'status_update', 'system'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
