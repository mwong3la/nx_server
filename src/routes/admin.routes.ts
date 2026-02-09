import { Router } from 'express';
import * as technicianController from '../controllers/technician.controller';
import isAuthenticated from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/rbac.types';

const router = Router();

router.use(isAuthenticated);
router.use(requireRole([UserRole.ADMIN]));

router.get('/technicians', technicianController.list);
router.post('/technicians', technicianController.create);

export default router;
