import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { Payment, PaymentStatus } from '../database/models/Payment';
import { Subscription } from '../database/models/Subscription';
import { SubscriptionPlan } from '../database/models/SubscriptionPlan';
import { User } from '../database/models/User';

function toPaymentRowShape(
  p: Payment & { user?: User; subscription?: Subscription & { plan?: SubscriptionPlan } }
) {
  return {
    id: p.id,
    userId: p.userId,
    subscriptionId: (p as any).subscriptionId ?? undefined,
    amount: Number(p.amount),
    method: p.method,
    status: p.status,
    reference: (p as any).reference ?? undefined,
    createdAt: (p as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    user: p.user
      ? { id: p.user.id, email: p.user.email, name: (p.user as any).name }
      : undefined,
    subscription: (p as any).subscription
      ? {
          id: (p as any).subscription.id,
          status: (p as any).subscription.status,
          plan: (p as any).subscription.plan
            ? { id: (p as any).subscription.plan.id, name: (p as any).subscription.plan.name }
            : undefined,
        }
      : undefined,
  };
}

export const listPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: User, as: 'user' },
        { model: Subscription, as: 'subscription', include: [{ model: SubscriptionPlan, as: 'plan' }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(payments.map((p) => toPaymentRowShape(p as any)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createManualPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, subscriptionId, amount, status, reference } = req.body as {
      userId?: string;
      subscriptionId?: string;
      amount?: number;
      status?: string;
      reference?: string;
    };

    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      res.status(400).json({ message: 'User is required' });
      return;
    }
    const amountNum = amount != null ? Number(amount) : 0;
    if (amountNum <= 0 || !Number.isFinite(amountNum)) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }
    const paymentStatus =
      status === 'completed'
        ? PaymentStatus.COMPLETED
        : status === 'failed'
          ? PaymentStatus.FAILED
          : PaymentStatus.PENDING;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let sub: Subscription | null = null;
    if (subscriptionId && typeof subscriptionId === 'string' && subscriptionId.trim()) {
      sub = await Subscription.findByPk(subscriptionId.trim());
      if (!sub) {
        res.status(404).json({ message: 'Subscription not found' });
        return;
      }
      if (sub.userId !== userId) {
        res.status(400).json({ message: 'Subscription does not belong to the selected user' });
        return;
      }
    }

    const payment = await Payment.create({
      userId: userId.trim(),
      subscriptionId: sub?.id ?? null,
      amount: amountNum,
      method: 'manual',
      status: paymentStatus,
      reference: reference && typeof reference === 'string' ? reference.trim() || null : null,
    });

    if (paymentStatus === PaymentStatus.COMPLETED && sub) {
      await sub.update({ status: 'active' });
    }

    const withIncludes = await Payment.findByPk(payment.id, {
      include: [
        { model: User, as: 'user' },
        { model: Subscription, as: 'subscription', include: [{ model: SubscriptionPlan, as: 'plan' }] },
      ],
    });
    res.status(201).json(toPaymentRowShape(withIncludes as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
