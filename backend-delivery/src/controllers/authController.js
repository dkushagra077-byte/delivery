const User = require('../models/User');
const Driver = require('../models/Driver');
const AuthService = require('../services/authService');

class AuthController {
  static async register(req, res, next) {
    try {
      const { fullName, email, phone, password, role = 'CUSTOMER', vehicleType, vehicleNumber, licenseNumber } = req.body;

      // Check if email already registered
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
          errorCode: 'EMAIL_ALREADY_EXISTS'
        });
      }

      // Hash password using bcrypt
      const passwordHash = await AuthService.hashPassword(password);

      // Create user
      const user = await User.create({
        fullName,
        email,
        phone,
        passwordHash,
        role: role.toUpperCase()
      });

      // If user registered as DRIVER, create driver profile entry
      let driverProfile = null;
      if (user.role === 'DRIVER') {
        driverProfile = await Driver.create({
          userId: user.id,
          vehicleType: vehicleType || 'MOTORCYCLE',
          vehicleNumber: vehicleNumber || 'UNASSIGNED',
          licenseNumber: licenseNumber || 'PENDING'
        });
      }

      // Generate JWT
      const token = AuthService.generateToken(user);

      // Set HTTP-only secure cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(201).json({
        success: true,
        message: 'Account successfully registered.',
        data: {
          user,
          driver: driverProfile,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          errorCode: 'INVALID_CREDENTIALS'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'This account has been deactivated. Please contact support.',
          errorCode: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Verify password with bcrypt
      const isPasswordValid = await AuthService.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          errorCode: 'INVALID_CREDENTIALS'
        });
      }

      const safeUser = User.sanitize(user);
      const token = AuthService.generateToken(safeUser);

      // Fetch driver record if applicable
      let driverProfile = null;
      if (user.role === 'DRIVER') {
        driverProfile = await Driver.findByUserId(user.id);
      }

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: safeUser,
          driver: driverProfile,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      res.clearCookie('token');
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const safeUser = User.sanitize(req.user);
      let driverProfile = null;
      if (safeUser.role === 'DRIVER') {
        driverProfile = await Driver.findByUserId(safeUser.id);
      }

      return res.status(200).json({
        success: true,
        data: {
          user: safeUser,
          driver: driverProfile
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);

      const isValid = await AuthService.comparePassword(oldPassword, user.password_hash);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.',
          errorCode: 'INCORRECT_OLD_PASSWORD'
        });
      }

      const newHash = await AuthService.hashPassword(newPassword);
      await User.update(user.id, { password_hash: newHash });

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
