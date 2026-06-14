import { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  private service = new DashboardService();

  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, sprintId, startDate, endDate } = req.query as any;
      const result = await this.service.getStats(projectId, sprintId, startDate, endDate);
      sendSuccess(res, result, 'Dashboard stats fetched');
    } catch (error) { next(error); }
  };

  getAiUsageByProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAiUsageByProject();
      sendSuccess(res, result, 'AI usage by project fetched');
    } catch (error) { next(error); }
  };

  getEffortSavedBySprint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getEffortSavedBySprint();
      sendSuccess(res, result, 'Effort saved by sprint fetched');
    } catch (error) { next(error); }
  };

  getResourceUtilization = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getResourceUtilization();
      sendSuccess(res, result, 'Resource utilization fetched');
    } catch (error) { next(error); }
  };
}
