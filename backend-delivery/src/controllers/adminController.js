const User = require('../models/User');
const Driver = require('../models/Driver');
const Order = require('../models/Order');
const Delivery = require('../models/Delivery');

class AdminController {
  static async getDashboardStats(req, res, next) {
    try {
      const allUsers = await User.getAll();
      const allDrivers = await Driver.getAll();
      const allOrders = await Order.getAll();
      const allDeliveries = await Delivery.getAll();

      const customersCount = allUsers.filter((u) => u.role === 'CUSTOMER').length;
      const driversCount = allUsers.filter((u) => u.role === 'DRIVER').length;
      const adminCount = allUsers.filter((u) => u.role === 'ADMIN').length;

      const availableDriversCount = allDrivers.filter((d) => d.availability_status === 'AVAILABLE').length;
      const busyDriversCount = allDrivers.filter((d) => d.availability_status === 'BUSY').length;
      const offlineDriversCount = allDrivers.filter((d) => d.availability_status === 'OFFLINE').length;

      const activeDeliveries = allDeliveries.filter((d) =>
        ['ORDER_PLACED', 'ORDER_CONFIRMED', 'DRIVER_ASSIGNED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'NEAR_DESTINATION', 'OUT_FOR_DELIVERY'].includes(d.delivery_status)
      );
      const completedDeliveries = allDeliveries.filter((d) => d.delivery_status === 'DELIVERED');
      const cancelledDeliveries = allDeliveries.filter((d) => d.delivery_status === 'CANCELLED');

      const totalRevenueEstimate = completedDeliveries.length * 18.50; // Average delivery fee

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalUsers: allUsers.length,
            customersCount,
            driversCount,
            adminCount,
            totalOrders: allOrders.length,
            totalDeliveries: allDeliveries.length,
            activeDeliveriesCount: activeDeliveries.length,
            completedDeliveriesCount: completedDeliveries.length,
            cancelledDeliveriesCount: cancelledDeliveries.length,
            completionRate: allDeliveries.length > 0 ? Math.round((completedDeliveries.length / allDeliveries.length) * 100) : 100,
            availableDriversCount,
            busyDriversCount,
            offlineDriversCount,
            totalRevenueEstimate
          },
          recentDeliveries: activeDeliveries.slice(0, 10),
          recentOrders: allOrders.slice(0, 10)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const { role, isActive } = req.query;
      const users = await User.getAll({
        role,
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      });

      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }

  static async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
          errorCode: 'USER_NOT_FOUND'
        });
      }

      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own admin account.',
          errorCode: 'CANNOT_DEACTIVATE_SELF'
        });
      }

      const updated = await User.update(user.id, {
        is_active: !user.is_active
      });

      return res.status(200).json({
        success: true,
        message: `User ${updated.is_active ? 'activated' : 'deactivated'} successfully.`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllDrivers(req, res, next) {
    try {
      const drivers = await Driver.getAll();
      const populated = await Promise.all(
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
        data: populated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
