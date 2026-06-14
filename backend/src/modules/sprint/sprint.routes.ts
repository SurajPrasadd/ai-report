import { Router } from 'express';
import { SprintController } from './sprint.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new SprintController();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('Admin', 'PM'), controller.create);
router.put('/:id', authorize('Admin', 'PM'), controller.update);
router.delete('/:id', authorize('Admin', 'PM'), controller.delete);

export default router;
