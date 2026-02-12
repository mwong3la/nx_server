"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionStatus = exports.listSubscriptions = void 0;
const Subscription_1 = require("../database/models/Subscription");
const SubscriptionPlan_1 = require("../database/models/SubscriptionPlan");
const User_1 = require("../database/models/User");
const Payment_1 = require("../database/models/Payment");
function toAdminSubscriptionShape(sub) {
    const latestPayment = (sub.payments ?? []).sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0))[0];
    return {
        id: sub.id,
        user: sub.user
            ? {
                id: sub.user.id,
                email: sub.user.email,
                name: sub.user.name,
            }
            : undefined,
        plan: sub.plan
            ? {
                id: sub.plan.id,
                name: sub.plan.name,
            }
            : undefined,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString?.() ?? new Date().toISOString(),
        latestPayment: latestPayment
            ? {
                id: latestPayment.id,
                amount: Number(latestPayment.amount),
                status: latestPayment.status,
                createdAt: latestPayment.createdAt?.toISOString?.() ?? new Date().toISOString(),
            }
            : null,
    };
}
const listSubscriptions = async (req, res) => {
    try {
        const subs = await Subscription_1.Subscription.findAll({
            include: [
                { model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' },
                { model: User_1.User, as: 'user' },
                { model: Payment_1.Payment, as: 'payments' },
            ],
            order: [['createdAt', 'DESC']],
        });
        res.json(subs.map((s) => toAdminSubscriptionShape(s)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listSubscriptions = listSubscriptions;
const updateSubscriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !['pending', 'active', 'cancelled', 'expired', 'trialing', 'failed'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }
        const sub = await Subscription_1.Subscription.findByPk(id, {
            include: [
                { model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' },
                { model: User_1.User, as: 'user' },
                { model: Payment_1.Payment, as: 'payments' },
            ],
        });
        if (!sub) {
            res.status(404).json({ message: 'Subscription not found' });
            return;
        }
        await sub.update({ status });
        res.json(toAdminSubscriptionShape(sub));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateSubscriptionStatus = updateSubscriptionStatus;
