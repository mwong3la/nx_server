"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManualPayment = exports.listPayments = void 0;
const Payment_1 = require("../database/models/Payment");
const Subscription_1 = require("../database/models/Subscription");
const SubscriptionPlan_1 = require("../database/models/SubscriptionPlan");
const User_1 = require("../database/models/User");
function toPaymentRowShape(p) {
    return {
        id: p.id,
        userId: p.userId,
        subscriptionId: p.subscriptionId ?? undefined,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        reference: p.reference ?? undefined,
        createdAt: p.createdAt?.toISOString?.() ?? new Date().toISOString(),
        user: p.user
            ? { id: p.user.id, email: p.user.email, name: p.user.name }
            : undefined,
        subscription: p.subscription
            ? {
                id: p.subscription.id,
                status: p.subscription.status,
                plan: p.subscription.plan
                    ? { id: p.subscription.plan.id, name: p.subscription.plan.name }
                    : undefined,
            }
            : undefined,
    };
}
const listPayments = async (req, res) => {
    try {
        const payments = await Payment_1.Payment.findAll({
            include: [
                { model: User_1.User, as: 'user' },
                { model: Subscription_1.Subscription, as: 'subscription', include: [{ model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' }] },
            ],
            order: [['createdAt', 'DESC']],
        });
        res.json(payments.map((p) => toPaymentRowShape(p)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listPayments = listPayments;
const createManualPayment = async (req, res) => {
    try {
        const { userId, subscriptionId, amount, status, reference } = req.body;
        if (!userId || typeof userId !== 'string' || !userId.trim()) {
            res.status(400).json({ message: 'User is required' });
            return;
        }
        const amountNum = amount != null ? Number(amount) : 0;
        if (amountNum <= 0 || !Number.isFinite(amountNum)) {
            res.status(400).json({ message: 'Amount must be a positive number' });
            return;
        }
        const paymentStatus = status === 'completed'
            ? Payment_1.PaymentStatus.COMPLETED
            : status === 'failed'
                ? Payment_1.PaymentStatus.FAILED
                : Payment_1.PaymentStatus.PENDING;
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        let sub = null;
        if (subscriptionId && typeof subscriptionId === 'string' && subscriptionId.trim()) {
            sub = await Subscription_1.Subscription.findByPk(subscriptionId.trim());
            if (!sub) {
                res.status(404).json({ message: 'Subscription not found' });
                return;
            }
            if (sub.userId !== userId) {
                res.status(400).json({ message: 'Subscription does not belong to the selected user' });
                return;
            }
        }
        const payment = await Payment_1.Payment.create({
            userId: userId.trim(),
            subscriptionId: sub?.id ?? null,
            amount: amountNum,
            method: 'manual',
            status: paymentStatus,
            reference: reference && typeof reference === 'string' ? reference.trim() || null : null,
        });
        if (paymentStatus === Payment_1.PaymentStatus.COMPLETED && sub) {
            await sub.update({ status: 'active' });
        }
        const withIncludes = await Payment_1.Payment.findByPk(payment.id, {
            include: [
                { model: User_1.User, as: 'user' },
                { model: Subscription_1.Subscription, as: 'subscription', include: [{ model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' }] },
            ],
        });
        res.status(201).json(toPaymentRowShape(withIncludes));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createManualPayment = createManualPayment;
