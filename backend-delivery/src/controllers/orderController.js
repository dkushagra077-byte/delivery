const Order = require('../models/Order');
const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const DeliveryEvent = require('../models/DeliveryEvent');
const NotificationService = require('../services/notificationService');
const LocationService = require('../services/locationService');

class OrderController {
  static async createOrder(req, res, next) {
    try {
      const {
        recipientName,
        recipientPhone,
        packageDescription,
        packageWeight = 1.0,
        priority = 'STANDARD',
        pickupAddressText,
        deliveryAddressText,
        pickupLatitude,
        pickupLongitude,
        deliveryLatitude,
        deliveryLongitude,
        pickupAddressId,
        deliveryAddressId
      } = req.body;

      const customerId = req.user.id;

      // Calculate initial estimated delivery time
      const distance = LocationService.calculateDistanceKm(
        pickupLatitude,
        pickupLongitude,
        deliveryLatitude,
        deliveryLongitude
      );
      const initialEtaMinutes = LocationService.calculateEtaMinutes(distance);
      const estimatedDeliveryTime = new Date(Date.now() + initialEtaMinutes * 60000).toISOString();

      // Create Order
      const order = await Order.create({
        customerId,
        pickupAddressId,
        deliveryAddressId,
        pickupAddressText,
        deliveryAddressText,
        pickupLatitude: parseFloat(pickupLatitude),
        pickupLongitude: parseFloat(pickupLongitude),
        deliveryLatitude: parseFloat(deliveryLatitude),
        deliveryLongitude: parseFloat(deliveryLongitude),
        recipientName,
        recipientPhone,
        packageDescription,
        packageWeight: parseFloat(packageWeight),
        priority,
        status: 'ORDER_PLACED',
        estimatedDeliveryTime
      });

      // Automatically create corresponding Delivery
      const delivery = await Delivery.create({
        orderId: order.id,
        deliveryStatus: 'ORDER_PLACED',
        estimatedArrival: estimatedDeliveryTime,
        notes: `Priority: ${priority}. Weight: ${packageWeight}kg.`
      });

      // Record Timeline Event
      await DeliveryEvent.create({
        deliveryId: delivery.id,
        eventType: 'ORDER_PLACED',
        description: `Order placed by ${req.user.full_name}. Destination: ${deliveryAddressText}`,
        createdByRole: req.user.role
      });

      // Notify customer
      await NotificationService.notify({
        userId: customerId,
        deliveryId: delivery.id,
        title: 'Order Placed Successfully',
        message: `Your order #${order.order_number} has been received and is being prepared for dispatch.`,
        type: 'SUCCESS'
      });

      return res.status(201).json({
        success: true,
        message: 'Order created successfully.',
        data: {
          order,
          delivery
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllOrders(req, res, next) {
    try {
      const { status, limit = 50 } = req.query;
      let filter = { limit: parseInt(limit, 10) || 50 };

      if (req.user.role === 'CUSTOMER') {
        filter.customerId = req.user.id;
      } else if (req.user.role === 'DRIVER') {
        const driver = await Driver.findByUserId(req.user.id);
        if (driver) {
          filter.driverId = driver.id;
        }
      }

      if (status) {
        filter.status = status;
      }

      const orders = await Order.getAll(filter);

      // Populate with delivery information
      const populated = await Promise.all(
        orders.map(async (order) => {
          const delivery = await Delivery.findByOrderId(order.id);
          let driver = null;
          if (delivery && delivery.driver_id) {
            driver = await Driver.findById(delivery.driver_id);
          }
          return {
            ...order,
            delivery,
            driver
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

  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
          errorCode: 'ORDER_NOT_FOUND'
        });
      }

      // Check authorization
      if (req.user.role === 'CUSTOMER' && order.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order.',
          errorCode: 'FORBIDDEN_ORDER_ACCESS'
        });
      }

      const delivery = await Delivery.findByOrderId(order.id);
      let driver = null;
      if (delivery && delivery.driver_id) {
        driver = await Driver.findById(delivery.driver_id);
      }

      return res.status(200).json({
        success: true,
        data: {
          ...order,
          delivery,
          driver
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
          errorCode: 'ORDER_NOT_FOUND'
        });
      }

      if (req.user.role === 'CUSTOMER' && order.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel your own orders.',
          errorCode: 'FORBIDDEN'
        });
      }

      if (['PICKED_UP', 'IN_TRANSIT', 'NEAR_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel an order that is already picked up or in transit.',
          errorCode: 'ORDER_ALREADY_DISPATCHED'
        });
      }

      const updatedOrder = await Order.update(order.id, { status: 'CANCELLED' });
      const delivery = await Delivery.findByOrderId(order.id);
      if (delivery) {
        await Delivery.update(delivery.id, {
          delivery_status: 'CANCELLED',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user.'
        });

        await DeliveryEvent.create({
          deliveryId: delivery.id,
          eventType: 'CANCELLED',
          description: reason ? `Order cancelled: ${reason}` : 'Order was cancelled by the customer.',
          createdByRole: req.user.role
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully.',
        data: updatedOrder
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
