import { Router } from 'express';
import { AiUsageController } from './ai-usage.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AiUsageController();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/stats/summary', controller.getSummaryStats);
router.get('/stats/by-phase', controller.getByPhase);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
