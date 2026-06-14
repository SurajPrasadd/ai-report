import { query } from '../../config/database';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto, AssignManagerDto, AssignEmployeeDto } from './project.dto';

export class ProjectRepository {
  async findAll(dto: ProjectQueryDto): Promise<{ rows: any[]; total: number }> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = dto.sortBy || 'created_at';
    const sortOrder = dto.sortOrder || 'DESC';

    let whereClause = 'WHERE p.is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (dto.search) {
      whereClause += ` AND (p.project_name ILIKE $${paramIndex} OR p.project_code ILIKE $${paramIndex})`;
      params.push(`%${dto.search}%`);
      paramIndex++;
    }
    if (dto.status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(dto.status);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM projects p ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const rows = await query(
      `SELECT p.*, 
        e.first_name || ' ' || e.last_name AS pm_name,
        e.email AS pm_email
       FROM projects p
       LEFT JOIN project_manager_mapping pmm ON pmm.project_id = p.id AND pmm.is_active = true
       LEFT JOIN employees e ON e.id = pmm.manager_id
       ${whereClause}
       ORDER BY p.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return { rows: rows.rows, total };
  }

  async findById(id: string): Promise<any> {
    const result = await query(
      `SELECT p.*, 
        e.first_name || ' ' || e.last_name AS pm_name,
        e.id AS pm_id
       FROM projects p
       LEFT JOIN project_manager_mapping pmm ON pmm.project_id = p.id AND pmm.is_active = true
       LEFT JOIN employees e ON e.id = pmm.manager_id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(dto: CreateProjectDto, createdBy: string): Promise<any> {
    const result = await query(
      `INSERT INTO projects (project_code, project_name, description, status, start_date, end_date, jira_project_key, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [dto.projectCode, dto.projectName, dto.description, dto.status || 'Active', dto.startDate, dto.endDate, dto.jiraProjectKey, createdBy]
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateProjectDto): Promise<any> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (dto.projectName !== undefined) { fields.push(`project_name = $${idx++}`); params.push(dto.projectName); }
    if (dto.description !== undefined) { fields.push(`description = $${idx++}`); params.push(dto.description); }
    if (dto.status !== undefined) { fields.push(`status = $${idx++}`); params.push(dto.status); }
    if (dto.startDate !== undefined) { fields.push(`start_date = $${idx++}`); params.push(dto.startDate); }
    if (dto.endDate !== undefined) { fields.push(`end_date = $${idx++}`); params.push(dto.endDate); }
    if (dto.jiraProjectKey !== undefined) { fields.push(`jira_project_key = $${idx++}`); params.push(dto.jiraProjectKey); }

    if (fields.length === 0) return null;
    params.push(id);

    const result = await query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await query('UPDATE projects SET is_active = false WHERE id = $1', [id]);
  }

  // PM Mapping
  async assignManager(dto: AssignManagerDto, assignedBy: string): Promise<any> {
    await query(
      'UPDATE project_manager_mapping SET is_active = false WHERE project_id = $1',
      [dto.projectId]
    );
    const result = await query(
      `INSERT INTO project_manager_mapping (project_id, manager_id, assigned_date, assigned_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [dto.projectId, dto.managerId, dto.assignedDate || new Date(), assignedBy]
    );
    return result.rows[0];
  }

  async getManagerHistory(projectId: string): Promise<any[]> {
    const result = await query(
      `SELECT pmm.*, e.first_name || ' ' || e.last_name AS manager_name, e.email AS manager_email
       FROM project_manager_mapping pmm
       JOIN employees e ON e.id = pmm.manager_id
       WHERE pmm.project_id = $1
       ORDER BY pmm.assigned_date DESC`,
      [projectId]
    );
    return result.rows;
  }

  // Employee Mapping
  async assignEmployee(dto: AssignEmployeeDto, assignedBy: string): Promise<any> {
    const result = await query(
      `INSERT INTO employee_project_mapping (employee_id, project_id, role, assigned_date, assigned_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.employeeId, dto.projectId, dto.role, dto.assignedDate || new Date(), assignedBy]
    );
    return result.rows[0];
  }

  async removeEmployee(employeeId: string, projectId: string): Promise<void> {
    await query(
      'UPDATE employee_project_mapping SET is_active = false WHERE employee_id = $1 AND project_id = $2',
      [employeeId, projectId]
    );
  }

  async getProjectEmployees(projectId: string): Promise<any[]> {
    const result = await query(
      `SELECT epm.*, e.first_name || ' ' || e.last_name AS employee_name, e.email, e.designation
       FROM employee_project_mapping epm
       JOIN employees e ON e.id = epm.employee_id
       WHERE epm.project_id = $1 AND epm.is_active = true
       ORDER BY epm.role`,
      [projectId]
    );
    return result.rows;
  }
}
