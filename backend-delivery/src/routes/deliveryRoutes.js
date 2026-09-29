const express = require('express');
const router = express.Router();
const DeliveryController = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { updateDeliveryStatusValidator, assignDriverValidator } = require('../validators/deliveryValidator');

router.use(authenticate);

router.get('/', DeliveryController.getAllDeliveries);
router.get('/:id', DeliveryController.getDeliveryById);
router.put('/:id/status', validate(updateDeliveryStatusValidator), DeliveryController.updateStatus);
router.post('/:id/assign', requireRole(['ADMIN']), validate(assignDriverValidator), DeliveryController.assignDriver);
router.get('/:id/timeline', DeliveryController.getDeliveryTimeline);

module.exports = router;
