const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    guestName: {
      type: String,
      trim: true
    },
    guestEmail: {
      type: String,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: 1000,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Allowed multiple reviews per user or guest
// After save: update service average rating
reviewSchema.post('save', async function () {
  const Service = mongoose.model('Service');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { service: this.service, isApproved: true } },
    {
      $group: {
        _id: '$service',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Service.findByIdAndUpdate(this.service, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
reviewSchema.index({ isApproved: 1, createdAt: -1 });
reviewSchema.index({ service: 1, isApproved: 1 });
reviewSchema.index({ isFeatured: 1, isApproved: 1 });

module.exports = mongoose.model('Review', reviewSchema);
