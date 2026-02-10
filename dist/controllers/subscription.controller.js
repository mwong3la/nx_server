"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancel = exports.create = exports.getMine = exports.listPlans = void 0;
const Subscription_1 = require("../database/models/Subscription");
const SubscriptionPlan_1 = require("../database/models/SubscriptionPlan");
const MpesaService_1 = __importDefault(require("../services/MpesaService"));
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
function toSubscriptionShape(s) {
    return {
        id: s.id,
        userId: s.userId,
        planId: s.planId,
        plan: s.plan ? toPlanShape(s.plan) : undefined,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd?.toISOString?.() ?? new Date().toISOString(),
        createdAt: s.createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
}
const listPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan_1.SubscriptionPlan.findAll({ order: [['priceMonthly', 'ASC']] });
        res.json(plans.map(toPlanShape));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listPlans = listPlans;
const getMine = async (req, res) => {
    try {
        // Prefer active; otherwise latest pending (payment in progress)
        let sub = await Subscription_1.Subscription.findOne({
            where: { userId: req.user.id, status: 'active' },
            include: [{ model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' }],
            order: [['currentPeriodEnd', 'DESC']],
        });
        if (!sub) {
            sub = await Subscription_1.Subscription.findOne({
                where: { userId: req.user.id, status: 'pending' },
                include: [{ model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' }],
                order: [['createdAt', 'DESC']],
            });
        }
        if (!sub) {
            res.json(null);
            return;
        }
        res.json(toSubscriptionShape(sub));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMine = getMine;
const create = async (req, res) => {
    try {
        const { planId, interval, phoneNumber } = req.body;
        if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
            res.status(400).json({ message: 'Phone number is required for M-Pesa payment' });
            return;
        }
        if (!MpesaService_1.default.isConfigured()) {
            res.status(503).json({ message: 'M-Pesa payment is not configured. Please try again later.' });
            return;
        }
        const plan = await SubscriptionPlan_1.SubscriptionPlan.findByPk(planId);
        if (!plan) {
            res.status(404).json({ message: 'Plan not found' });
            return;
        }
        const existingPending = await Subscription_1.Subscription.findOne({
            where: { userId: req.user.id, status: 'pending' },
        });
        if (existingPending) {
            res.status(400).json({ message: 'You already have a subscription pending payment. Complete or cancel it first.' });
            return;
        }
        const amount = interval === 'yearly' && plan.priceYearly != null
            ? Number(plan.priceYearly)
            : Number(plan.priceMonthly);
        const currentPeriodEnd = new Date();
        if (interval === 'yearly') {
            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        }
        else {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        }
        const sub = await Subscription_1.Subscription.create({
            userId: req.user.id,
            planId,
            status: 'pending',
            currentPeriodEnd,
        });
        try {
            const { payment, mpesaResponse } = await MpesaService_1.default.initiateSTKPush(phoneNumber.trim(), amount, {
                subscriptionId: sub.id,
                accountReference: `Coltium-Auto - ${plan.name}`,
                description: `Subscription ${plan.name} (${interval})`,
            });
            const withPlan = await Subscription_1.Subscription.findByPk(sub.id, { include: [{ model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' }] });
            res.status(201).json({
                subscription: toSubscriptionShape(withPlan),
                payment: {
                    id: payment.id,
                    status: payment.status,
                    amount,
                    checkoutRequestId: mpesaResponse.CheckoutRequestID,
                    customerMessage: mpesaResponse.CustomerMessage,
                },
            });
        }
        catch (mpesaError) {
            await sub.update({ status: 'failed' });
            console.error('M-Pesa STK push failed:', mpesaError);
            res.status(400).json({
                message: 'Failed to initiate M-Pesa payment',
                details: mpesaError.response?.data?.errorMessage || mpesaError.message,
            });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.create = create;
const cancel = async (req, res) => {
    try {
        const { id } = req.params;
        const sub = await Subscription_1.Subscription.findByPk(id, { include: [{ model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' }] });
        if (!sub) {
            res.status(404).json({ message: 'Subscription not found' });
            return;
        }
        if (sub.userId !== req.user?.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        await sub.update({ status: 'cancelled' });
        res.json(toSubscriptionShape(sub));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.cancel = cancel;
