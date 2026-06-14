import { Response, NextFunction } from 'express';
import { SprintService } from './sprint.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';

export class SprintController {
  private service = new SprintService();

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, status, page, limit } = req.query as any;
      const result = await this.service.getAll(projectId, status, Number(page) || 1, Number(limit) || 10);
      sendSuccess(res, result.sprints, 'Sprints fetched', 200, result.pagination);
    } catch (error) { next(error); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getById(req.params.id);
      sendSuccess(res, result, 'Sprint fetched');
    } catch (error) { next(error); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.create(req.body, req.user!.userId);
      sendSuccess(res, result, 'Sprint created', 201);
    } catch (error) { next(error); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.update(req.params.id, req.body);
      sendSuccess(res, result, 'Sprint updated');
    } catch (error) { next(error); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Sprint deleted');
    } catch (error) { next(error); }
  };
}
