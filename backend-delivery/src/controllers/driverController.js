const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const User = require('../models/User');

class DriverController {
  static async getMyDriverProfile(req, res, next) {
    try {
      const driver = await Driver.findByUserId(req.user.id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.',
          errorCode: 'DRIVER_NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        data: driver
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!['AVAILABLE', 'BUSY', 'OFFLINE'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of AVAILABLE, BUSY, or OFFLINE',
          errorCode: 'INVALID_DRIVER_STATUS'
        });
      }

      const driver = await Driver.findByUserId(req.user.id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.',
          errorCode: 'DRIVER_NOT_FOUND'
        });
      }

      const updated = await Driver.update(driver.id, {
        availability_status: status
      });

      return res.status(200).json({
        success: true,
        message: `Driver status changed to ${status}`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateVehicle(req, res, next) {
    try {
      const { vehicleType, vehicleNumber, licenseNumber } = req.body;
      const driver = await Driver.findByUserId(req.user.id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.',
          errorCode: 'DRIVER_NOT_FOUND'
        });
      }

      const updated = await Driver.update(driver.id, {
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        license_number: licenseNumber
      });

      return res.status(200).json({
        success: true,
        message: 'Vehicle information updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMyDeliveries(req, res, next) {
    try {
      const driver = await Driver.findByUserId(req.user.id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.',
          errorCode: 'DRIVER_NOT_FOUND'
        });
      }

      const deliveries = await Delivery.getAll({ driverId: driver.id });

      // Join with order details
      const populatedDeliveries = await Promise.all(
        deliveries.map(async (delivery) => {
          const order = await Order.findById(delivery.order_id);
          let customer = null;
          if (order && order.customer_id) {
            customer = await User.findById(order.customer_id);
          }
          return {
            ...delivery,
            order,
            customer: customer ? User.sanitize(customer) : null
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: populatedDeliveries
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllDrivers(req, res, next) {
    try {
      const { status } = req.query;
      const drivers = await Driver.getAll({ status });

      const populatedDrivers = await Promise.all(
        drivers.map(async (driver) => {
          const user = await User.findById(driver.user_id);
          return {
            ...driver,
            user: user ? User.sanitize(user) : null
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: populatedDrivers
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DriverController;
