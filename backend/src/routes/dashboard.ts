import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard';
import { protect } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', dashboardController.getDashboard);
router.get('/notifications', dashboardController.getNotifications);
router.get('/stats', dashboardController.getBookingStats);
router.patch('/notifications/:id/read', dashboardController.markNotificationAsRead);
router.post('/notifications/read-all', dashboardController.markAllNotificationsAsRead);

export default router;
