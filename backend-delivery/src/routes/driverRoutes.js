const express = require('express');
const router = express.Router();
const DriverController = require('../controllers/driverController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticate);

// Driver specific routes
router.get('/profile', requireRole(['DRIVER', 'ADMIN']), DriverController.getMyDriverProfile);
router.put('/status', requireRole(['DRIVER', 'ADMIN']), DriverController.updateStatus);
router.put('/vehicle', requireRole(['DRIVER', 'ADMIN']), DriverController.updateVehicle);
router.get('/deliveries', requireRole(['DRIVER', 'ADMIN']), DriverController.getMyDeliveries);

// General/Admin view all drivers
router.get('/', requireRole(['ADMIN', 'CUSTOMER']), DriverController.getAllDrivers);

module.exports = router;
