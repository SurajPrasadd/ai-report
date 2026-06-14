import { query } from '../../config/database';
import { RegisterDto } from './auth.dto';

export class AuthRepository {
  async findByEmail(email: string): Promise<any> {
    const result = await query(
      'SELECT * FROM employees WHERE email = $1 AND is_active = true',
      [email]
    );
    return result.rows[0] || null;
  }

  async findByEmployeeId(employeeId: string): Promise<any> {
    const result = await query(
      'SELECT * FROM employees WHERE employee_id = $1 AND is_active = true',
      [employeeId]
    );
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<any> {
    const result = await query(
      'SELECT id, employee_id, first_name, last_name, email, role, department, designation, avatar_url, is_active, last_login, created_at FROM employees WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async createEmployee(dto: RegisterDto, passwordHash: string): Promise<any> {
    const result = await query(
      `INSERT INTO employees (employee_id, first_name, last_name, email, password_hash, role, department, designation, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [dto.employeeId, dto.firstName, dto.lastName, dto.email, passwordHash, dto.role, dto.department, dto.designation, dto.phone]
    );
    return result.rows[0];
  }

  async updateLastLogin(id: string): Promise<void> {
    await query('UPDATE employees SET last_login = NOW() WHERE id = $1', [id]);
  }

  async saveRefreshToken(employeeId: string, token: string, expiresAt: Date): Promise<void> {
    await query(
      'INSERT INTO refresh_tokens (employee_id, token, expires_at) VALUES ($1, $2, $3)',
      [employeeId, token, expiresAt]
    );
  }

  async findRefreshToken(token: string): Promise<any> {
    const result = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > NOW()',
      [token]
    );
    return result.rows[0] || null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await query('UPDATE refresh_tokens SET is_revoked = true WHERE token = $1', [token]);
  }

  async revokeAllUserTokens(employeeId: string): Promise<void> {
    await query('UPDATE refresh_tokens SET is_revoked = true WHERE employee_id = $1', [employeeId]);
  }
}
