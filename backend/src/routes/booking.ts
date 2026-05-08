import { Router } from 'express';
import * as bookingController from '../controllers/booking';
import { protect } from '../middleware/auth';

const router = Router();

// PUBLIC: Get available time slots (for checking availability before booking)
router.get('/available-slots', bookingController.getAvailableSlots);

// ─── PROTECTED ROUTES ──────────────────────────────────────────────────────────
// All routes below require authentication
router.use(protect);

// CRUD operations - all require authentication
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getMyBookings);
router.get('/:id', bookingController.getBooking);
router.patch('/:id', bookingController.updateBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

export default router;
