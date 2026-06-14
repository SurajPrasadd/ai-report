import { Router } from 'express';
import { EmployeeController } from './employee.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new EmployeeController();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', authorize('Admin', 'PM'), controller.update);
router.delete('/:id', authorize('Admin'), controller.delete);

export default router;
