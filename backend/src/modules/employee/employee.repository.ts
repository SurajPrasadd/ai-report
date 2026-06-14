import { query } from '../../config/database';

export class EmployeeRepository {
  async findAll(page = 1, limit = 10, search?: string, role?: string): Promise<{ rows: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let where = 'WHERE is_active = true';
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      where += ` AND (first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR email ILIKE $${idx} OR employee_id ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (role) {
      where += ` AND role = $${idx}`;
      params.push(role);
      idx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM employees ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const rows = await query(
      `SELECT id, employee_id, first_name, last_name, email, role, department, designation, phone, avatar_url, last_login, created_at
       FROM employees ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    return { rows: rows.rows, total };
  }

  async findById(id: string): Promise<any> {
    const result = await query(
      `SELECT id, employee_id, first_name, last_name, email, role, department, designation, phone, avatar_url, is_active, last_login, created_at
       FROM employees WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async update(id: string, data: any): Promise<any> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    const allowed = ['first_name', 'last_name', 'department', 'designation', 'phone', 'avatar_url', 'role', 'is_active'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return null;
    params.push(id);
    const result = await query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, employee_id, first_name, last_name, email, role, department, designation`,
      params
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await query('UPDATE employees SET is_active = false WHERE id = $1', [id]);
  }
}
