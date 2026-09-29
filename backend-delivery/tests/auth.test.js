const request = require('supertest');
const app = require('../src/app');

describe('Authentication & Authorization APIs', () => {
  const testEmail = `testuser_${Date.now()}@deliveryapp.com`;
  const testPassword = 'Password@123';

  it('should register a new customer successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test Automation User',
        email: testEmail,
        phone: '+1-555-9999',
        password: testPassword,
        confirmPassword: testPassword,
        role: 'CUSTOMER'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password_hash).toBeUndefined(); // Security: password never returned
  });

  it('should reject registration with mismatched confirm password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Mismatch Tester',
        email: `mismatch_${Date.now()}@deliveryapp.com`,
        phone: '+1-555-9999',
        password: 'Password@123',
        confirmPassword: 'DifferentPassword@456',
        role: 'CUSTOMER'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_FAILED');
  });

  it('should login an existing user and return a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'IncorrectPassword999'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('INVALID_CREDENTIALS');
  });

  it('should reject accessing protected route without a token', async () => {
    const res = await request(app)
      .get('/api/users/profile');

    expect(res.statusCode).toBe(401);
    expect(res.body.errorCode).toBe('UNAUTHENTICATED');
  });

  it('should access /api/auth/me when authenticated with Bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testEmail);
  });
});
