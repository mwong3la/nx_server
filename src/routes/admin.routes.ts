import { Router } from 'express';
import * as technicianController from '../controllers/technician.controller';
import * as adminSubscriptionController from '../controllers/adminSubscription.controller';
import * as adminPaymentController from '../controllers/adminPayment.controller';
import * as adminPlanController from '../controllers/adminPlan.controller';
import isAuthenticated from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/rbac.types';

const router = Router();

router.use(isAuthenticated);
router.use(requireRole([UserRole.ADMIN]));

router.get('/technicians', technicianController.list);
router.post('/technicians', technicianController.create);

// Plans: list, create, update
router.get('/plans', adminPlanController.listPlans);
router.post('/plans', adminPlanController.createPlan);
router.patch('/plans/:id', adminPlanController.updatePlan);

// Subscriptions: list and update status
router.get('/subscriptions', adminSubscriptionController.listSubscriptions);
router.patch('/subscriptions/:id/status', adminSubscriptionController.updateSubscriptionStatus);

// Payments: list all, create manual
router.get('/payments', adminPaymentController.listPayments);
router.post('/payments', adminPaymentController.createManualPayment);

export default router;
