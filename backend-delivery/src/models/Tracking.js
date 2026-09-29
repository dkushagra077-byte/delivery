const { db } = require('../config/database');

class Tracking {
  static async recordLocation({
    deliveryId,
    driverId,
    latitude,
    longitude,
    speed = 0,
    heading = 0,
    accuracy = 5.0,
    recordedAt = new Date().toISOString()
  }) {
    const { data, error } = await db
      .from('tracking_locations')
      .insert({
        delivery_id: deliveryId,
        driver_id: driverId,
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        recorded_at: recordedAt
      })
      .single();

    if (error) throw error;
    return data;
  }

  static async getLatestByDeliveryId(deliveryId) {
    const { data, error } = await db
      .from('tracking_locations')
      .select('*')
      .eq('delivery_id', deliveryId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async getHistoryByDeliveryId(deliveryId, limit = 100) {
    const { data, error } = await db
      .from('tracking_locations')
      .select('*')
      .eq('delivery_id', deliveryId)
      .order('recorded_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

module.exports = Tracking;
