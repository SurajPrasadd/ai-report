import axios from 'axios';
import { JiraRepository } from './jira.repository';
import { AppError } from '../../middleware/error.middleware';
import { config } from '../../config/env';
import { buildPagination } from '../../utils/response';
import { logger } from '../../utils/logger';

export class JiraService {
  private repo = new JiraRepository();

  private get jiraHeaders() {
    const credentials = Buffer.from(`${config.jira.email}:${config.jira.apiToken}`).toString('base64');
    return { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' };
  }

  async getAll(projectId?: string, sprintId?: string, status?: string, search?: string, page = 1, limit = 10): Promise<any> {
    const { rows, total } = await this.repo.findAll(projectId, sprintId, status, search, page, limit);
    return { stories: rows, pagination: buildPagination(total, page, limit) };
  }

  async getById(id: string): Promise<any> {
    const story = await this.repo.findById(id);
    if (!story) throw new AppError('Jira story not found', 404);
    return story;
  }

  async create(data: any): Promise<any> {
    return await this.repo.create(data);
  }

  async update(id: string, data: any): Promise<any> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Jira story not found', 404);
    return await this.repo.update(id, data);
  }

  async syncFromJira(projectId: string, jiraProjectKey: string): Promise<{ synced: number; errors: number }> {
    if (!config.jira.baseUrl || !config.jira.apiToken) {
      throw new AppError('Jira integration not configured', 400);
    }

    let synced = 0;
    let errors = 0;
    let startAt = 0;
    const maxResults = 50;

    try {
      while (true) {
        const response = await axios.get(
          `${config.jira.baseUrl}/rest/api/3/search`,
          {
            headers: this.jiraHeaders,
            params: {
              jql: `project = ${jiraProjectKey} ORDER BY created DESC`,
              startAt,
              maxResults,
              fields: 'summary,description,status,priority,story_points,assignee,reporter,created,updated,customfield_10016,epic',
            },
          }
        );

        const { issues, total } = response.data;

        for (const issue of issues) {
          try {
            await this.repo.upsertFromJira({
              jiraId: issue.key,
              summary: issue.fields.summary,
              description: issue.fields.description?.content?.[0]?.content?.[0]?.text || '',
              status: issue.fields.status.name,
              storyPoints: issue.fields.customfield_10016 || 0,
              priority: issue.fields.priority?.name || 'Medium',
              projectId,
              epicKey: issue.fields.epic?.key || null,
              reporter: issue.fields.reporter?.displayName || '',
              jiraCreatedAt: issue.fields.created,
              jiraUpdatedAt: issue.fields.updated,
            });
            synced++;
          } catch (err) {
            logger.error(`Failed to sync issue ${issue.key}:`, err);
            errors++;
          }
        }

        startAt += maxResults;
        if (startAt >= total) break;
      }
    } catch (err) {
      logger.error('Jira sync failed:', err);
      throw new AppError('Failed to sync from Jira', 502);
    }

    return { synced, errors };
  }
}
