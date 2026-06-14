import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);
router.get('/stats', controller.getStats);
router.get('/ai-usage-by-project', controller.getAiUsageByProject);
router.get('/effort-by-sprint', controller.getEffortSavedBySprint);
router.get('/resource-utilization', controller.getResourceUtilization);

export default router;
