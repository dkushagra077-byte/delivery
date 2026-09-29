const Notification = require('../models/Notification');

let ioInstance = null;

class NotificationService {
  static setSocketIo(io) {
    ioInstance = io;
  }

  static async notify({ userId, deliveryId = null, title, message, type = 'INFO' }) {
    try {
      const notification = await Notification.create({
        userId,
        deliveryId,
        title,
        message,
        type
      });

      // Broadcast via socket to user's personal room if connected
      if (ioInstance && userId) {
        ioInstance.to(`user:${userId}`).emit('notification', notification);
        // Also emit to delivery room if deliveryId is provided
        if (deliveryId) {
          ioInstance.to(`delivery:${deliveryId}`).emit('delivery:notification', notification);
        }
      }

      return notification;
    } catch (err) {
      console.error('Failed to create notification:', err.message);
      return null;
    }
  }
}

module.exports = NotificationService;
