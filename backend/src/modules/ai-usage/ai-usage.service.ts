import { AiUsageRepository } from './ai-usage.repository';
import { AppError } from '../../middleware/error.middleware';
import { buildPagination } from '../../utils/response';

export class AiUsageService {
  private repo = new AiUsageRepository();

  async getAll(filters: any, page = 1, limit = 10): Promise<any> {
    const { rows, total } = await this.repo.findAll(filters, page, limit);
    return { records: rows, pagination: buildPagination(total, page, limit) };
  }

  async getById(id: string): Promise<any> {
    const record = await this.repo.findById(id);
    if (!record) throw new AppError('AI usage record not found', 404);
    return record;
  }

  async create(data: any): Promise<any> {
    // Auto-calculate effort saved percentage
    if (data.estimatedTime && data.actualTimeSpent) {
      const saved = data.estimatedTime - data.actualTimeSpent;
      data.actualEffortSaved = saved > 0 ? saved : 0;
      data.actualEffortSavedPct = saved > 0 ? (saved / data.estimatedTime) * 100 : 0;
    }
    return await this.repo.create(data);
  }

  async update(id: string, data: any): Promise<any> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('AI usage record not found', 404);
    if (data.estimatedTime && data.actualTimeSpent) {
      const saved = data.estimatedTime - data.actualTimeSpent;
      data.actualEffortSaved = saved > 0 ? saved : 0;
      data.actualEffortSavedPct = saved > 0 ? (saved / data.estimatedTime) * 100 : 0;
    }
    return await this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('AI usage record not found', 404);
    await this.repo.delete(id);
  }

  async getSummaryStats(projectId?: string, sprintId?: string): Promise<any> {
    return await this.repo.getSummaryStats(projectId, sprintId);
  }

  async getByPhase(projectId?: string, sprintId?: string): Promise<any[]> {
    return await this.repo.getByPhase(projectId, sprintId);
  }
}
