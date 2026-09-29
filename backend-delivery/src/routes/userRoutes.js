const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', UserController.addAddress);

module.exports = router;
