import { Router } from 'express';
import { ProjectController } from './project.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ProjectController();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('Admin', 'PM'), controller.create);
router.put('/:id', authorize('Admin', 'PM'), controller.update);
router.delete('/:id', authorize('Admin'), controller.delete);

// Manager mapping
router.post('/manager/assign', authorize('Admin', 'PM'), controller.assignManager);
router.get('/manager/history/:projectId', controller.getManagerHistory);

// Employee mapping
router.post('/employee/assign', authorize('Admin', 'PM'), controller.assignEmployee);
router.delete('/employee/:employeeId/:projectId', authorize('Admin', 'PM'), controller.removeEmployee);
router.get('/employee/team/:projectId', controller.getProjectEmployees);

export default router;
