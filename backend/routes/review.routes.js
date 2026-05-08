const router = require('express').Router();
const { getApprovedReviews, createReview, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getApprovedReviews);
router.post('/', createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
