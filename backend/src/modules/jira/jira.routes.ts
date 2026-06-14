import { Router } from 'express';
import { JiraController } from './jira.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new JiraController();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.post('/sync', authorize('Admin', 'PM'), controller.syncFromJira);

export default router;
