import { Response } from 'express';
import { Subscription } from '../database/models/Subscription';
import { SubscriptionPlan } from '../database/models/SubscriptionPlan';
import { AuthenticatedRequest } from '../types/auth';

function toPlanShape(p: SubscriptionPlan) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? '',
    priceMonthly: Number(p.priceMonthly),
    priceYearly: p.priceYearly != null ? Number(p.priceYearly) : undefined,
    features: p.features ?? [],
    inspectionLimit: p.inspectionLimit ?? undefined,
  };
}

function toSubscriptionShape(s: Subscription & { plan?: SubscriptionPlan }) {
  return {
    id: s.id,
    userId: s.userId,
    planId: s.planId,
    plan: s.plan ? toPlanShape(s.plan) : undefined,
    status: s.status,
    currentPeriodEnd: (s as any).currentPeriodEnd?.toISOString?.() ?? new Date().toISOString(),
    createdAt: (s as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export const listPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await SubscriptionPlan.findAll({ order: [['priceMonthly', 'ASC']] });
    res.json(plans.map(toPlanShape));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getMine = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Prefer active; otherwise latest pending (payment in progress)
    let sub = await Subscription.findOne({
      where: { userId: req.user!.id, status: 'active' },
      include: [{ model: SubscriptionPlan, as: 'plan' }],
      order: [['currentPeriodEnd', 'DESC']],
    });
    if (!sub) {
      sub = await Subscription.findOne({
        where: { userId: req.user!.id, status: 'pending' },
        include: [{ model: SubscriptionPlan, as: 'plan' }],
        order: [['createdAt', 'DESC']],
      });
    }
    if (!sub) {
      res.json(null);
      return;
    }
    res.json(toSubscriptionShape(sub as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, interval, phoneNumber } = req.body;
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }

    const existingPending = await Subscription.findOne({
      where: { userId: req.user!.id, status: 'pending' },
    });
    if (existingPending) {
      res.status(400).json({ message: 'You already have a subscription pending activation. An admin will review it.' });
      return;
    }

    const currentPeriodEnd = new Date();
    if (interval === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const sub = await Subscription.create({
      userId: req.user!.id,
      planId,
      status: 'pending',
      currentPeriodEnd,
    });

    const withPlan = await Subscription.findByPk(sub.id, { include: [{ model: SubscriptionPlan, as: 'plan' }] });
    res.status(201).json({
      subscription: toSubscriptionShape(withPlan as any),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const cancel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findByPk(id, { include: [{ model: SubscriptionPlan, as: 'plan' }] });
    if (!sub) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }
    if (sub.userId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    await sub.update({ status: 'cancelled' });
    res.json(toSubscriptionShape(sub as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
