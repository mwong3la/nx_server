import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import isAuthenticated from '../middlewares/auth.middleware';

const router = Router();

router.get('/plans', subscriptionController.listPlans);
router.get('/mine', isAuthenticated, subscriptionController.getMine);
router.post('/', isAuthenticated, subscriptionController.create);
router.post('/:id/cancel', isAuthenticated, subscriptionController.cancel);

export default router;
