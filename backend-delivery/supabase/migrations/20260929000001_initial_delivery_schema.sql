-- ==============================================================================
-- DELIVERY TRACKING APPLICATION SCHEMA & POLICIES
-- PostgreSQL / Supabase Migration
-- File: 20260929000001_initial_delivery_schema.sql
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if restarting (order matters due to foreign keys)
DROP TABLE IF EXISTS delivery_events CASCADE;
DROP TABLE IF EXISTS tracking_locations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- 3. CREATE TABLES
-- ==============================================================================

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CUSTOMER', 'DRIVER', 'ADMIN')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- DRIVERS TABLE
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN', 'TRUCK')),
    vehicle_number VARCHAR(100),
    license_number VARCHAR(100),
    availability_status VARCHAR(50) DEFAULT 'OFFLINE' CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'OFFLINE')),
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    last_location_update TIMESTAMPTZ,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    total_deliveries INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ADDRESSES TABLE
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) DEFAULT 'Address',
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    delivery_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    pickup_address_text TEXT,
    delivery_address_text TEXT,
    pickup_latitude DOUBLE PRECISION,
    pickup_longitude DOUBLE PRECISION,
    delivery_latitude DOUBLE PRECISION,
    delivery_longitude DOUBLE PRECISION,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    package_description TEXT NOT NULL,
    package_weight NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
    priority VARCHAR(50) DEFAULT 'STANDARD' CHECK (priority IN ('STANDARD', 'EXPRESS', 'URGENT')),
    status VARCHAR(50) DEFAULT 'ORDER_PLACED' CHECK (status IN (
        'ORDER_PLACED',
        'ORDER_CONFIRMED',
        'DRIVER_ASSIGNED',
        'PICKUP_PENDING',
        'PICKED_UP',
        'IN_TRANSIT',
        'NEAR_DESTINATION',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'FAILED'
    )),
    assigned_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    estimated_delivery_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- DELIVERIES TABLE
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_number VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    pickup_time TIMESTAMPTZ,
    dispatched_time TIMESTAMPTZ,
    estimated_arrival TIMESTAMPTZ,
    delivered_time TIMESTAMPTZ,
    delivery_status VARCHAR(50) DEFAULT 'ORDER_PLACED' CHECK (delivery_status IN (
        'ORDER_PLACED',
        'ORDER_CONFIRMED',
        'DRIVER_ASSIGNED',
        'PICKUP_PENDING',
        'PICKED_UP',
        'IN_TRANSIT',
        'NEAR_DESTINATION',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'FAILED'
    )),
    proof_of_delivery TEXT,
    recipient_signature TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TRACKING_LOCATIONS TABLE
CREATE TABLE tracking_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ALERT', 'DELIVERY_UPDATE')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- DELIVERY_EVENTS TABLE
CREATE TABLE delivery_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_by_role VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_availability ON drivers(availability_status);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_assigned_driver_id ON orders(assigned_driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(delivery_status);
CREATE INDEX idx_tracking_delivery_id ON tracking_locations(delivery_id, recorded_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_delivery_events_delivery_id ON delivery_events(delivery_id, created_at ASC);

-- ==============================================================================
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_modtime
BEFORE UPDATE ON drivers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_modtime
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_modtime
BEFORE UPDATE ON deliveries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_events ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 7. RLS POLICIES
-- ==============================================================================

-- Helper functions for JWT claims (or custom session context)
-- If using Supabase Auth JWT auth.uid() can be mapped or service role bypasses.
-- We also support standard authenticated service role and custom policy checks:

-- USERS POLICIES
-- 1. Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id OR current_setting('request.jwt.claims', true)::json->>'role' = 'ADMIN');

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- DRIVERS POLICIES
-- 1. Public or authenticated users can read driver basics (e.g. for active order details)
CREATE POLICY "Users can view driver profiles"
ON drivers FOR SELECT
USING (true);

-- 2. Drivers can update their own driver record
CREATE POLICY "Drivers can update own record"
ON drivers FOR UPDATE
USING (auth.uid() = user_id);

-- ADDRESSES POLICIES
-- 1. Users can read and write their own addresses
CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
USING (auth.uid() = user_id);

-- ORDERS POLICIES
-- 1. Customers can view their own orders
CREATE POLICY "Customers can view own orders"
ON orders FOR SELECT
USING (
    auth.uid() = customer_id 
    OR EXISTS (SELECT 1 FROM drivers WHERE drivers.id = orders.assigned_driver_id AND drivers.user_id = auth.uid())
);

-- 2. Customers can create orders
CREATE POLICY "Customers can insert orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- 3. Customers and assigned drivers can update orders
CREATE POLICY "Authorized users can update orders"
ON orders FOR UPDATE
USING (
    auth.uid() = customer_id 
    OR EXISTS (SELECT 1 FROM drivers WHERE drivers.id = orders.assigned_driver_id AND drivers.user_id = auth.uid())
);

-- DELIVERIES POLICIES
-- 1. Customer of the order or assigned driver can view delivery
CREATE POLICY "Parties can view delivery"
ON deliveries FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = deliveries.order_id 
        AND orders.customer_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM drivers 
        WHERE drivers.id = deliveries.driver_id 
        AND drivers.user_id = auth.uid()
    )
);

-- 2. Assigned driver can update delivery status
CREATE POLICY "Assigned driver can update delivery"
ON deliveries FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM drivers 
        WHERE drivers.id = deliveries.driver_id 
        AND drivers.user_id = auth.uid()
    )
);

-- TRACKING_LOCATIONS POLICIES
-- 1. Customers can read tracking for their delivery; assigned driver can read
CREATE POLICY "View delivery tracking"
ON tracking_locations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM deliveries d
        JOIN orders o ON d.order_id = o.id
        WHERE d.id = tracking_locations.delivery_id
        AND (o.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM drivers dr WHERE dr.id = d.driver_id AND dr.user_id = auth.uid()))
    )
);

-- 2. Assigned driver can insert tracking coords
CREATE POLICY "Driver can insert tracking location"
ON tracking_locations FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM drivers 
        WHERE drivers.id = tracking_locations.driver_id 
        AND drivers.user_id = auth.uid()
    )
);

-- NOTIFICATIONS POLICIES
-- 1. Users can view and update their own notifications
CREATE POLICY "Users can manage own notifications"
ON notifications FOR ALL
USING (auth.uid() = user_id);

-- DELIVERY_EVENTS POLICIES
-- 1. Order customer and assigned driver can view events
CREATE POLICY "View delivery events"
ON delivery_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM deliveries d
        JOIN orders o ON d.order_id = o.id
        WHERE d.id = delivery_events.delivery_id
        AND (o.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM drivers dr WHERE dr.id = d.driver_id AND dr.user_id = auth.uid()))
    )
);

-- ==============================================================================
-- 8. SUPABASE REALTIME PUBLICATION
-- ==============================================================================
-- Ensure the supabase_realtime publication exists and publish real-time changes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE deliveries, tracking_locations, notifications, orders, drivers;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
