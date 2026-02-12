import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { Subscription, SubscriptionStatus } from '../database/models/Subscription';
import { SubscriptionPlan } from '../database/models/SubscriptionPlan';
import { User } from '../database/models/User';
import { Payment } from '../database/models/Payment';

function toAdminSubscriptionShape(sub: Subscription & { plan?: SubscriptionPlan; user?: User; payments?: Payment[] }) {
  const latestPayment = (sub.payments ?? []).sort(
    (a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0)
  )[0];

  return {
    id: sub.id,
    user: sub.user
      ? {
          id: sub.user.id,
          email: sub.user.email,
          name: (sub.user as any).name,
        }
      : undefined,
    plan: sub.plan
      ? {
          id: sub.plan.id,
          name: sub.plan.name,
        }
      : undefined,
    status: sub.status,
    currentPeriodEnd: (sub as any).currentPeriodEnd?.toISOString?.() ?? new Date().toISOString(),
    latestPayment: latestPayment
      ? {
          id: latestPayment.id,
          amount: Number(latestPayment.amount),
          status: latestPayment.status,
          createdAt: (latestPayment as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
        }
      : null,
  };
}

export const listSubscriptions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subs = await Subscription.findAll({
      include: [
        { model: SubscriptionPlan, as: 'plan' },
        { model: User, as: 'user' },
        { model: Payment, as: 'payments' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(subs.map((s) => toAdminSubscriptionShape(s as any)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateSubscriptionStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: SubscriptionStatus };

    if (!status || !['pending', 'active', 'cancelled', 'expired', 'trialing', 'failed'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const sub = await Subscription.findByPk(id, {
      include: [
        { model: SubscriptionPlan, as: 'plan' },
        { model: User, as: 'user' },
        { model: Payment, as: 'payments' },
      ],
    });
    if (!sub) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    await sub.update({ status });
    res.json(toAdminSubscriptionShape(sub as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

