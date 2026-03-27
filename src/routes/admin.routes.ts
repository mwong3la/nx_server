import { Router } from 'express';
import * as shipmentController from '../controllers/shipment.controller';
import * as customerController from '../controllers/customer.controller';
import * as userController from '../controllers/user.controller';
import isAuthenticated from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/rbac.types';

const router = Router();

router.use(isAuthenticated);
router.use(requireRole([UserRole.ADMIN]));

router.post('/customers', customerController.createCustomer);
router.get('/customers', customerController.listCustomers);
router.get('/customers/:id', customerController.getCustomer);
router.patch('/customers/:id', customerController.updateCustomer);

router.post('/admins', userController.createAdmin);

router.get('/shipments', shipmentController.adminListShipments);
router.post('/shipments', shipmentController.adminCreateShipment);
router.patch('/shipments/:id', shipmentController.adminUpdateShipment);

export default router;
