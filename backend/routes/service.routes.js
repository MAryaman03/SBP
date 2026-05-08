const router = require('express').Router();
const {
  getAllServices, getServiceById, createService, updateService, deleteService,
} = require('../controllers/service.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', protect, adminOnly, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;
