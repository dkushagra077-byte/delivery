const { createClient } = require('@supabase/supabase-js');
const config = require('./env');
const bcrypt = require('bcryptjs');

let supabaseClient = null;
let isLiveSupabase = false;

// Check if credentials look like real Supabase URLs and keys
const hasValidSupabaseCredentials = () => {
  const url = config.supabase.url;
  const key = config.supabase.serviceRoleKey;
  return Boolean(
    url &&
    url.startsWith('https://') &&
    !url.includes('sample-project') &&
    !url.includes('your-project') &&
    key &&
    !key.includes('sample_') &&
    !key.includes('your_')
  );
};

if (hasValidSupabaseCredentials()) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    isLiveSupabase = true;
    console.log('✅ Connected to live Supabase project:', config.supabase.url);
  } catch (err) {
    console.warn('⚠️ Failed to initialize live Supabase client, falling back to local database adapter:', err.message);
  }
}

// In-Memory Database Store for robust local execution and testing
class LocalDatabaseStore {
  constructor() {
    this.tables = {
      users: [],
      drivers: [],
      addresses: [],
      orders: [],
      deliveries: [],
      tracking_locations: [],
      notifications: [],
      delivery_events: []
    };
    this.seedInitialData();
  }

  seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Password@123', salt);
    const adminPasswordHash = bcrypt.hashSync('Admin@123456', salt);
    const driverPasswordHash = bcrypt.hashSync('Driver@123456', salt);
    const customerPasswordHash = bcrypt.hashSync('Customer@123456', salt);

