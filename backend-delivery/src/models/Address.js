const { db } = require('../config/database');

class Address {
  static async findById(id) {
    const { data, error } = await db
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async findByUserId(userId) {
    const { data, error } = await db
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async create({ userId, title = 'Address', addressLine, city, state, postalCode, latitude = null, longitude = null }) {
    const { data, error } = await db
      .from('addresses')
      .insert({
        user_id: userId,
        title,
        address_line: addressLine,
        city,
        state,
        postal_code: postalCode,
        latitude,
        longitude
      })
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = Address;
