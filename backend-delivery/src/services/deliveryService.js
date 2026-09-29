const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const DeliveryEvent = require('../models/DeliveryEvent');
const NotificationService = require('./notificationService');

let ioInstance = null;

const VALID_TRANSITIONS = {
  ORDER_PLACED: ['ORDER_CONFIRMED', 'CANCELLED'],
  ORDER_CONFIRMED: ['DRIVER_ASSIGNED', 'CANCELLED'],
  DRIVER_ASSIGNED: ['PICKUP_PENDING', 'CANCELLED'],
  PICKUP_PENDING: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['NEAR_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'],
  NEAR_DESTINATION: ['OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: []
};

class DeliveryService {
  static setSocketIo(io) {
    ioInstance = io;
  }

  static isValidTransition(currentStatus, nextStatus) {
    if (!currentStatus || !nextStatus) return false;
    const allowed = VALID_TRANSITIONS[currentStatus.toUpperCase()];
    return allowed ? allowed.includes(nextStatus.toUpperCase()) : false;
  }

  static async updateStatus({ deliveryId, nextStatus, user, notes = null, proofOfDelivery = null, signature = null }) {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      const error = new Error('Delivery not found');
      error.code = 'DELIVERY_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const order = await Order.findById(delivery.order_id);
    if (!order) {
      const error = new Error('Associated order not found');
      error.code = 'ORDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const currentStatus = delivery.delivery_status;
    const targetStatus = nextStatus.toUpperCase();

    // Validate transition
    if (!this.isValidTransition(currentStatus, targetStatus)) {
      const error = new Error(
        `Invalid status transition from ${currentStatus} to ${targetStatus}. Allowed next states: ${
          VALID_TRANSITIONS[currentStatus]?.join(', ') || 'None (Terminal state)'
        }`
      );
      error.code = 'INVALID_STATUS_TRANSITION';
      error.statusCode = 400;
      throw error;
    }

    // Role-based authorization on specific transitions
    if (user.role === 'CUSTOMER') {
      if (targetStatus !== 'CANCELLED') {
        const error = new Error('Customers can only cancel pending deliveries');
        error.code = 'FORBIDDEN_TRANSITION';
        error.statusCode = 403;
        throw error;
      }
      if (['PICKED_UP', 'IN_TRANSIT', 'NEAR_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(currentStatus)) {
        const error = new Error('Cannot cancel an order that has already been picked up or delivered');
        error.code = 'CANNOT_CANCEL_ACTIVE_DELIVERY';
        error.statusCode = 400;
        throw error;
      }
    }

    if (user.role === 'DRIVER') {
      const driver = await Driver.findByUserId(user.id);
      if (!driver || driver.id !== delivery.driver_id) {
        const error = new Error('You are not the assigned driver for this delivery');
        error.code = 'UNAUTHORIZED_DRIVER';
        error.statusCode = 403;
        throw error;
      }
    }

    // Prepare timestamp updates
    const updates = {
      delivery_status: targetStatus
    };
    if (notes) updates.notes = notes;
    if (proofOfDelivery) updates.proof_of_delivery = proofOfDelivery;
    if (signature) updates.recipient_signature = signature;

    const now = new Date().toISOString();
    if (targetStatus === 'PICKED_UP' && !delivery.pickup_time) {
      updates.pickup_time = now;
    }
    if (targetStatus === 'IN_TRANSIT' && !delivery.dispatched_time) {
      updates.dispatched_time = now;
    }
    if (targetStatus === 'DELIVERED' && !delivery.delivered_time) {
      updates.delivered_time = now;
    }

    // Update delivery in DB
    const updatedDelivery = await Delivery.update(deliveryId, updates);

    // Update associated order status
    await Order.update(order.id, { status: targetStatus });

    // If marked delivered, increment driver completed deliveries count
    if (targetStatus === 'DELIVERED' && delivery.driver_id) {
      const currentDriver = await Driver.findById(delivery.driver_id);
      if (currentDriver) {
        await Driver.update(delivery.driver_id, {
          total_deliveries: (currentDriver.total_deliveries || 0) + 1,
          availability_status: 'AVAILABLE'
        });
      }
    }

    // Create delivery event description
    const statusDescriptions = {
      ORDER_CONFIRMED: 'Order confirmed and routed for driver assignment.',
      DRIVER_ASSIGNED: 'Driver has been assigned to the order.',
      PICKUP_PENDING: 'Driver is en route to the pickup location.',
      PICKED_UP: 'Driver arrived and successfully picked up the package.',
      IN_TRANSIT: 'Package is in transit. Live GPS tracking active.',
      NEAR_DESTINATION: 'Driver is approaching your delivery destination.',
      OUT_FOR_DELIVERY: 'Package is out for delivery in your neighborhood.',
      DELIVERED: `Package delivered successfully. ${proofOfDelivery ? 'Proof: ' + proofOfDelivery : ''}`,
      CANCELLED: `Delivery was cancelled. ${notes ? 'Reason: ' + notes : ''}`,
      FAILED: `Delivery failed. ${notes ? 'Notes: ' + notes : ''}`
    };

    const description = statusDescriptions[targetStatus] || `Status updated to ${targetStatus}`;
    await DeliveryEvent.create({
      deliveryId,
      eventType: targetStatus,
      description,
      createdByRole: user.role
    });

    // Notify customer
    if (order.customer_id) {
      await NotificationService.notify({
        userId: order.customer_id,
        deliveryId,
        title: `Delivery Update: ${targetStatus.replace('_', ' ')}`,
        message: description,
        type: targetStatus === 'DELIVERED' ? 'SUCCESS' : targetStatus === 'CANCELLED' ? 'ALERT' : 'DELIVERY_UPDATE'
      });
    }

    // Broadcast realtime event
    if (ioInstance) {
      const eventPayload = {
        deliveryId,
        orderId: order.id,
        status: targetStatus,
        updatedAt: now,
        notes,
        proofOfDelivery
      };
      ioInstance.to(`delivery:${deliveryId}`).emit('delivery:status_update', eventPayload);
      ioInstance.emit('global:delivery_update', eventPayload);
    }

    return updatedDelivery;
  }
}

module.exports = DeliveryService;
