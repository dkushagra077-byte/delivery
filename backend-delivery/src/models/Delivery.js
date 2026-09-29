const { db } = require('../config/database');

class Delivery {
  static async findById(id) {
    const { data, error } = await db
      .from('deliveries')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async findByDeliveryNumber(deliveryNumber) {
    const { data, error } = await db
      .from('deliveries')
      .select('*')
      .eq('delivery_number', deliveryNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async findByOrderId(orderId) {
    const { data, error } = await db
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async create({
    orderId,
    driverId = null,
    deliveryNumber,
    deliveryStatus = 'ORDER_PLACED',
    notes = null,
    estimatedArrival = null
  }) {
    const num = deliveryNumber || `DLV-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await db
      .from('deliveries')
      .insert({
        delivery_number: num,
        order_id: orderId,
        driver_id: driverId,
        delivery_status: deliveryStatus,
        notes: notes,
        estimated_arrival: estimatedArrival,
        pickup_time: null,
        dispatched_time: null,
        delivered_time: null,
        proof_of_delivery: null,
        recipient_signature: null
      })
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const allowed = [
      'driver_id',
      'delivery_status',
      'pickup_time',
      'dispatched_time',
      'estimated_arrival',
      'delivered_time',
      'proof_of_delivery',
      'recipient_signature',
      'notes'
    ];
    const payload = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    const { data, error } = await db
      .from('deliveries')
      .update(payload)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll({ driverId, status, limit = 50 } = {}) {
    let query = db.from('deliveries').select('*');
    if (driverId) query = query.eq('driver_id', driverId);
    if (status) query = query.eq('delivery_status', status);
    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

module.exports = Delivery;
