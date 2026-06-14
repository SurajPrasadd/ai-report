import { Response, NextFunction } from 'express';
import { AiUsageService } from './ai-usage.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';

export class AiUsageController {
  private service = new AiUsageService();

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, ...filters } = req.query as any;
      const result = await this.service.getAll(filters, Number(page) || 1, Number(limit) || 10);
      sendSuccess(res, result.records, 'AI usage records fetched', 200, result.pagination);
    } catch (error) { next(error); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getById(req.params.id);
      sendSuccess(res, result, 'AI usage record fetched');
    } catch (error) { next(error); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.body.employeeId) req.body.employeeId = req.user!.userId;
      const result = await this.service.create(req.body);
      sendSuccess(res, result, 'AI usage record created', 201);
    } catch (error) { next(error); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.update(req.params.id, req.body);
      sendSuccess(res, result, 'AI usage record updated');
    } catch (error) { next(error); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'AI usage record deleted');
    } catch (error) { next(error); }
  };

  getSummaryStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, sprintId } = req.query as any;
      const result = await this.service.getSummaryStats(projectId, sprintId);
      sendSuccess(res, result, 'Summary stats fetched');
    } catch (error) { next(error); }
  };

  getByPhase = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, sprintId } = req.query as any;
      const result = await this.service.getByPhase(projectId, sprintId);
      sendSuccess(res, result, 'Phase breakdown fetched');
    } catch (error) { next(error); }
  };
}
