import { Router } from 'express';
import * as adminController from '../controllers/admin';
import * as serviceController from '../controllers/service';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// Booking management
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.delete('/bookings/:id', adminController.deleteBooking);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);

// Service management
router.post('/services', adminController.createService);
router.patch('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Statistics
router.get('/stats', adminController.getAdminStats);

export default router;
