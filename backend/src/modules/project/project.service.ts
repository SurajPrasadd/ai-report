import { ProjectRepository } from './project.repository';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto, AssignManagerDto, AssignEmployeeDto } from './project.dto';
import { AppError } from '../../middleware/error.middleware';
import { buildPagination } from '../../utils/response';

export class ProjectService {
  private repo = new ProjectRepository();

  async getAll(dto: ProjectQueryDto): Promise<any> {
    const { rows, total } = await this.repo.findAll(dto);
    const pagination = buildPagination(total, dto.page || 1, dto.limit || 10);
    return { projects: rows, pagination };
  }

  async getById(id: string): Promise<any> {
    const project = await this.repo.findById(id);
    if (!project) throw new AppError('Project not found', 404);
    return project;
  }

  async create(dto: CreateProjectDto, createdBy: string): Promise<any> {
    return await this.repo.create(dto, createdBy);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<any> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Project not found', 404);
    return await this.repo.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Project not found', 404);
    await this.repo.delete(id);
  }

  async assignManager(dto: AssignManagerDto, assignedBy: string): Promise<any> {
    return await this.repo.assignManager(dto, assignedBy);
  }

  async getManagerHistory(projectId: string): Promise<any[]> {
    return await this.repo.getManagerHistory(projectId);
  }

  async assignEmployee(dto: AssignEmployeeDto, assignedBy: string): Promise<any> {
    return await this.repo.assignEmployee(dto, assignedBy);
  }

  async removeEmployee(employeeId: string, projectId: string): Promise<void> {
    await this.repo.removeEmployee(employeeId, projectId);
  }

  async getProjectEmployees(projectId: string): Promise<any[]> {
    return await this.repo.getProjectEmployees(projectId);
  }
}
