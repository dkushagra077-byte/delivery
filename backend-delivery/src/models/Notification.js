const { db } = require('../config/database');

class Notification {
  static async create({ userId, deliveryId = null, title, message, type = 'INFO' }) {
    const { data, error } = await db
      .from('notifications')
      .insert({
        user_id: userId,
        delivery_id: deliveryId,
        title,
        message,
        type,
        is_read: false
      })
      .single();

    if (error) throw error;
    return data;
  }

  static async findByUserId(userId, { limit = 30 } = {}) {
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async markAsRead(id, userId) {
    const { data, error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async markAllAsRead(userId) {
    const { data, error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }
}

module.exports = Notification;
