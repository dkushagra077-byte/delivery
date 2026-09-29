const { db } = require('../config/database');

class DeliveryEvent {
  static async create({ deliveryId, eventType, description, createdByRole = 'SYSTEM' }) {
    const { data, error } = await db
      .from('delivery_events')
      .insert({
        delivery_id: deliveryId,
        event_type: eventType,
        description,
        created_by_role: createdByRole
      })
      .single();

    if (error) throw error;
    return data;
  }

  static async findByDeliveryId(deliveryId) {
    const { data, error } = await db
      .from('delivery_events')
      .select('*')
      .eq('delivery_id', deliveryId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

module.exports = DeliveryEvent;
