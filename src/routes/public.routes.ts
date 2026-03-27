import { Router } from 'express';
import * as publicTrackingController from '../controllers/publicTracking.controller';

const router = Router();

/** Website search box: GET .../public/tracking?number=NB-XXXX or ?q= / ?tracking= */
router.get('/tracking', publicTrackingController.lookupByQuery);
/** Direct link: GET .../public/tracking/NB-XXXX */
router.get('/tracking/:trackingNumber', publicTrackingController.lookupByTrackingNumber);

export default router;
