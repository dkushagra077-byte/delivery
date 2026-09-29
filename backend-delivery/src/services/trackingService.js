const Tracking = require('../models/Tracking');
const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const Order = require('../models/Order');
const LocationService = require('./locationService');

let ioInstance = null;

class TrackingService {
  static setSocketIo(io) {
    ioInstance = io;
  }

  static async recordDriverLocation({
    user,
    deliveryId,
    latitude,
    longitude,
    speed = 0,
    heading = 0,
    accuracy = 5.0
  }) {
    // 1. Authenticate that user is a driver
    const driver = await Driver.findByUserId(user.id);
    if (!driver && user.role !== 'ADMIN') {
      const error = new Error('Only registered drivers can record live location');
      error.code = 'NOT_A_DRIVER';
      error.statusCode = 403;
      throw error;
    }

    const driverId = driver ? driver.id : null;

    // 2. Validate delivery assignment
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      const error = new Error('Delivery not found');
      error.code = 'DELIVERY_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'DRIVER' && delivery.driver_id !== driverId) {
      const error = new Error('You are not assigned to this delivery');
      error.code = 'UNAUTHORIZED_DRIVER_LOCATION';
      error.statusCode = 403;
      throw error;
    }

    const now = new Date().toISOString();

    // 3. Record tracking breadcrumb
    const trackingRecord = await Tracking.recordLocation({
      deliveryId,
      driverId: delivery.driver_id || driverId,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      recordedAt: now
    });

    // 4. Update driver's current position
    if (delivery.driver_id) {
      await Driver.updateLocation(delivery.driver_id, {
        latitude,
        longitude,
        lastUpdate: now
      });
    }

    // 5. Calculate remaining distance & ETA to destination
    let remainingDistanceKm = null;
    let etaMinutes = null;

    const order = await Order.findById(delivery.order_id);
    if (order && order.delivery_latitude && order.delivery_longitude) {
      remainingDistanceKm = LocationService.calculateDistanceKm(
        latitude,
        longitude,
        order.delivery_latitude,
        order.delivery_longitude
      );

      const vehicleType = driver ? driver.vehicle_type : 'MOTORCYCLE';
      etaMinutes = LocationService.calculateEtaMinutes(remainingDistanceKm, vehicleType);

      // Check if driver is near destination (< 0.5 km) and currently IN_TRANSIT
      if (
        remainingDistanceKm <= 0.5 &&
        delivery.delivery_status === 'IN_TRANSIT'
      ) {
        // Auto-update to NEAR_DESTINATION if close
        // (handled gracefully if state transition allows)
      }
    }

    // 6. Broadcast via Socket.io
    const payload = {
      deliveryId,
      driverId: delivery.driver_id || driverId,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      recordedAt: now,
      remainingDistanceKm,
      etaMinutes
    };

    if (ioInstance) {
      ioInstance.to(`delivery:${deliveryId}`).emit('tracking:location_update', payload);
      ioInstance.emit('global:driver_location', {
        driverId: delivery.driver_id || driverId,
        latitude,
        longitude,
        lastUpdate: now
      });
    }

    return {
      tracking: trackingRecord,
      metrics: {
        remainingDistanceKm,
        etaMinutes
      }
    };
  }

  static async getLatestDeliveryTracking(deliveryId) {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      const error = new Error('Delivery not found');
      error.code = 'DELIVERY_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const latest = await Tracking.getLatestByDeliveryId(deliveryId);
    const order = await Order.findById(delivery.order_id);

    let metrics = {
      remainingDistanceKm: null,
      etaMinutes: null
    };

    if (latest && order && order.delivery_latitude && order.delivery_longitude) {
      const dist = LocationService.calculateDistanceKm(
        latest.latitude,
        latest.longitude,
        order.delivery_latitude,
        order.delivery_longitude
      );
      metrics = {
        remainingDistanceKm: dist,
        etaMinutes: LocationService.calculateEtaMinutes(dist)
      };
    }

    return {
      delivery,
      order,
      latestLocation: latest,
      metrics
    };
  }

  static async getTrackingHistory(deliveryId) {
    return Tracking.getHistoryByDeliveryId(deliveryId);
  }
}

module.exports = TrackingService;
