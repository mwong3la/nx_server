import { Request, Response } from 'express';
import MpesaService from '../services/MpesaService';
import { Payment } from '../database/models/Payment';
import { Subscription } from '../database/models/Subscription';
import { SubscriptionPlan } from '../database/models/SubscriptionPlan';
import { AuthenticatedRequest } from '../types/auth';

function toPaymentShape(p: Payment & { subscription?: Subscription & { plan?: SubscriptionPlan } }) {
  return {
    id: p.id,
    userId: p.userId,
    subscriptionId: p.subscriptionId ?? undefined,
    amount: Number(p.amount),
    method: p.method,
    status: p.status,
    reference: (p as any).reference ?? undefined,
    createdAt: (p as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    subscription: (p.subscription as any)
      ? {
          id: p.subscription!.id,
          status: p.subscription!.status,
          plan: (p.subscription as any).plan
            ? { id: (p.subscription as any).plan.id, name: (p.subscription as any).plan.name }
            : undefined,
        }
      : undefined,
  };
}

export const listMine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user!.id },
      include: [{ model: Subscription, as: 'subscription', include: [{ model: SubscriptionPlan, as: 'plan' }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(payments.map((p) => toPaymentShape(p as any)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

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
