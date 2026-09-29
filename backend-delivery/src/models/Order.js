const { db } = require('../config/database');

class Order {
  static async findById(id) {
    const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async findByOrderNumber(orderNumber) {
    const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async create(orderData) {
    const orderNumber = orderData.orderNumber || `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await db
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: orderData.customerId,
        pickup_address_id: orderData.pickupAddressId || null,
        delivery_address_id: orderData.deliveryAddressId || null,
        pickup_address_text: orderData.pickupAddressText,
        delivery_address_text: orderData.deliveryAddressText,
        pickup_latitude: orderData.pickupLatitude,
        pickup_longitude: orderData.pickupLongitude,
        delivery_latitude: orderData.deliveryLatitude,
        delivery_longitude: orderData.deliveryLongitude,
        recipient_name: orderData.recipientName,
        recipient_phone: orderData.recipientPhone,
        package_description: orderData.packageDescription,
        package_weight: orderData.packageWeight || 1.0,
        priority: orderData.priority || 'STANDARD',
        status: orderData.status || 'ORDER_PLACED',
        assigned_driver_id: orderData.assignedDriverId || null,
        estimated_delivery_time: orderData.estimatedDeliveryTime || null
      })
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const allowed = [
      'status',
      'assigned_driver_id',
      'estimated_delivery_time',
      'recipient_name',
      'recipient_phone',
      'package_description'
    ];
    const payload = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    const { data, error } = await db
      .from('orders')
      .update(payload)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll({ customerId, driverId, status, limit = 50 } = {}) {
    let query = db.from('orders').select('*');
    if (customerId) query = query.eq('customer_id', customerId);
    if (driverId) query = query.eq('assigned_driver_id', driverId);
    if (status) query = query.eq('status', status);
    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

module.exports = Order;
