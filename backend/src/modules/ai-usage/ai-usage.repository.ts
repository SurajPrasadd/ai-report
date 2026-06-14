import { query } from '../../config/database';

export class AiUsageRepository {
  async findAll(filters: any, page = 1, limit = 10): Promise<{ rows: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;

    if (filters.projectId) { where += ` AND au.project_id = $${idx++}`; params.push(filters.projectId); }
    if (filters.sprintId) { where += ` AND au.sprint_id = $${idx++}`; params.push(filters.sprintId); }
    if (filters.employeeId) { where += ` AND au.employee_id = $${idx++}`; params.push(filters.employeeId); }
    if (filters.sdlcPhase) { where += ` AND au.sdlc_phase = $${idx++}`; params.push(filters.sdlcPhase); }
    if (filters.usedAi !== undefined) { where += ` AND au.used_ai = $${idx++}`; params.push(filters.usedAi === 'true'); }
    if (filters.status) { where += ` AND au.status = $${idx++}`; params.push(filters.status); }
    if (filters.startDate) { where += ` AND au.reporting_date >= $${idx++}`; params.push(filters.startDate); }
    if (filters.endDate) { where += ` AND au.reporting_date <= $${idx++}`; params.push(filters.endDate); }

    const countResult = await query(`SELECT COUNT(*) FROM ai_usage_tracking au ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const rows = await query(
      `SELECT au.*,
        e.first_name || ' ' || e.last_name AS employee_name,
        p.project_name, p.project_code,
        s.sprint_name,
        r.first_name || ' ' || r.last_name AS reviewer_name_full
       FROM ai_usage_tracking au
       JOIN employees e ON e.id = au.employee_id
       JOIN projects p ON p.id = au.project_id
       LEFT JOIN sprints s ON s.id = au.sprint_id
       LEFT JOIN employees r ON r.id = au.reviewer_id
       ${where} ORDER BY au.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    return { rows: rows.rows, total };
  }

  async findById(id: string): Promise<any> {
    const result = await query(
      `SELECT au.*, e.first_name || ' ' || e.last_name AS employee_name, p.project_name, s.sprint_name
       FROM ai_usage_tracking au
       JOIN employees e ON e.id = au.employee_id
       JOIN projects p ON p.id = au.project_id
       LEFT JOIN sprints s ON s.id = au.sprint_id
       WHERE au.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data: any): Promise<any> {
    const result = await query(
      `INSERT INTO ai_usage_tracking (
        jira_story_id, jira_id, project_id, sprint_id, employee_id, sdlc_phase, use_case,
        use_case_details, user_story_details, used_ai, tool_used, inputs_given, prompt_count,
        no_of_reprompts, estimated_time, ai_usage_time, review_time, rework_time, reporting_time,
        actual_time_spent, actual_effort_saved, actual_effort_saved_pct, saved_capacity_usage,
        reason_missing_effort, actual_coverage, coverage_remarks, actual_accuracy, accuracy_remarks,
        true_sdlc_coverage, true_sdlc_accuracy, true_sdlc_effort_saved, true_sdlc_effort_saved_pct,
        comparison_remarks, no_of_resources, updates, status, reviewer_id, reviewer_name,
        coverage_accuracy_approach, reason_for_not_using_ai, reporting_date
       ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41
       ) RETURNING *`,
      [
        data.jiraStoryId, data.jiraId, data.projectId, data.sprintId, data.employeeId, data.sdlcPhase,
        data.useCase, data.useCaseDetails, data.userStoryDetails, data.usedAi, data.toolUsed,
        data.inputsGiven, data.promptCount || 0, data.noOfReprompts || 0, data.estimatedTime || 0,
        data.aiUsageTime || 0, data.reviewTime || 0, data.reworkTime || 0, data.reportingTime || 0,
        data.actualTimeSpent || 0, data.actualEffortSaved || 0, data.actualEffortSavedPct || 0,
        data.savedCapacityUsage, data.reasonMissingEffort, data.actualCoverage || 0,
        data.coverageRemarks, data.actualAccuracy || 0, data.accuracyRemarks,
        data.trueSdlcCoverage || 0, data.trueSdlcAccuracy || 0, data.trueSdlcEffortSaved || 0,
        data.trueSdlcEffortSavedPct || 0, data.comparisonRemarks, data.noOfResources || 1,
        data.updates, data.status || 'Draft', data.reviewerId, data.reviewerName,
        data.coverageAccuracyApproach, data.reasonForNotUsingAi, data.reportingDate || new Date(),
      ]
    );
    return result.rows[0];
  }

  async update(id: string, data: any): Promise<any> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      sdlcPhase: 'sdlc_phase', useCase: 'use_case', usedAi: 'used_ai', toolUsed: 'tool_used',
      promptCount: 'prompt_count', estimatedTime: 'estimated_time', aiUsageTime: 'ai_usage_time',
      reviewTime: 'review_time', reworkTime: 'rework_time', actualTimeSpent: 'actual_time_spent',
      actualEffortSaved: 'actual_effort_saved', actualEffortSavedPct: 'actual_effort_saved_pct',
      actualCoverage: 'actual_coverage', actualAccuracy: 'actual_accuracy', status: 'status',
      noOfReprompts: 'no_of_reprompts', inputsGiven: 'inputs_given', useCaseDetails: 'use_case_details',
      coverageRemarks: 'coverage_remarks', accuracyRemarks: 'accuracy_remarks',
      reasonForNotUsingAi: 'reason_for_not_using_ai', updates: 'updates',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { fields.push(`${col} = $${idx++}`); params.push(data[key]); }
    }

    if (fields.length === 0) return null;
    params.push(id);
    const result = await query(
      `UPDATE ai_usage_tracking SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM ai_usage_tracking WHERE id = $1', [id]);
  }

  async getSummaryStats(projectId?: string, sprintId?: string): Promise<any> {
    let where = 'WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;

    if (projectId) { where += ` AND project_id = $${idx++}`; params.push(projectId); }
    if (sprintId) { where += ` AND sprint_id = $${idx++}`; params.push(sprintId); }

    const result = await query(
      `SELECT 
        COUNT(*) AS total_records,
        COUNT(CASE WHEN used_ai = true THEN 1 END) AS ai_used_count,
        ROUND(AVG(CASE WHEN used_ai = true THEN actual_effort_saved_pct END), 2) AS avg_effort_saved_pct,
        SUM(actual_effort_saved) AS total_effort_saved,
        SUM(estimated_time) AS total_estimated_time,
        SUM(actual_time_spent) AS total_actual_time,
        ROUND(COUNT(CASE WHEN used_ai = true THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS ai_usage_percentage
       FROM ai_usage_tracking ${where}`,
      params
    );
    return result.rows[0];
  }

  async getByPhase(projectId?: string, sprintId?: string): Promise<any[]> {
    let where = 'WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;
    if (projectId) { where += ` AND project_id = $${idx++}`; params.push(projectId); }
    if (sprintId) { where += ` AND sprint_id = $${idx++}`; params.push(sprintId); }

    const result = await query(
      `SELECT sdlc_phase,
        COUNT(*) AS total,
        COUNT(CASE WHEN used_ai = true THEN 1 END) AS ai_used,
        ROUND(AVG(actual_effort_saved_pct), 2) AS avg_effort_saved_pct
       FROM ai_usage_tracking ${where}
       GROUP BY sdlc_phase ORDER BY total DESC`,
      params
    );
    return result.rows;
  }
}
