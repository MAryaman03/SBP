const router = require('express').Router();
const {
  createAppointment, getMyAppointments, trackAppointment,
  cancelAppointment, getAvailableSlots,
} = require('../controllers/appointment.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/slots', getAvailableSlots);
router.get('/track/:bookingRef', trackAppointment);
router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
