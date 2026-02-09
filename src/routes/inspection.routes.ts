import { Router } from 'express';
import * as inspectionController from '../controllers/inspection.controller';
import * as reportController from '../controllers/diagnosticReport.controller';
import isAuthenticated from '../middlewares/auth.middleware';
import { UserRole } from '../types/rbac.types';
import { requireRole } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(isAuthenticated);

router.get('/', inspectionController.list);
router.get('/mine', inspectionController.listMine);
router.get('/assigned', inspectionController.listAssigned);
router.get('/:id', inspectionController.get);
router.post('/', inspectionController.create);
router.post('/:id/assign', requireRole([UserRole.ADMIN]), inspectionController.assign);
router.post('/:id/start', inspectionController.start);
router.post('/:id/complete', inspectionController.complete);
router.post('/:id/report', upload.single('file'), reportController.upload);

export default router;
