import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller';
import isAuthenticated from '../middlewares/auth.middleware';

const router = Router();

router.use(isAuthenticated);

router.get('/', vehicleController.list);
router.get('/:id', vehicleController.get);
router.post('/', vehicleController.create);
router.patch('/:id', vehicleController.update);
router.delete('/:id', vehicleController.remove);

export default router;
