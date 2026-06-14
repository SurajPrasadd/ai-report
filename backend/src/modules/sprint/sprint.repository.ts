import { query } from '../../config/database';
import { CreateSprintDto, UpdateSprintDto } from './sprint.dto';

export class SprintRepository {
  async findAll(projectId?: string, status?: string, page = 1, limit = 10): Promise<{ rows: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;

    if (projectId) { where += ` AND s.project_id = $${idx++}`; params.push(projectId); }
    if (status) { where += ` AND s.status = $${idx++}`; params.push(status); }

    const countResult = await query(`SELECT COUNT(*) FROM sprints s ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const rows = await query(
      `SELECT s.*, p.project_name, p.project_code
       FROM sprints s JOIN projects p ON p.id = s.project_id
       ${where} ORDER BY s.start_date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    return { rows: rows.rows, total };
  }

  async findById(id: string): Promise<any> {
    const result = await query(
      `SELECT s.*, p.project_name, p.project_code
       FROM sprints s JOIN projects p ON p.id = s.project_id
       WHERE s.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(dto: CreateSprintDto, createdBy: string): Promise<any> {
    const result = await query(
      `INSERT INTO sprints (sprint_name, jira_sprint_id, project_id, start_date, end_date, status, goal, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [dto.sprintName, dto.jiraSprintId, dto.projectId, dto.startDate, dto.endDate, dto.status || 'Planned', dto.goal, createdBy]
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateSprintDto): Promise<any> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (dto.sprintName !== undefined) { fields.push(`sprint_name = $${idx++}`); params.push(dto.sprintName); }
    if (dto.jiraSprintId !== undefined) { fields.push(`jira_sprint_id = $${idx++}`); params.push(dto.jiraSprintId); }
    if (dto.startDate !== undefined) { fields.push(`start_date = $${idx++}`); params.push(dto.startDate); }
    if (dto.endDate !== undefined) { fields.push(`end_date = $${idx++}`); params.push(dto.endDate); }
    if (dto.status !== undefined) { fields.push(`status = $${idx++}`); params.push(dto.status); }
    if (dto.goal !== undefined) { fields.push(`goal = $${idx++}`); params.push(dto.goal); }
    if (dto.velocity !== undefined) { fields.push(`velocity = $${idx++}`); params.push(dto.velocity); }

    if (fields.length === 0) return null;
    params.push(id);
    const result = await query(
      `UPDATE sprints SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM sprints WHERE id = $1', [id]);
  }
}
