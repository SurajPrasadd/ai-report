import request from 'supertest';
import app from '../server';
import { pool } from '../config/database';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const mockAdminToken = jwt.sign(
  { userId: 'a1b2c3d4-0000-0000-0000-000000000001', employeeId: 'EMP001', email: 'admin@company.com', role: 'Admin' },
  config.jwt.secret,
  { expiresIn: '1h' }
);

describe('Projects API', () => {
  afterAll(async () => { await pool.end(); });

  it('GET /api/v1/projects - should return 401 without auth', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/projects - should return list with auth', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${mockAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/projects - should create project', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        projectCode: 'TEST99',
        projectName: 'Test Project',
        status: 'Active',
        startDate: '2024-01-01',
      });
    expect([201, 409]).toContain(res.status);
  });

  it('POST /api/v1/projects - should fail with missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ projectName: 'Missing Code' });
    expect(res.status).toBe(500); // Will fail at DB level
  });
});
