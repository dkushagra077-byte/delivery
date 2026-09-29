const Notification = require('../models/Notification');

class NotificationController {
  static async getMyNotifications(req, res, next) {
    try {
      const notifications = await Notification.findByUserId(req.user.id);
      return res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await Notification.markAsRead(id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await Notification.markAllAsRead(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;