    // Initial Users
    this.tables.users = [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        full_name: 'Admin Supervisor',
        email: 'admin@deliveryapp.com',
        phone: '+1-555-0100',
        password_hash: adminPasswordHash,
        role: 'ADMIN',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        full_name: 'John Martinez (Driver)',
        email: 'driver.john@deliveryapp.com',
        phone: '+1-555-0101',
        password_hash: driverPasswordHash,
        role: 'DRIVER',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        full_name: 'Alex Vance (Driver)',
        email: 'driver.alex@deliveryapp.com',
        phone: '+1-555-0102',
        password_hash: driverPasswordHash,
        role: 'DRIVER',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        full_name: 'Emily Watson',
        email: 'customer.emily@deliveryapp.com',
        phone: '+1-555-0103',
        password_hash: customerPasswordHash,
        role: 'CUSTOMER',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'a0000000-0000-0000-0000-000000000005',
        full_name: 'David Kim',
        email: 'customer.david@deliveryapp.com',
        phone: '+1-555-0104',
        password_hash: customerPasswordHash,
        role: 'CUSTOMER',
        avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Drivers
    this.tables.drivers = [
      {
        id: 'd0000000-0000-0000-0000-000000000001',
        user_id: 'a0000000-0000-0000-0000-000000000002',
        vehicle_type: 'MOTORCYCLE',
        vehicle_number: 'SF-MOTO-882',
        license_number: 'DL-CA-928172',
        availability_status: 'AVAILABLE',
        current_latitude: 37.7865,
        current_longitude: -122.4039,
        last_location_update: new Date().toISOString(),
        rating: 4.95,
        total_deliveries: 142,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'd0000000-0000-0000-0000-000000000002',
        user_id: 'a0000000-0000-0000-0000-000000000003',
        vehicle_type: 'VAN',
        vehicle_number: 'SF-VAN-419',
        license_number: 'DL-CA-449102',
        availability_status: 'BUSY',
        current_latitude: 37.7650,
        current_longitude: -122.4215,
        last_location_update: new Date().toISOString(),
        rating: 4.88,
        total_deliveries: 89,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Addresses
    this.tables.addresses = [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        user_id: 'a0000000-0000-0000-0000-000000000004',
        title: 'Home (Emily)',
        address_line: '742 Market Street, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94102',
        latitude: 37.7880,
        longitude: -122.4045,
        created_at: new Date().toISOString()
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        user_id: 'a0000000-0000-0000-0000-000000000004',
        title: 'Office (Emily)',
        address_line: '1 Ferry Building, The Embarcadero',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94111',
        latitude: 37.7955,
        longitude: -122.3937,
        created_at: new Date().toISOString()
      },
      {
        id: 'b0000000-0000-0000-0000-000000000003',
        user_id: 'a0000000-0000-0000-0000-000000000005',
        title: 'Home (David)',
        address_line: '1050 Valencia Street',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94110',
        latitude: 37.7562,
        longitude: -122.4211,
        created_at: new Date().toISOString()
      },
      {
        id: 'b0000000-0000-0000-0000-000000000004',
        user_id: 'a0000000-0000-0000-0000-000000000001',
        title: 'Central Depot',
        address_line: '500 4th Street',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94107',
        latitude: 37.7801,
        longitude: -122.3995,
        created_at: new Date().toISOString()
      }
    ];

    // Orders
    this.tables.orders = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        order_number: 'ORD-2026-9041',
        customer_id: 'a0000000-0000-0000-0000-000000000004',
        pickup_address_id: 'b0000000-0000-0000-0000-000000000004',
        delivery_address_id: 'b0000000-0000-0000-0000-000000000001',
        pickup_address_text: 'Logistics Central Depot, 500 4th St, San Francisco, CA',
        delivery_address_text: '742 Market Street, Suite 400, San Francisco, CA',
        pickup_latitude: 37.7801,
        pickup_longitude: -122.3995,
        delivery_latitude: 37.7880,
        delivery_longitude: -122.4045,
        recipient_name: 'Emily Watson',
        recipient_phone: '+1-555-0103',
        package_description: 'Precision Medical Supplies & Temperature Sensor Kit',
        package_weight: 2.50,
        priority: 'EXPRESS',
        status: 'IN_TRANSIT',
        assigned_driver_id: 'd0000000-0000-0000-0000-000000000001',
        estimated_delivery_time: new Date(Date.now() + 18 * 60000).toISOString(),
        created_at: new Date(Date.now() - 40 * 60000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        order_number: 'ORD-2026-9042',
        customer_id: 'a0000000-0000-0000-0000-000000000005',
        pickup_address_id: 'b0000000-0000-0000-0000-000000000002',
        delivery_address_id: 'b0000000-0000-0000-0000-000000000003',
        pickup_address_text: '1 Ferry Building, The Embarcadero, San Francisco, CA',
        delivery_address_text: '1050 Valencia Street, San Francisco, CA',
        pickup_latitude: 37.7955,
        pickup_longitude: -122.3937,
        delivery_latitude: 37.7562,
        delivery_longitude: -122.4211,
        recipient_name: 'David Kim',
        recipient_phone: '+1-555-0104',
        package_description: 'Architecture Blueprint & Confidential Prototype Documents',
        package_weight: 1.20,
        priority: 'STANDARD',
        status: 'PICKUP_PENDING',
        assigned_driver_id: 'd0000000-0000-0000-0000-000000000002',
        estimated_delivery_time: new Date(Date.now() + 45 * 60000).toISOString(),
        created_at: new Date(Date.now() - 25 * 60000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        order_number: 'ORD-2026-9040',
        customer_id: 'a0000000-0000-0000-0000-000000000004',
        pickup_address_id: 'b0000000-0000-0000-0000-000000000004',
        delivery_address_id: 'b0000000-0000-0000-0000-000000000002',
        pickup_address_text: 'Logistics Central Depot, 500 4th St, San Francisco, CA',
        delivery_address_text: '1 Ferry Building, The Embarcadero, San Francisco, CA',
        pickup_latitude: 37.7801,
        pickup_longitude: -122.3995,
        delivery_latitude: 37.7955,
        delivery_longitude: -122.3937,
        recipient_name: 'Emily Watson (Office Desk)',
        recipient_phone: '+1-555-0103',
        package_description: 'Corporate Hardware Token & Laptops',
        package_weight: 4.80,
        priority: 'URGENT',
        status: 'DELIVERED',
        assigned_driver_id: 'd0000000-0000-0000-0000-000000000001',
        estimated_delivery_time: new Date(Date.now() - 120 * 60000).toISOString(),
        created_at: new Date(Date.now() - 180 * 60000).toISOString(),
        updated_at: new Date(Date.now() - 120 * 60000).toISOString()
      }
    ];

    // Deliveries
    this.tables.deliveries = [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        delivery_number: 'DLV-1024',
        order_id: 'c0000000-0000-0000-0000-000000000001',
        driver_id: 'd0000000-0000-0000-0000-000000000001',
        pickup_time: new Date(Date.now() - 15 * 60000).toISOString(),
        dispatched_time: new Date(Date.now() - 10 * 60000).toISOString(),
        estimated_arrival: new Date(Date.now() + 18 * 60000).toISOString(),
        delivered_time: null,
        delivery_status: 'IN_TRANSIT',
        proof_of_delivery: null,
        recipient_signature: null,
        notes: 'Fragile medical packaging. Handle with care.',
        created_at: new Date(Date.now() - 35 * 60000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        delivery_number: 'DLV-1025',
        order_id: 'c0000000-0000-0000-0000-000000000002',
        driver_id: 'd0000000-0000-0000-0000-000000000002',
        pickup_time: null,
        dispatched_time: null,
        estimated_arrival: new Date(Date.now() + 45 * 60000).toISOString(),
        delivered_time: null,
        delivery_status: 'PICKUP_PENDING',
        proof_of_delivery: null,
        recipient_signature: null,
        notes: 'Ring buzzer #4B upon arrival.',
        created_at: new Date(Date.now() - 20 * 60000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'e0000000-0000-0000-0000-000000000003',
        delivery_number: 'DLV-1020',
        order_id: 'c0000000-0000-0000-0000-000000000003',
        driver_id: 'd0000000-0000-0000-0000-000000000001',
        pickup_time: new Date(Date.now() - 180 * 60000).toISOString(),
        dispatched_time: new Date(Date.now() - 160 * 60000).toISOString(),
        estimated_arrival: new Date(Date.now() - 130 * 60000).toISOString(),
        delivered_time: new Date(Date.now() - 120 * 60000).toISOString(),
        delivery_status: 'DELIVERED',
        proof_of_delivery: 'Signed by Reception Security - Marcus Green',
        recipient_signature: 'Marcus Green',
        notes: 'Delivered safely to 1 Ferry Building front desk.',
        created_at: new Date(Date.now() - 200 * 60000).toISOString(),
        updated_at: new Date(Date.now() - 120 * 60000).toISOString()
      }
    ];

    // Tracking Locations
    this.tables.tracking_locations = [
      {
        id: 'f0000000-0000-0000-0000-000000000001',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        driver_id: 'd0000000-0000-0000-0000-000000000001',
        latitude: 37.7801,
        longitude: -122.3995,
        speed: 0.0,
        heading: 0.0,
        accuracy: 5.0,
        recorded_at: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: 'f0000000-0000-0000-0000-000000000002',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        driver_id: 'd0000000-0000-0000-0000-000000000001',
        latitude: 37.7820,
        longitude: -122.4010,
        speed: 24.5,
        heading: 330.0,
        accuracy: 4.0,
        recorded_at: new Date(Date.now() - 10 * 60000).toISOString()
      },
      {
        id: 'f0000000-0000-0000-0000-000000000003',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        driver_id: 'd0000000-0000-0000-0000-000000000001',
        latitude: 37.7845,
        longitude: -122.4028,
        speed: 28.0,
        heading: 340.0,
        accuracy: 3.5,
        recorded_at: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: 'f0000000-0000-0000-0000-000000000004',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        driver_id: 'd0000000-0000-0000-0000-000000000001',
        latitude: 37.7865,
        longitude: -122.4039,
        speed: 22.0,
        heading: 350.0,
        accuracy: 3.2,
        recorded_at: new Date().toISOString()
      }
    ];

    // Notifications
    this.tables.notifications = [
      {
        id: 'n0000000-0000-0000-0000-000000000001',
        user_id: 'a0000000-0000-0000-0000-000000000004',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Driver Assigned',
        message: 'Driver John Martinez has been assigned to your delivery #DLV-1024.',
        type: 'DELIVERY_UPDATE',
        is_read: true,
        created_at: new Date(Date.now() - 25 * 60000).toISOString()
      },
      {
        id: 'n0000000-0000-0000-0000-000000000002',
        user_id: 'a0000000-0000-0000-0000-000000000004',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Package Picked Up',
        message: 'Your package has been picked up by the courier and is in transit.',
        type: 'SUCCESS',
        is_read: false,
        created_at: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: 'n0000000-0000-0000-0000-000000000003',
        user_id: 'a0000000-0000-0000-0000-000000000002',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        title: 'New Delivery Assigned',
        message: 'You have been assigned Delivery #DLV-1024 to Market St.',
        type: 'INFO',
        is_read: true,
        created_at: new Date(Date.now() - 25 * 60000).toISOString()
      }
    ];

    // Delivery Events
    this.tables.delivery_events = [
      {
        id: 'v0000000-0000-0000-0000-000000000001',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        event_type: 'ORDER_PLACED',
        description: 'Order was placed by customer Emily Watson.',
        created_by_role: 'CUSTOMER',
        created_at: new Date(Date.now() - 40 * 60000).toISOString()
      },
      {
        id: 'v0000000-0000-0000-0000-000000000002',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        event_type: 'ORDER_CONFIRMED',
        description: 'Order confirmed by logistics dispatch system.',
        created_by_role: 'SYSTEM',
        created_at: new Date(Date.now() - 35 * 60000).toISOString()
      },
      {
        id: 'v0000000-0000-0000-0000-000000000003',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        event_type: 'DRIVER_ASSIGNED',
        description: 'Assigned to courier John Martinez (Motorcycle SF-MOTO-882).',
        created_by_role: 'ADMIN',
        created_at: new Date(Date.now() - 25 * 60000).toISOString()
      },
      {
        id: 'v0000000-0000-0000-0000-000000000004',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        event_type: 'PICKED_UP',
        description: 'Courier John Martinez arrived at depot and picked up the package.',
        created_by_role: 'DRIVER',
        created_at: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: 'v0000000-0000-0000-0000-000000000005',
        delivery_id: 'e0000000-0000-0000-0000-000000000001',
        event_type: 'IN_TRANSIT',
        description: 'Package is in transit. Live GPS tracking active.',
        created_by_role: 'DRIVER',
        created_at: new Date(Date.now() - 10 * 60000).toISOString()
      }
    ];
  }

  // Builder method mimicking Supabase query chain
  from(tableName) {
    if (!this.tables[tableName]) {
      this.tables[tableName] = [];
    }
    const store = this;
    const tableData = this.tables[tableName];

    return new QueryBuilder(tableData, tableName, store);
  }
}

class QueryBuilder {
  constructor(tableData, tableName, store) {
    this.tableData = tableData;
    this.tableName = tableName;
    this.store = store;
    this.filters = [];
    this.orderConfig = null;
    this.limitCount = null;
    this.isSingle = false;
    this.selectColumns = '*';
    this.action = 'SELECT';
    this.payload = null;
  }

  select(columns = '*') {
    this.action = 'SELECT';
    this.selectColumns = columns;
    return this;
  }

  insert(data) {
    this.action = 'INSERT';
    this.payload = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data) {
    this.action = 'UPDATE';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'DELETE';
    return this;
  }

  eq(column, value) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  neq(column, value) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  in(column, values) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderConfig = { column, ascending };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async execute() {
    let resultData = null;
    let error = null;

    try {
      if (this.action === 'INSERT') {
        const created = [];
        for (const item of this.payload) {
          const newRow = {
            id: item.id || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString()
          };
          this.tableData.push(newRow);
          created.push(newRow);
        }
        resultData = this.isSingle ? created[0] : created;
        return { data: resultData, error: null };
      }

      if (this.action === 'UPDATE') {
        const updated = [];
        for (let i = 0; i < this.tableData.length; i++) {
          const row = this.tableData[i];
          const matches = this.filters.every((fn) => fn(row));
          if (matches) {
            this.tableData[i] = {
              ...row,
              ...this.payload,
              updated_at: new Date().toISOString()
            };
            updated.push(this.tableData[i]);
          }
        }
        resultData = this.isSingle ? (updated[0] || null) : updated;
        return { data: resultData, error: null };
      }

      if (this.action === 'DELETE') {
        const toDeleteIndices = [];
        for (let i = 0; i < this.tableData.length; i++) {
          const row = this.tableData[i];
          if (this.filters.every((fn) => fn(row))) {
            toDeleteIndices.push(i);
          }
        }
        for (let i = toDeleteIndices.length - 1; i >= 0; i--) {
          this.tableData.splice(toDeleteIndices[i], 1);
        }
        return { data: null, error: null };
      }

      // SELECT
      let rows = [...this.tableData];

      // Apply filters
      for (const filterFn of this.filters) {
        rows = rows.filter(filterFn);
      }

      // Apply ordering
      if (this.orderConfig) {
        const { column, ascending } = this.orderConfig;
        rows.sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
      }

      // Apply limit
      if (this.limitCount !== null) {
        rows = rows.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        resultData = rows.length > 0 ? { ...rows[0] } : null;
      } else {
        resultData = rows.map((r) => ({ ...r }));
      }
    } catch (err) {
      error = err;
    }

    return { data: resultData, error };
  }

  // Allow awaiting query builder directly
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

const localDatabase = new LocalDatabaseStore();

module.exports = {
  supabase: supabaseClient || localDatabase,
  isLiveSupabase,
  localDatabase
};
