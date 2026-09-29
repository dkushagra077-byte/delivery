const express = require('express');
const router = express.Router();
const TrackingController = require('../controllers/trackingController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { recordLocationValidator } = require('../validators/trackingValidator');

router.use(authenticate);

// Driver sends GPS coordinates
router.post('/location', requireRole(['DRIVER', 'ADMIN']), validate(recordLocationValidator), TrackingController.recordLocation);

// Customer / Admin queries latest GPS coordinates and metrics
router.get('/:deliveryId/latest', TrackingController.getLatestLocation);

// History coordinates for route mapping
router.get('/:deliveryId/history', TrackingController.getTrackingHistory);

module.exports = router;
