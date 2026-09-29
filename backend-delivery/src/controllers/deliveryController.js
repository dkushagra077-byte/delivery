const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const User = require('../models/User');
const DeliveryEvent = require('../models/DeliveryEvent');
const Tracking = require('../models/Tracking');
const DeliveryService = require('../services/deliveryService');
const NotificationService = require('../services/notificationService');

class DeliveryController {
  static async getAllDeliveries(req, res, next) {
    try {
      const { status, limit = 50 } = req.query;
      let filter = { limit: parseInt(limit, 10) || 50 };

      if (req.user.role === 'DRIVER') {
        const driver = await Driver.findByUserId(req.user.id);
        if (driver) filter.driverId = driver.id;
      }
      if (status) filter.status = status;

      const deliveries = await Delivery.getAll(filter);

      const populated = await Promise.all(
        deliveries.map(async (delivery) => {
          const order = await Order.findById(delivery.order_id);
          let driver = null;
          let customer = null;
          if (delivery.driver_id) {
            driver = await Driver.findById(delivery.driver_id);
          }
          if (order && order.customer_id) {
            customer = await User.findById(order.customer_id);
          }
          return {
            ...delivery,
            order,
            driver,
            customer: customer ? User.sanitize(customer) : null
          };
        })
      );

      // If customer, filter to only their deliveries
      const filtered = req.user.role === 'CUSTOMER'
        ? populated.filter((d) => d.order && d.order.customer_id === req.user.id)
        : populated;

      return res.status(200).json({
        success: true,
        data: filtered
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDeliveryById(req, res, next) {
    try {
      const { id } = req.params;
      const delivery = await Delivery.findById(id);

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found.',
          errorCode: 'DELIVERY_NOT_FOUND'
        });
      }

      const order = await Order.findById(delivery.order_id);
      let customer = null;
      let driver = null;
      let driverUser = null;

      if (order && order.customer_id) {
        customer = await User.findById(order.customer_id);
      }

      if (delivery.driver_id) {
        driver = await Driver.findById(delivery.driver_id);
        if (driver && driver.user_id) {
          driverUser = await User.findById(driver.user_id);
        }
      }

      // Check authorization
      if (req.user.role === 'CUSTOMER' && order && order.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this delivery.',
          errorCode: 'FORBIDDEN'
        });
      }

      const events = await DeliveryEvent.findByDeliveryId(delivery.id);
      const latestTracking = await Tracking.getLatestByDeliveryId(delivery.id);

      return res.status(200).json({
        success: true,
        data: {
          ...delivery,
          order,
          customer: customer ? User.sanitize(customer) : null,
          driver: driver
            ? {
                ...driver,
                user: driverUser ? User.sanitize(driverUser) : null
              }
            : null,
          events,
          latestTracking
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes, proofOfDelivery, signature } = req.body;

      const updated = await DeliveryService.updateStatus({
        deliveryId: id,
        nextStatus: status,
        user: req.user,
        notes,
        proofOfDelivery,
        signature
      });

      return res.status(200).json({
        success: true,
        message: `Delivery status updated to ${status}.`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async assignDriver(req, res, next) {
    try {
      const { id } = req.params;
      const { driverId } = req.body;

      const delivery = await Delivery.findById(id);
      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found.',
          errorCode: 'DELIVERY_NOT_FOUND'
        });
      }

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found.',
          errorCode: 'DRIVER_NOT_FOUND'
        });
      }

      const driverUser = await User.findById(driver.user_id);

      // Update Delivery & Order
      await Delivery.update(delivery.id, {
        driver_id: driver.id,
        delivery_status: 'DRIVER_ASSIGNED'
      });
      await Order.update(delivery.order_id, {
        assigned_driver_id: driver.id,
        status: 'DRIVER_ASSIGNED'
      });

      // Update Driver status to BUSY
      await Driver.update(driver.id, { availability_status: 'BUSY' });

      // Create event
      await DeliveryEvent.create({
        deliveryId: delivery.id,
        eventType: 'DRIVER_ASSIGNED',
        description: `Assigned driver ${driverUser?.full_name || 'Courier'} (${driver.vehicle_type}).`,
        createdByRole: req.user.role
      });

      // Notify Driver
      if (driver.user_id) {
        await NotificationService.notify({
          userId: driver.user_id,
          deliveryId: delivery.id,
          title: 'New Delivery Assigned',
          message: `You have been assigned delivery #${delivery.delivery_number}. Please check your queue.`,
          type: 'INFO'
        });
      }

      // Notify Customer
      const order = await Order.findById(delivery.order_id);
      if (order && order.customer_id) {
        await NotificationService.notify({
          userId: order.customer_id,
          deliveryId: delivery.id,
          title: 'Driver Assigned',
          message: `${driverUser?.full_name || 'A courier'} has been assigned to your delivery #${delivery.delivery_number}.`,
          type: 'DELIVERY_UPDATE'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Driver assigned successfully.',
        data: {
          deliveryId: delivery.id,
          driverId: driver.id,
          status: 'DRIVER_ASSIGNED'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDeliveryTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const events = await DeliveryEvent.findByDeliveryId(id);

      return res.status(200).json({
        success: true,
        data: events
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DeliveryController;
