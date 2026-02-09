import { Router } from 'express';
import * as reportController from '../controllers/diagnosticReport.controller';
import isAuthenticated from '../middlewares/auth.middleware';

const router = Router();

router.use(isAuthenticated);

router.get('/', reportController.list);
router.get('/:id', reportController.get);
router.patch('/:id', reportController.updateReport);

export default router;
