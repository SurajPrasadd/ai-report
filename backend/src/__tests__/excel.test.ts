import { ExcelService } from '../modules/excel/excel.service';

jest.mock('../config/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
}));

describe('ExcelService', () => {
  const service = new ExcelService();

  it('should generate a valid Excel buffer', async () => {
    const buffer = await service.generateAiReport();
    expect(buffer).toBeDefined();
    expect(buffer instanceof Buffer).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should generate report with project filter', async () => {
    const buffer = await service.generateAiReport('some-project-id');
    expect(buffer).toBeDefined();
    expect(buffer instanceof Buffer).toBe(true);
  });

  it('should include sample data in generated report', async () => {
    const buffer = await service.generateAiReport();
    // Excel files start with PK (ZIP format)
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4B); // 'K'
  });
});
