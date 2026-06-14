import { Router } from 'express';
import multer from 'multer';
import { ExcelController } from './excel.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ExcelController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
});

router.use(authenticate);
router.get('/export/ai-report', controller.exportAiReport);
router.post('/import', upload.single('file'), controller.importFromExcel);

export default router;
