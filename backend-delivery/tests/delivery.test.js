const request = require('supertest');
const app = require('../src/app');

describe('Delivery & Orders APIs', () => {
  let customerToken;
  let driverToken;
  let createdOrderId;
  let createdDeliveryId;

  beforeAll(async () => {
    // Login Customer
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer.emily@deliveryapp.com',
        password: 'Customer@123456'
      });
    customerToken = custRes.body.data.token;

    // Login Driver
    const driverRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'driver.john@deliveryapp.com',
        password: 'Driver@123456'
      });
    driverToken = driverRes.body.data.token;
  });

  it('should allow customer to create a new delivery order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        recipientName: 'Robert Vance',
        recipientPhone: '+1-555-4422',
        packageDescription: 'Precision Tools',
        packageWeight: 3.2,
        priority: 'EXPRESS',
        pickupAddressText: 'Warehouse North, 100 Main St, SF',
        deliveryAddressText: 'Tech HQ, 200 Market St, SF',
        pickupLatitude: 37.7800,
        pickupLongitude: -122.4000,
        deliveryLatitude: 37.7890,
        deliveryLongitude: -122.4050
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toBeDefined();
    expect(res.body.data.delivery).toBeDefined();
    expect(res.body.data.delivery.delivery_status).toBe('ORDER_PLACED');

    createdOrderId = res.body.data.order.id;
    createdDeliveryId = res.body.data.delivery.id;
  });

  it('should reject invalid delivery status transition (e.g. ORDER_PLACED directly to DELIVERED)', async () => {
    const res = await request(app)
      .put(`/api/deliveries/${createdDeliveryId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        status: 'DELIVERED'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('INVALID_STATUS_TRANSITION');
  });

  it('should fetch the delivery timeline events', async () => {
    const res = await request(app)
      .get(`/api/deliveries/${createdDeliveryId}/timeline`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].event_type).toBe('ORDER_PLACED');
  });
});
