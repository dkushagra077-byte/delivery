const { db } = require('../config/database');

class User {
  static sanitize(user) {
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  static async findByEmail(email) {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data || null;
  }

  static async findById(id) {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data || null;
  }

  static async create({ fullName, email, phone, passwordHash, role = 'CUSTOMER', avatarUrl = null }) {
    const { data, error } = await db
      .from('users')
      .insert({
        full_name: fullName,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        password_hash: passwordHash,
        role: role.toUpperCase(),
        avatar_url: avatarUrl,
        is_active: true
      })
      .single();

    if (error) throw error;
    return this.sanitize(data);
  }

  static async update(id, updates) {
    const allowed = ['full_name', 'phone', 'avatar_url', 'is_active', 'password_hash'];
    const payload = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    const { data, error } = await db
      .from('users')
      .update(payload)
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.sanitize(data);
  }

  static async getAll({ role, isActive, limit = 50 } = {}) {
    let query = db.from('users').select('*');
    if (role) query = query.eq('role', role);
    if (isActive !== undefined) query = query.eq('is_active', isActive);
    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((u) => this.sanitize(u));
  }
}

module.exports = User;
