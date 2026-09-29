const request = require('supertest');
const app = require('../src/app');
const LocationService = require('../src/services/locationService');

describe('Tracking & Location Services', () => {
  it('should accurately calculate Haversine distance and ETA', () => {
    // Distance between SF Ferry Building (37.7955, -122.3937) and Market St (37.7880, -122.4045) is ~1.28 km
    const dist = LocationService.calculateDistanceKm(37.7955, -122.3937, 37.7880, -122.4045);
    expect(dist).toBeGreaterThan(1.0);
    expect(dist).toBeLessThan(1.6);

    const eta = LocationService.calculateEtaMinutes(dist, 'MOTORCYCLE');
    expect(eta).toBeGreaterThanOrEqual(1);
    expect(eta).toBeLessThanOrEqual(10);
  });

  it('should record driver live GPS coordinates and calculate remaining distance', async () => {
    // Login as driver
    const driverRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'driver.john@deliveryapp.com',
        password: 'Driver@123456'
      });

    const token = driverRes.body.data.token;
    const deliveryId = 'e0000000-0000-0000-0000-000000000001';

    const locationRes = await request(app)
      .post('/api/tracking/location')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deliveryId,
        latitude: 37.7865,
        longitude: -122.4039,
        speed: 25.5,
        heading: 345.0,
        accuracy: 3.5
      });

    expect(locationRes.statusCode).toBe(201);
    expect(locationRes.body.success).toBe(true);
    expect(locationRes.body.data.tracking).toBeDefined();
    expect(locationRes.body.data.metrics).toBeDefined();
    expect(locationRes.body.data.metrics.remainingDistanceKm).toBeDefined();
  });

  it('should fetch latest delivery tracking location', async () => {
    const deliveryId = 'e0000000-0000-0000-0000-000000000001';
    const res = await request(app)
      .get(`/api/tracking/${deliveryId}/latest`)
      .set('Authorization', `Bearer whatever`); // Tested with customer login or auth

    // Login customer to test authorized access
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer.emily@deliveryapp.com',
        password: 'Customer@123456'
      });
    const customerToken = custRes.body.data.token;

    const authedRes = await request(app)
      .get(`/api/tracking/${deliveryId}/latest`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(authedRes.statusCode).toBe(200);
    expect(authedRes.body.success).toBe(true);
    expect(authedRes.body.data.delivery).toBeDefined();
    expect(authedRes.body.data.latestLocation).toBeDefined();
  });
});
