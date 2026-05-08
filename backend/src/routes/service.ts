import { Router } from 'express';
import * as serviceController from '../controllers/service';
import { optional } from '../middleware/auth';

const router = Router();

// Optional auth (for analytics, etc.)
router.use(optional);

router.get('/', serviceController.getAllServices);
router.get('/categories', serviceController.getServiceCategories);
router.get('/:id', serviceController.getServiceById);

export default router;
