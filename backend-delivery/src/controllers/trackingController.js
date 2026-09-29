const TrackingService = require('../services/trackingService');

class TrackingController {
  static async recordLocation(req, res, next) {
    try {
      const { deliveryId, latitude, longitude, speed, heading, accuracy } = req.body;

      const result = await TrackingService.recordDriverLocation({
        user: req.user,
        deliveryId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: speed !== undefined ? parseFloat(speed) : 0,
        heading: heading !== undefined ? parseFloat(heading) : 0,
        accuracy: accuracy !== undefined ? parseFloat(accuracy) : 5.0
      });

      return res.status(201).json({
        success: true,
        message: 'Location recorded successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async getLatestLocation(req, res, next) {
    try {
      const { deliveryId } = req.params;
      const data = await TrackingService.getLatestDeliveryTracking(deliveryId);

      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTrackingHistory(req, res, next) {
    try {
      const { deliveryId } = req.params;
      const history = await TrackingService.getTrackingHistory(deliveryId);

      return res.status(200).json({
        success: true,
        data: history
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TrackingController;
