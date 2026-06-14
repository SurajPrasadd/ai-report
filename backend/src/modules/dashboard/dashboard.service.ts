import { query } from '../../config/database';

export class DashboardService {
  async getStats(projectId?: string, sprintId?: string, startDate?: string, endDate?: string): Promise<any> {
    const params: unknown[] = [];
    let idx = 1;

    let aiWhere = 'WHERE 1=1';
    if (projectId) { aiWhere += ` AND au.project_id = $${idx++}`; params.push(projectId); }
    if (sprintId) { aiWhere += ` AND au.sprint_id = $${idx++}`; params.push(sprintId); }
    if (startDate) { aiWhere += ` AND au.reporting_date >= $${idx++}`; params.push(startDate); }
    if (endDate) { aiWhere += ` AND au.reporting_date <= $${idx++}`; params.push(endDate); }

    const [projectsResult, employeesResult, sprintsResult, storiesResult, aiResult] = await Promise.all([
      query('SELECT COUNT(*) FROM projects WHERE is_active = true'),
      query('SELECT COUNT(*) FROM employees WHERE is_active = true'),
      query('SELECT COUNT(*) FROM sprints'),
      query('SELECT COUNT(*) FROM jira_user_stories'),
      query(
        `SELECT 
          COUNT(*) AS total_records,
          COUNT(CASE WHEN used_ai = true THEN 1 END) AS ai_used_count,
          ROUND(COUNT(CASE WHEN used_ai = true THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS ai_usage_percentage,
          COALESCE(SUM(actual_effort_saved), 0) AS total_effort_saved
         FROM ai_usage_tracking au ${aiWhere}`,
        params
      ),
    ]);

    return {
      totalProjects: parseInt(projectsResult.rows[0].count, 10),
      totalEmployees: parseInt(employeesResult.rows[0].count, 10),
      totalSprints: parseInt(sprintsResult.rows[0].count, 10),
      totalJiraStories: parseInt(storiesResult.rows[0].count, 10),
      aiUsagePercentage: parseFloat(aiResult.rows[0].ai_usage_percentage) || 0,
      effortSaved: parseFloat(aiResult.rows[0].total_effort_saved) || 0,
      aiUsedCount: parseInt(aiResult.rows[0].ai_used_count, 10) || 0,
      totalRecords: parseInt(aiResult.rows[0].total_records, 10) || 0,
    };
  }

  async getAiUsageByProject(): Promise<any[]> {
    const result = await query(
      `SELECT p.project_name, p.project_code,
        COUNT(au.id) AS total_records,
        COUNT(CASE WHEN au.used_ai = true THEN 1 END) AS ai_used,
        ROUND(COUNT(CASE WHEN au.used_ai = true THEN 1 END)::numeric / NULLIF(COUNT(au.id), 0) * 100, 2) AS ai_percentage
       FROM projects p
       LEFT JOIN ai_usage_tracking au ON au.project_id = p.id
       WHERE p.is_active = true
       GROUP BY p.id, p.project_name, p.project_code
       ORDER BY ai_percentage DESC`
    );
    return result.rows;
  }

  async getEffortSavedBySprint(): Promise<any[]> {
    const result = await query(
      `SELECT s.sprint_name,
        COALESCE(SUM(au.actual_effort_saved), 0) AS total_effort_saved,
        ROUND(AVG(au.actual_effort_saved_pct), 2) AS avg_pct
       FROM sprints s
       LEFT JOIN ai_usage_tracking au ON au.sprint_id = s.id
       GROUP BY s.id, s.sprint_name
       ORDER BY s.start_date DESC
       LIMIT 10`
    );
    return result.rows;
  }

  async getResourceUtilization(): Promise<any[]> {
    const result = await query(
      `SELECT e.first_name || ' ' || e.last_name AS employee_name, e.role,
        COUNT(au.id) AS total_tasks,
        COUNT(CASE WHEN au.used_ai = true THEN 1 END) AS ai_tasks,
        COALESCE(SUM(au.actual_effort_saved), 0) AS effort_saved
       FROM employees e
       LEFT JOIN ai_usage_tracking au ON au.employee_id = e.id
       WHERE e.is_active = true
       GROUP BY e.id, e.first_name, e.last_name, e.role
       ORDER BY effort_saved DESC
       LIMIT 20`
    );
    return result.rows;
  }
}
