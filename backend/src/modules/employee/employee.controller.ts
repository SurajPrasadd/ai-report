import { Response, NextFunction } from 'express';
import { EmployeeService } from './employee.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';

export class EmployeeController {
  private service = new EmployeeService();

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search, role } = req.query as any;
      const result = await this.service.getAll(Number(page) || 1, Number(limit) || 10, search, role);
      sendSuccess(res, result.employees, 'Employees fetched', 200, result.pagination);
    } catch (error) { next(error); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getById(req.params.id);
      sendSuccess(res, result, 'Employee fetched');
    } catch (error) { next(error); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.update(req.params.id, req.body);
      sendSuccess(res, result, 'Employee updated');
    } catch (error) { next(error); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Employee deactivated');
    } catch (error) { next(error); }
  };
}
