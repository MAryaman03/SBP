const Review = require('../models/Review.model');

exports.getApprovedReviews = async (req, res) => {
  try {
    const { service, featured } = req.query;
    const filter = { isApproved: true };
    if (service) filter.service = service;
    if (featured === 'true') filter.isFeatured = true;

    const reviews = await Review.find(filter)
      .populate('user', 'name avatar')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { serviceId, rating, title, comment, guestName, guestEmail } = req.body;

    const reviewData = {
      service: serviceId,
      rating,
      title,
      comment,
    };

    if (req.user) {
      reviewData.user = req.user.id;
    } else {
      if (!guestName || !guestEmail) {
        return res.status(400).json({ success: false, message: 'Please provide name and email' });
      }
      reviewData.guestName = guestName;
      reviewData.guestEmail = guestEmail;
    }

    const review = await Review.create(reviewData);

    if (req.user) {
      await review.populate('user', 'name avatar');
    }
    
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!review)
      return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
