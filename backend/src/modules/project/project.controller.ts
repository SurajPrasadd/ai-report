import { Response, NextFunction } from 'express';
import { ProjectService } from './project.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';

export class ProjectController {
  private service = new ProjectService();

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAll(req.query as any);
      sendSuccess(res, result.projects, 'Projects fetched', 200, result.pagination);
    } catch (error) { next(error); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getById(req.params.id);
      sendSuccess(res, result, 'Project fetched');
    } catch (error) { next(error); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.create(req.body, req.user!.userId);
      sendSuccess(res, result, 'Project created', 201);
    } catch (error) { next(error); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.update(req.params.id, req.body);
      sendSuccess(res, result, 'Project updated');
    } catch (error) { next(error); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Project deleted');
    } catch (error) { next(error); }
  };

  assignManager = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.assignManager(req.body, req.user!.userId);
      sendSuccess(res, result, 'Manager assigned');
    } catch (error) { next(error); }
  };

  getManagerHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getManagerHistory(req.params.projectId);
      sendSuccess(res, result, 'Manager history fetched');
    } catch (error) { next(error); }
  };

  assignEmployee = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.assignEmployee(req.body, req.user!.userId);
      sendSuccess(res, result, 'Employee assigned', 201);
    } catch (error) { next(error); }
  };

  removeEmployee = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.removeEmployee(req.params.employeeId, req.params.projectId);
      sendSuccess(res, null, 'Employee removed');
    } catch (error) { next(error); }
  };

  getProjectEmployees = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getProjectEmployees(req.params.projectId);
      sendSuccess(res, result, 'Project employees fetched');
    } catch (error) { next(error); }
  };
}
