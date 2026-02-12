import { Response } from 'express';
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

export const listPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await SubscriptionPlan.findAll({ order: [['priceMonthly', 'ASC']] });
    res.json(plans.map(toPlanShape));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

type CreatePlanBody = {
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly?: number;
  features?: string[];
  inspectionLimit?: number | null;
};

export const createPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body as CreatePlanBody;
    const { name, slug, description, priceMonthly, priceYearly, features, inspectionLimit } = body;
    if (!name?.trim() || !slug?.trim()) {
      res.status(400).json({ message: 'name and slug are required' });
      return;
    }
    const existing = await SubscriptionPlan.findOne({ where: { slug: slug.trim().toLowerCase() } });
    if (existing) {
      res.status(400).json({ message: 'A plan with this slug already exists' });
      return;
    }
    const plan = await SubscriptionPlan.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description?.trim() || null,
      priceMonthly: Number(priceMonthly) || 0,
      priceYearly: priceYearly != null ? Number(priceYearly) : null,
      features: Array.isArray(features) ? features : [],
      inspectionLimit: inspectionLimit != null ? (Number(inspectionLimit) || null) : null,
    });
    res.status(201).json(toPlanShape(plan));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

type UpdatePlanBody = Partial<CreatePlanBody>;

export const updatePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as UpdatePlanBody;
    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }
    if (body.slug != null && body.slug.trim() !== (plan.slug || '')) {
      const existing = await SubscriptionPlan.findOne({
        where: { slug: body.slug.trim().toLowerCase() },
      });
      if (existing && existing.id !== id) {
        res.status(400).json({ message: 'Another plan already uses this slug' });
        return;
      }
    }
    const updates: Partial<{
      name: string;
      slug: string;
      description: string | null;
      priceMonthly: number;
      priceYearly: number | null;
      features: string[];
      inspectionLimit: number | null;
    }> = {};
    if (body.name != null) updates.name = body.name.trim();
    if (body.slug != null) updates.slug = body.slug.trim().toLowerCase();
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.priceMonthly != null) updates.priceMonthly = Number(body.priceMonthly) ?? 0;
    if (body.priceYearly !== undefined) updates.priceYearly = body.priceYearly != null ? Number(body.priceYearly) : null;
    if (body.features !== undefined) updates.features = Array.isArray(body.features) ? body.features : [];
    if (body.inspectionLimit !== undefined) updates.inspectionLimit = body.inspectionLimit != null ? Number(body.inspectionLimit) : null;
    await plan.update(updates);
    res.json(toPlanShape(plan));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
