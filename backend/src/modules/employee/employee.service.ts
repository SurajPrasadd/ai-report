import { EmployeeRepository } from './employee.repository';
import { AppError } from '../../middleware/error.middleware';
import { buildPagination } from '../../utils/response';

export class EmployeeService {
  private repo = new EmployeeRepository();

  async getAll(page = 1, limit = 10, search?: string, role?: string): Promise<any> {
    const { rows, total } = await this.repo.findAll(page, limit, search, role);
    return { employees: rows, pagination: buildPagination(total, page, limit) };
  }

  async getById(id: string): Promise<any> {
    const employee = await this.repo.findById(id);
    if (!employee) throw new AppError('Employee not found', 404);
    return employee;
  }

  async update(id: string, data: any): Promise<any> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Employee not found', 404);
    return await this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Employee not found', 404);
    await this.repo.delete(id);
  }
}
