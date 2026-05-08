const router = require('express').Router();
const {
  getDashboardStats, getAllAppointments, updateAppointmentStatus, deleteAppointment,
  getAllUsers, getAllReviews, updateReview, deleteReview
} = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect, adminOnly); // All admin routes require auth + admin role

router.get('/stats', getDashboardStats);
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id', updateAppointmentStatus);
router.delete('/appointments/:id', deleteAppointment);
router.get('/users', getAllUsers);
router.get('/reviews', getAllReviews);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
