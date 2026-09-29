# Delivery Tracking Application — Backend API

Production-ready Node.js & Express.js REST API with MVC architecture, Supabase PostgreSQL database integration, Row Level Security (RLS), real-time WebSockets, bcrypt password hashing, and JWT authentication.

---

## 🏗 Backend Architecture

```
backend-delivery/
├── src/
│   ├── config/              # Environment, Supabase client, Database connection
│   │   ├── env.js
│   │   ├── database.js
│   │   └── supabase.js
│   ├── models/              # Data access layer (User, Driver, Order, Delivery, etc.)
│   ├── controllers/         # Request handling & HTTP response formatting
│   ├── routes/              # Express API route endpoints
│   ├── middleware/          # JWT Auth, Roles, Error Handler, Validators, Rate Limiter
│   ├── services/            # Business logic, state machines, ETA/Haversine calculations
│   ├── validators/          # Input schema validations
│   ├── sockets/             # Socket.io real-time streaming
│   ├── app.js               # Express application configuration & security
│   ├── server.js            # HTTP and Socket.io server bootstrap
│   └── seedRunner.js        # Seed runner script
├── supabase/
│   ├── migrations/          # Complete PostgreSQL schema, constraints, RLS policies
│   ├── seed/                # Seed script with test users, drivers, orders, and coordinates
│   └── config.toml          # Local Supabase CLI configuration
├── tests/                   # Automated unit & integration tests
├── .env.example
├── package.json
└── README.md
```

---

## 🔑 Key Features

1. **Strict Delivery State Machine**:
   - `ORDER_PLACED` → `ORDER_CONFIRMED` → `DRIVER_ASSIGNED` → `PICKUP_PENDING` → `PICKED_UP` → `IN_TRANSIT` → `NEAR_DESTINATION` → `OUT_FOR_DELIVERY` → `DELIVERED`
   - Terminal / exception states: `CANCELLED`, `FAILED`
   - Invalid status transitions are rejected server-side with HTTP 400.
2. **Real-Time GPS Tracking**:
   - Driver transmits live GPS coordinates (`watchPosition` / Socket.io / REST).
   - Only the assigned driver can submit location updates for a delivery.
   - Computes dynamic Haversine distance and speed-based ETA (in minutes).
   - Emits real-time updates via Socket.io to `delivery:<id>` rooms.
3. **Security & Authentication**:
   - bcrypt with 10 salt rounds for password hashing.
   - JWT tokens stored in HTTP-only cookies and Bearer headers.
   - Role-based authorization (`CUSTOMER`, `DRIVER`, `ADMIN`).
   - Express rate limiting, Helmet HTTP headers, CORS whitelisting.
4. **Supabase Database & RLS**:
   - 8 core tables with foreign keys and automatic `updated_at` triggers.
   - Full Row Level Security (RLS) enabled on all tables.
   - Documented RLS policies ensuring users only access authorized data.
   - Automatic local high-fidelity database adapter so the backend runs immediately out of the box even before remote keys are plugged in!

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend-delivery
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | API Server Port | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super_secret_jwt_key_delivery_app_2026_production_style` |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `SUPABASE_URL` | Supabase Project URL | (Optional for remote Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | (Optional for remote Supabase) |

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 4. Run Tests
```bash
npm test
```

---

## 👥 Seed Credentials for Development

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@deliveryapp.com` | `Admin@123456` | Full administrative control |
| **Driver** | `driver.john@deliveryapp.com` | `Driver@123456` | Courier with active delivery #DLV-1024 |
| **Driver 2** | `driver.alex@deliveryapp.com` | `Driver@123456` | Van driver |
| **Customer** | `customer.emily@deliveryapp.com` | `Customer@123456` | Customer with active and completed orders |
| **Customer 2** | `customer.david@deliveryapp.com` | `Customer@123456` | Customer with pending orders |

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Log in and receive JWT token
- `POST /api/auth/logout` — Log out and clear session cookie
- `GET /api/auth/me` — Get current authenticated user and driver profile
- `POST /api/auth/change-password` — Change password

### Orders
- `POST /api/orders` — Create new delivery order (Customer/Admin)
- `GET /api/orders` — List user's orders (Customer sees own, Driver sees assigned, Admin sees all)
- `GET /api/orders/:id` — Get order details
- `POST /api/orders/:id/cancel` — Cancel pending order

### Deliveries
- `GET /api/deliveries` — List deliveries
- `GET /api/deliveries/:id` — Get delivery details with order, driver, and timeline
- `PUT /api/deliveries/:id/status` — Advance delivery status (validated state machine)
- `POST /api/deliveries/:id/assign` — Assign driver (Admin)
- `GET /api/deliveries/:id/timeline` — Get audit trail of delivery events

### Tracking
- `POST /api/tracking/location` — Driver reports live GPS coordinates
- `GET /api/tracking/:deliveryId/latest` — Get latest driver location and ETA
- `GET /api/tracking/:deliveryId/history` — Get route coordinates history

### Drivers
- `GET /api/drivers/profile` — Get logged-in driver's details
- `PUT /api/drivers/status` — Update availability (`AVAILABLE`, `BUSY`, `OFFLINE`)
- `PUT /api/drivers/vehicle` — Update vehicle details
- `GET /api/drivers/deliveries` — Get driver's assigned delivery queue

### Notifications
- `GET /api/notifications` — Get user alerts
- `PUT /api/notifications/:id/read` — Mark alert as read
- `PUT /api/notifications/read-all` — Mark all alerts as read

### Admin
- `GET /api/admin/stats` — High-level fleet KPIs and metrics
- `GET /api/admin/users` — List all registered users
- `PUT /api/admin/users/:id/toggle-status` — Activate or deactivate account
- `GET /api/admin/drivers` — List all drivers with live statuses
