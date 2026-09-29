-- ==============================================================================
-- DELIVERY TRACKING APPLICATION SEED DATA
-- PostgreSQL / Supabase Seed Script
-- File: seed.sql
-- ==============================================================================

-- 1. Insert Initial Users
-- Passwords:
-- Admin: Admin@123456 -> $2a$10$wT282n0B2G3495dO1qB.eOQ2gV/R9d9eK.L5.mK3o3.eZ7W9d7W2K
-- Drivers: Driver@123456 -> $2a$10$wT282n0B2G3495dO1qB.eOQ2gV/R9d9eK.L5.mK3o3.eZ7W9d7W2K
-- Customers: Customer@123456 -> $2a$10$wT282n0B2G3495dO1qB.eOQ2gV/R9d9eK.L5.mK3o3.eZ7W9d7W2K

INSERT INTO users (id, full_name, email, phone, password_hash, role, avatar_url, is_active)
VALUES
('a0000000-0000-0000-0000-000000000001', 'Admin Supervisor', 'admin@deliveryapp.com', '+1-555-0100', '$2a$10$X7lHwz2HqjK9V5gU2Vf.t.3yX6Z3mD5P9L3K8O2m7h4n6L4K9O3m2', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true),
('a0000000-0000-0000-0000-000000000002', 'John Martinez (Driver)', 'driver.john@deliveryapp.com', '+1-555-0101', '$2a$10$X7lHwz2HqjK9V5gU2Vf.t.3yX6Z3mD5P9L3K8O2m7h4n6L4K9O3m2', 'DRIVER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),
('a0000000-0000-0000-0000-000000000003', 'Alex Vance (Driver)', 'driver.alex@deliveryapp.com', '+1-555-0102', '$2a$10$X7lHwz2HqjK9V5gU2Vf.t.3yX6Z3mD5P9L3K8O2m7h4n6L4K9O3m2', 'DRIVER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', true),
('a0000000-0000-0000-0000-000000000004', 'Emily Watson', 'customer.emily@deliveryapp.com', '+1-555-0103', '$2a$10$X7lHwz2HqjK9V5gU2Vf.t.3yX6Z3mD5P9L3K8O2m7h4n6L4K9O3m2', 'CUSTOMER', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', true),
('a0000000-0000-0000-0000-000000000005', 'David Kim', 'customer.david@deliveryapp.com', '+1-555-0104', '$2a$10$X7lHwz2HqjK9V5gU2Vf.t.3yX6Z3mD5P9L3K8O2m7h4n6L4K9O3m2', 'CUSTOMER', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', true)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Driver Details
INSERT INTO drivers (id, user_id, vehicle_type, vehicle_number, license_number, availability_status, current_latitude, current_longitude, last_location_update, rating, total_deliveries)
VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'MOTORCYCLE', 'SF-MOTO-882', 'DL-CA-928172', 'AVAILABLE', 37.7794, -122.4180, now(), 4.95, 142),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'VAN', 'SF-VAN-419', 'DL-CA-449102', 'BUSY', 37.7650, -122.4215, now(), 4.88, 89)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Addresses
INSERT INTO addresses (id, user_id, title, address_line, city, state, postal_code, latitude, longitude)
VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Home (Emily)', '742 Market Street, Suite 400', 'San Francisco', 'CA', '94102', 37.7880, -122.4045),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Office (Emily)', '1 Ferry Building, The Embarcadero', 'San Francisco', 'CA', '94111', 37.7955, -122.3937),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'Home (David)', '1050 Valencia Street', 'San Francisco', 'CA', '94110', 37.7562, -122.4211),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Logistics Central Depot', '500 4th Street', 'San Francisco', 'CA', '94107', 37.7801, -122.3995)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Orders
INSERT INTO orders (
    id, order_number, customer_id, pickup_address_id, delivery_address_id,
    pickup_address_text, delivery_address_text,
    pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude,
    recipient_name, recipient_phone, package_description, package_weight, priority, status, assigned_driver_id, estimated_delivery_time
)
VALUES
(
    'c0000000-0000-0000-0000-000000000001', 'ORD-2026-9041', 'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001',
    'Logistics Central Depot, 500 4th St, San Francisco, CA', '742 Market Street, Suite 400, San Francisco, CA',
    37.7801, -122.3995, 37.7880, -122.4045,
    'Emily Watson', '+1-555-0103', 'Precision Medical Supplies & Temperature Sensor Kit', 2.50, 'EXPRESS', 'IN_TRANSIT',
    'd0000000-0000-0000-0000-000000000001', now() + interval '18 minutes'
),
(
    'c0000000-0000-0000-0000-000000000002', 'ORD-2026-9042', 'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003',
    '1 Ferry Building, The Embarcadero, San Francisco, CA', '1050 Valencia Street, San Francisco, CA',
    37.7955, -122.3937, 37.7562, -122.4211,
    'David Kim', '+1-555-0104', 'Architecture Blueprint & Confidential Prototype Documents', 1.20, 'STANDARD', 'PICKUP_PENDING',
    'd0000000-0000-0000-0000-000000000002', now() + interval '45 minutes'
),
(
    'c0000000-0000-0000-0000-000000000003', 'ORD-2026-9040', 'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002',
    'Logistics Central Depot, 500 4th St, San Francisco, CA', '1 Ferry Building, The Embarcadero, San Francisco, CA',
    37.7801, -122.3995, 37.7955, -122.3937,
    'Emily Watson (Office Desk)', '+1-555-0103', 'Corporate Hardware Token & Laptops', 4.80, 'URGENT', 'DELIVERED',
    'd0000000-0000-0000-0000-000000000001', now() - interval '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Deliveries
INSERT INTO deliveries (
    id, delivery_number, order_id, driver_id, pickup_time, dispatched_time, estimated_arrival, delivered_time, delivery_status, proof_of_delivery, notes
)
VALUES
(
    'e0000000-0000-0000-0000-000000000001', 'DLV-1024',
    'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
    now() - interval '15 minutes', now() - interval '10 minutes', now() + interval '18 minutes', NULL,
    'IN_TRANSIT', NULL, 'Fragile packaging. Handle with care.'
),
(
    'e0000000-0000-0000-0000-000000000002', 'DLV-1025',
    'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002',
    NULL, NULL, now() + interval '45 minutes', NULL,
    'PICKUP_PENDING', NULL, 'Ring buzzer #4B upon arrival.'
),
(
    'e0000000-0000-0000-0000-000000000003', 'DLV-1020',
    'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001',
    now() - interval '3 hours', now() - interval '2 hours 45 minutes', now() - interval '2 hours 10 minutes', now() - interval '2 hours',
    'DELIVERED', 'Signed by Reception Desk Security - Marcus Green', 'Delivered safely.'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Delivery Events (Timeline)
INSERT INTO delivery_events (delivery_id, event_type, description, created_by_role, created_at)
VALUES
('e0000000-0000-0000-0000-000000000001', 'ORDER_PLACED', 'Order was placed by customer Emily Watson.', 'CUSTOMER', now() - interval '40 minutes'),
('e0000000-0000-0000-0000-000000000001', 'ORDER_CONFIRMED', 'Order confirmed by logistics automated routing.', 'SYSTEM', now() - interval '35 minutes'),
('e0000000-0000-0000-0000-000000000001', 'DRIVER_ASSIGNED', 'Assigned to courier John Martinez (Motorcycle SF-MOTO-882).', 'ADMIN', now() - interval '25 minutes'),
('e0000000-0000-0000-0000-000000000001', 'PICKED_UP', 'Courier John Martinez arrived at depot and picked up the package.', 'DRIVER', now() - interval '15 minutes'),
('e0000000-0000-0000-0000-000000000001', 'IN_TRANSIT', 'Package is in transit. Live GPS tracking active.', 'DRIVER', now() - interval '10 minutes');

-- 7. Insert Initial Tracking Locations for Active Delivery
INSERT INTO tracking_locations (delivery_id, driver_id, latitude, longitude, speed, heading, accuracy, recorded_at)
VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 37.7801, -122.3995, 0.0, 0.0, 5.0, now() - interval '15 minutes'),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 37.7820, -122.4010, 24.5, 330.0, 4.0, now() - interval '10 minutes'),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 37.7845, -122.4028, 28.0, 340.0, 3.5, now() - interval '5 minutes'),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 37.7865, -122.4039, 22.0, 350.0, 3.2, now());

-- 8. Insert Sample Notifications
INSERT INTO notifications (user_id, delivery_id, title, message, type, is_read, created_at)
VALUES
('a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Driver Assigned', 'Driver John Martinez has been assigned to your delivery #DLV-1024.', 'DELIVERY_UPDATE', true, now() - interval '25 minutes'),
('a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Package Picked Up', 'Your package has been picked up and is in transit.', 'SUCCESS', false, now() - interval '15 minutes'),
('a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'New Delivery Assigned', 'You have been assigned Delivery #DLV-1024 to Market St.', 'INFO', true, now() - interval '25 minutes');
