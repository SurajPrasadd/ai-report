import request from 'supertest';
import app from '../server';
import { pool } from '../config/database';

describe('Auth API', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 422 for missing fields', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        employeeId: 'EMP001',
        email: 'not-an-email',
        password: 'password',
      });
      expect(res.status).toBe(422);
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        employeeId: 'EMP999',
        email: 'nobody@example.com',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 422 for weak password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        employeeId: 'EMP999',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@company.com',
        password: '123',
        role: 'Developer',
      });
      expect(res.status).toBe(422);
    });

    it('should return 422 for invalid role', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        employeeId: 'EMP999',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@company.com',
        password: 'Password@123',
        role: 'InvalidRole',
      });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Protected routes', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });
});
