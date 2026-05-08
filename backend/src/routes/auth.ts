import { Router } from 'express';
import * as authController from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/refresh', authController.refreshAccessToken);

// Protected routes
router.use(protect);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.patch('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);

export default router;
