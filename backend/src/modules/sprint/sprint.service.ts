import { SprintRepository } from './sprint.repository';
import { CreateSprintDto, UpdateSprintDto } from './sprint.dto';
import { AppError } from '../../middleware/error.middleware';
import { buildPagination } from '../../utils/response';

export class SprintService {
  private repo = new SprintRepository();

  async getAll(projectId?: string, status?: string, page = 1, limit = 10): Promise<any> {
    const { rows, total } = await this.repo.findAll(projectId, status, page, limit);
    return { sprints: rows, pagination: buildPagination(total, page, limit) };
  }

  async getById(id: string): Promise<any> {
    const sprint = await this.repo.findById(id);
    if (!sprint) throw new AppError('Sprint not found', 404);
    return sprint;
  }

  async create(dto: CreateSprintDto, createdBy: string): Promise<any> {
    return await this.repo.create(dto, createdBy);
  }

  async update(id: string, dto: UpdateSprintDto): Promise<any> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Sprint not found', 404);
    return await this.repo.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Sprint not found', 404);
    await this.repo.delete(id);
  }
}
