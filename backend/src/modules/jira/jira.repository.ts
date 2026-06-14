import { query } from '../../config/database';

export class JiraRepository {
  async findAll(projectId?: string, sprintId?: string, status?: string, search?: string, page = 1, limit = 10): Promise<{ rows: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;

    if (projectId) { where += ` AND j.project_id = $${idx++}`; params.push(projectId); }
    if (sprintId) { where += ` AND j.sprint_id = $${idx++}`; params.push(sprintId); }
    if (status) { where += ` AND j.status = $${idx++}`; params.push(status); }
    if (search) {
      where += ` AND (j.jira_id ILIKE $${idx} OR j.summary ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM jira_user_stories j ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const rows = await query(
      `SELECT j.*, 
        e.first_name || ' ' || e.last_name AS assignee_name,
        s.sprint_name, p.project_name, p.project_code
       FROM jira_user_stories j
       LEFT JOIN employees e ON e.id = j.assignee_id
       LEFT JOIN sprints s ON s.id = j.sprint_id
       JOIN projects p ON p.id = j.project_id
       ${where} ORDER BY j.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    return { rows: rows.rows, total };
  }

  async findById(id: string): Promise<any> {
    const result = await query(
      `SELECT j.*, e.first_name || ' ' || e.last_name AS assignee_name, s.sprint_name, p.project_name
       FROM jira_user_stories j
       LEFT JOIN employees e ON e.id = j.assignee_id
       LEFT JOIN sprints s ON s.id = j.sprint_id
       JOIN projects p ON p.id = j.project_id
       WHERE j.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByJiraId(jiraId: string): Promise<any> {
    const result = await query('SELECT * FROM jira_user_stories WHERE jira_id = $1', [jiraId]);
    return result.rows[0] || null;
  }

  async create(data: any): Promise<any> {
    const result = await query(
      `INSERT INTO jira_user_stories (jira_id, summary, description, acceptance_criteria, status, story_points, priority, assignee_id, sprint_id, project_id, epic_key, labels, reporter)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [data.jiraId, data.summary, data.description, data.acceptanceCriteria, data.status || 'To Do', data.storyPoints || 0, data.priority || 'Medium', data.assigneeId, data.sprintId, data.projectId, data.epicKey, data.labels, data.reporter]
    );
    return result.rows[0];
  }

  async update(id: string, data: any): Promise<any> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      summary: 'summary', description: 'description', acceptanceCriteria: 'acceptance_criteria',
      status: 'status', storyPoints: 'story_points', priority: 'priority',
      assigneeId: 'assignee_id', sprintId: 'sprint_id', epicKey: 'epic_key',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return null;
    params.push(id);
    const result = await query(
      `UPDATE jira_user_stories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0];
  }

  async upsertFromJira(data: any): Promise<any> {
    const result = await query(
      `INSERT INTO jira_user_stories (jira_id, summary, description, status, story_points, priority, project_id, epic_key, reporter, jira_created_at, jira_updated_at, synced_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (jira_id) DO UPDATE SET
         summary = EXCLUDED.summary, description = EXCLUDED.description, status = EXCLUDED.status,
         story_points = EXCLUDED.story_points, priority = EXCLUDED.priority, jira_updated_at = EXCLUDED.jira_updated_at, synced_at = NOW()
       RETURNING *`,
      [data.jiraId, data.summary, data.description, data.status, data.storyPoints, data.priority, data.projectId, data.epicKey, data.reporter, data.jiraCreatedAt, data.jiraUpdatedAt]
    );
    return result.rows[0];
  }
}
