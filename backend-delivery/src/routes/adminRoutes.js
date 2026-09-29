const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticate, requireRole(['ADMIN']));

router.get('/stats', AdminController.getDashboardStats);
router.get('/users', AdminController.getAllUsers);
router.put('/users/:id/toggle-status', AdminController.toggleUserStatus);
router.get('/drivers', AdminController.getAllDrivers);

module.exports = router;
