const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidator');

// Public auth routes
router.post('/register', authLimiter, validate(registerValidator), AuthController.register);
router.post('/login', authLimiter, validate(loginValidator), AuthController.login);
router.post('/logout', AuthController.logout);

// Authenticated auth routes
router.get('/me', authenticate, AuthController.getMe);
router.post('/change-password', authenticate, AuthController.changePassword);

module.exports = router;
