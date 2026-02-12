import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import isAuthenticated from '../middlewares/auth.middleware';

const router = Router();

// Public: M-Pesa server calls this
router.post('/mpesa/callback', paymentController.handleMpesaCallback);

// Protected: user's payment history
router.get('/mine', isAuthenticated, paymentController.listMine);

// Protected: user polls payment status after STK push
router.get('/status/:checkoutRequestId', isAuthenticated, paymentController.getPaymentStatus);

export default router;
