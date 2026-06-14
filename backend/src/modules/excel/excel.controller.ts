import { Response, NextFunction } from 'express';
import { ExcelService } from './excel.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';

export class ExcelController {
  private service = new ExcelService();

  exportAiReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, sprintId } = req.query as any;
      const buffer = await this.service.generateAiReport(projectId, sprintId);

      const filename = `AI_Productivity_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) { next(error); }
  };

  importFromExcel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        sendError(res, 'No file uploaded', 400);
        return;
      }
      const result = await this.service.importFromExcel(req.file.buffer);
      sendSuccess(res, result, `Imported ${result.imported} records`);
    } catch (error) { next(error); }
  };
}
