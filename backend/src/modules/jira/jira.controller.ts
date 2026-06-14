import { Response, NextFunction } from 'express';
import { JiraService } from './jira.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';

export class JiraController {
  private service = new JiraService();

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, sprintId, status, search, page, limit } = req.query as any;
      const result = await this.service.getAll(projectId, sprintId, status, search, Number(page) || 1, Number(limit) || 10);
      sendSuccess(res, result.stories, 'Stories fetched', 200, result.pagination);
    } catch (error) { next(error); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getById(req.params.id);
      sendSuccess(res, result, 'Story fetched');
    } catch (error) { next(error); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.create(req.body);
      sendSuccess(res, result, 'Story created', 201);
    } catch (error) { next(error); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.update(req.params.id, req.body);
      sendSuccess(res, result, 'Story updated');
    } catch (error) { next(error); }
  };

  syncFromJira = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, jiraProjectKey } = req.body;
      const result = await this.service.syncFromJira(projectId, jiraProjectKey);
      sendSuccess(res, result, `Sync completed: ${result.synced} stories synced, ${result.errors} errors`);
    } catch (error) { next(error); }
  };
}
