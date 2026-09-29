const { db } = require('../config/database');

class Driver {
  static async findById(id) {
    const { data, error } = await db
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async findByUserId(userId) {
    const { data, error } = await db
      .from('drivers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async create({ userId, vehicleType = 'MOTORCYCLE', vehicleNumber = '', licenseNumber = '' }) {
    const { data, error } = await db
      .from('drivers')
      .insert({
        user_id: userId,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        license_number: licenseNumber,
        availability_status: 'AVAILABLE',
        current_latitude: null,
        current_longitude: null,
        last_location_update: null,
        rating: 5.0,
        total_deliveries: 0
      })
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const allowed = [
      'vehicle_type',
      'vehicle_number',
      'license_number',
      'availability_status',
      'current_latitude',
      'current_longitude',
      'last_location_update',
      'rating',
      'total_deliveries'
    ];
    const payload = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    const { data, error } = await db
      .from('drivers')
      .update(payload)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateLocation(driverId, { latitude, longitude, lastUpdate = new Date().toISOString() }) {
    const { data, error } = await db
      .from('drivers')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        last_location_update: lastUpdate
      })
      .eq('id', driverId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll({ status, limit = 50 } = {}) {
    let query = db.from('drivers').select('*');
    if (status) {
      query = query.eq('availability_status', status);
    }
    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

module.exports = Driver;
