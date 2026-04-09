import { Router } from 'express';
import * as publicContactController from '../controllers/publicContact.controller';
import * as publicTrackingController from '../controllers/publicTracking.controller';

const router = Router();

/** Public site contact form → email (SMTP via env). */
router.post('/contact', publicContactController.submitContact);

/** Website search box: GET .../public/tracking?number=NB-XXXX or ?q= / ?tracking= */
router.get('/tracking', publicTrackingController.lookupByQuery);
/** Direct link: GET .../public/tracking/NB-XXXX */
router.get('/tracking/:trackingNumber', publicTrackingController.lookupByTrackingNumber);

export default router;
