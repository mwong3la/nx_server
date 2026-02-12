"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStatus = exports.handleMpesaCallback = exports.listMine = void 0;
const MpesaService_1 = __importDefault(require("../services/MpesaService"));
const Payment_1 = require("../database/models/Payment");
const Subscription_1 = require("../database/models/Subscription");
const SubscriptionPlan_1 = require("../database/models/SubscriptionPlan");
function toPaymentShape(p) {
    return {
        id: p.id,
        userId: p.userId,
        subscriptionId: p.subscriptionId ?? undefined,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        reference: p.reference ?? undefined,
        createdAt: p.createdAt?.toISOString?.() ?? new Date().toISOString(),
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
const listMine = async (req, res) => {
    try {
        const payments = await Payment_1.Payment.findAll({
            where: { userId: req.user.id },
            include: [{ model: Subscription_1.Subscription, as: 'subscription', include: [{ model: SubscriptionPlan_1.SubscriptionPlan, as: 'plan' }] }],
            order: [['createdAt', 'DESC']],
        });
        res.json(payments.map((p) => toPaymentShape(p)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listMine = listMine;
const handleMpesaCallback = async (req, res) => {
    try {
        await MpesaService_1.default.handleCallback(req.body);
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    }
    catch (error) {
        console.error('M-Pesa callback error:', error);
        res.status(500).json({ ResultCode: 1, ResultDesc: 'Failed to process callback' });
    }
};
exports.handleMpesaCallback = handleMpesaCallback;
const getPaymentStatus = async (req, res) => {
    try {
        const { checkoutRequestId } = req.params;
        const payment = await Payment_1.Payment.findOne({
            where: {
                userId: req.user.id,
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
            const mpesaStatus = await MpesaService_1.default.queryTransactionStatus(payment.mpesaCheckoutRequestId);
            res.json({ payment: { id: payment.id, status: payment.status }, mpesaStatus });
        }
        catch {
            res.json({ payment: { id: payment.id, status: payment.status } });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPaymentStatus = getPaymentStatus;
