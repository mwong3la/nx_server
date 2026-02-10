import { Request, Response } from 'express';
import MpesaService from '../services/MpesaService';
import { Payment } from '../database/models/Payment';
import { AuthenticatedRequest } from '../types/auth';

export const handleMpesaCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    await MpesaService.handleCallback(req.body);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Failed to process callback' });
  }
};

export const getPaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { checkoutRequestId } = req.params;
    const payment = await Payment.findOne({
      where: {
        userId: req.user!.id,
        mpesaCheckoutRequestId: checkoutRequestId,
      },
    });
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    if (!payment.mpesaCheckoutRequestId) {
      res.json({ payment: { id: payment.id, status: payment.status } });
      return;
    }
    try {
      const mpesaStatus = await MpesaService.queryTransactionStatus(payment.mpesaCheckoutRequestId);
      res.json({ payment: { id: payment.id, status: payment.status }, mpesaStatus });
    } catch {
      res.json({ payment: { id: payment.id, status: payment.status } });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
