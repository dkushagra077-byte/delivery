const { db, isLiveSupabase } = require('./config/database');
const AuthService = require('./services/authService');

async function runSeed() {
  console.log('🌱 Starting database seed script...');

  if (!isLiveSupabase) {
    console.log('ℹ️ Running on local high-fidelity database store. In-memory seed data is already initialized!');
    console.log('Seed users available:');
    console.log(' - Admin: admin@deliveryapp.com / Admin@123456');
    console.log(' - Driver: driver.john@deliveryapp.com / Driver@123456');
    console.log(' - Driver 2: driver.alex@deliveryapp.com / Driver@123456');
    console.log(' - Customer: customer.emily@deliveryapp.com / Customer@123456');
    console.log(' - Customer 2: customer.david@deliveryapp.com / Customer@123456');
    return;
  }

  try {
    const passwordHash = await AuthService.hashPassword('Admin@123456');
    const { data, error } = await db.from('users').upsert({
      email: 'admin@deliveryapp.com',
      full_name: 'Admin Supervisor',
      password_hash: passwordHash,
      role: 'ADMIN',
      is_active: true
    }, { onConflict: 'email' });

    if (error) {
      console.error('Seed error:', error.message);
    } else {
      console.log('✅ Admin user successfully verified/seeded in Supabase!');
    }
  } catch (err) {
    console.error('Seed execution error:', err.message);
  }
}

if (require.main === module) {
  runSeed().then(() => process.exit(0));
}

module.exports = runSeed;
