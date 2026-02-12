"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlan = exports.createPlan = exports.listPlans = void 0;
const SubscriptionPlan_1 = require("../database/models/SubscriptionPlan");
function toPlanShape(p) {
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
const listPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan_1.SubscriptionPlan.findAll({ order: [['priceMonthly', 'ASC']] });
        res.json(plans.map(toPlanShape));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.listPlans = listPlans;
const createPlan = async (req, res) => {
    try {
        const body = req.body;
        const { name, slug, description, priceMonthly, priceYearly, features, inspectionLimit } = body;
        if (!name?.trim() || !slug?.trim()) {
            res.status(400).json({ message: 'name and slug are required' });
            return;
        }
        const existing = await SubscriptionPlan_1.SubscriptionPlan.findOne({ where: { slug: slug.trim().toLowerCase() } });
        if (existing) {
            res.status(400).json({ message: 'A plan with this slug already exists' });
            return;
        }
        const plan = await SubscriptionPlan_1.SubscriptionPlan.create({
            name: name.trim(),
            slug: slug.trim().toLowerCase(),
            description: description?.trim() || null,
            priceMonthly: Number(priceMonthly) || 0,
            priceYearly: priceYearly != null ? Number(priceYearly) : null,
            features: Array.isArray(features) ? features : [],
            inspectionLimit: inspectionLimit != null ? (Number(inspectionLimit) || null) : null,
        });
        res.status(201).json(toPlanShape(plan));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createPlan = createPlan;
const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const plan = await SubscriptionPlan_1.SubscriptionPlan.findByPk(id);
        if (!plan) {
            res.status(404).json({ message: 'Plan not found' });
            return;
        }
        if (body.slug != null && body.slug.trim() !== (plan.slug || '')) {
            const existing = await SubscriptionPlan_1.SubscriptionPlan.findOne({
                where: { slug: body.slug.trim().toLowerCase() },
            });
            if (existing && existing.id !== id) {
                res.status(400).json({ message: 'Another plan already uses this slug' });
                return;
            }
        }
        const updates = {};
        if (body.name != null)
            updates.name = body.name.trim();
        if (body.slug != null)
            updates.slug = body.slug.trim().toLowerCase();
        if (body.description !== undefined)
            updates.description = body.description?.trim() || null;
        if (body.priceMonthly != null)
            updates.priceMonthly = Number(body.priceMonthly) ?? 0;
        if (body.priceYearly !== undefined)
            updates.priceYearly = body.priceYearly != null ? Number(body.priceYearly) : null;
        if (body.features !== undefined)
            updates.features = Array.isArray(body.features) ? body.features : [];
        if (body.inspectionLimit !== undefined)
            updates.inspectionLimit = body.inspectionLimit != null ? Number(body.inspectionLimit) : null;
        await plan.update(updates);
        res.json(toPlanShape(plan));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updatePlan = updatePlan;
