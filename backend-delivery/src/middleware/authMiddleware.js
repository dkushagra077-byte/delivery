const AuthService = require('../services/authService');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Or check HTTP-only cookie
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please log in.',
        errorCode: 'UNAUTHENTICATED'
      });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
        errorCode: 'TOKEN_EXPIRED_OR_INVALID'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with this token no longer exists.',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        errorCode: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authenticate
};
