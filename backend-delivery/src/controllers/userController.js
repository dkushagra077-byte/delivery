const User = require('../models/User');
const Address = require('../models/Address');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      return res.status(200).json({
        success: true,
        data: User.sanitize(user)
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { fullName, phone, avatarUrl } = req.body;
      const updated = await User.update(req.user.id, {
        full_name: fullName,
        phone,
        avatar_url: avatarUrl
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAddresses(req, res, next) {
    try {
      const addresses = await Address.findByUserId(req.user.id);
      return res.status(200).json({
        success: true,
        data: addresses
      });
    } catch (err) {
      next(err);
    }
  }

  static async addAddress(req, res, next) {
    try {
      const { title, addressLine, city, state, postalCode, latitude, longitude } = req.body;
      const address = await Address.create({
        userId: req.user.id,
        title,
        addressLine,
        city,
        state,
        postalCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      });

      return res.status(201).json({
        success: true,
        message: 'Address added successfully.',
        data: address
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
