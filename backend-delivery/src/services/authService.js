const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

class AuthService {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(plainTextPassword, hashedPassword) {
    if (!plainTextPassword || !hashedPassword) return false;
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (err) {
      return null;
    }
  }
}

module.exports = AuthService;
