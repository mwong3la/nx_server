"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImpactSummaryByGoal = exports.getDonationsOutByRegion = exports.getDonationsOutByGoal = exports.deleteDonationOut = exports.updateDonationOut = exports.getDonationOutById = exports.getAllDonationsOut = exports.createDonationOut = void 0;
const DonationOut_1 = __importStar(require("../../database/models/DonationOut"));
const Goal_1 = __importDefault(require("../../database/models/Goal"));
const Event_1 = __importDefault(require("../../database/models/Event"));
const uploadToAzure_1 = require("../../utils/uploadToAzure");
const createDonationOut = async (req, res) => {
    try {
        const { amount, type, purpose, beneficiaryName, beneficiaryEmail, beneficiaryPhone, beneficiaryAddress, beneficiaryType, region, status = DonationOut_1.DonationOutStatus.PENDING, disbursementDate, goalIds = [], // Array of goal IDs
        eventId, notes, impactMetrics, currency = 'USD', itemDetails, tags } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        let existingGoals;
        if (goalIds.length > 0) {
            existingGoals = await Goal_1.default.findAll({ where: { id: goalIds } });
            if (existingGoals.length !== goalIds.length) {
                res.status(400).json({
                    success: false,
                    message: 'One or more provided goalIds do not exist.'
                });
                return;
            }
        }
        const url = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
        // Create the outgoing donation
        const donation = await DonationOut_1.default.create({
            amount,
            type,
            purpose,
            beneficiaryName,
            beneficiaryEmail,
            beneficiaryPhone,
            beneficiaryAddress,
            beneficiaryType,
            receiptUrl: url,
            region,
            status,
            disbursementDate,
            eventId,
            notes,
            impactMetrics,
            currency,
            itemDetails,
            createdById: req.user.id,
            organizationId: req.user.organizationId
        });
        if (goalIds.length > 0) {
            await donation.$set('goals', goalIds);
        }
        for (const goal of existingGoals) {
            await goal.save();
        }
        const donationWithRelations = await DonationOut_1.default.findByPk(donation.id, {
            include: [{ model: Goal_1.default, as: 'goals' }]
        });
        res.status(201).json({
            success: true,
            data: donationWithRelations
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to create outgoing donation',
            error: err.message
        });
    }
};
exports.createDonationOut = createDonationOut;
const getAllDonationsOut = async (req, res) => {
    try {
        const { status, region, goalId, eventId } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (region)
            where.region = region;
        if (goalId)
            where.goalId = goalId;
        if (eventId)
            where.eventId = eventId;
        where.organizationId = req.user.organizationId;
        const donations = await DonationOut_1.default.findAll({ where, include: [{ model: Goal_1.default, as: 'goals' }, Event_1.default] });
        res.status(200).json({
            success: true,
            data: donations
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve outgoing donations',
            error: err.message
        });
        ;
    }
};
exports.getAllDonationsOut = getAllDonationsOut;
const getDonationOutById = async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await DonationOut_1.default.findByPk(id, { include: [{ model: Goal_1.default, as: 'goals' }, Event_1.default] });
        if (!donation) {
            res.status(404).json({
                success: false,
                message: 'Outgoing donation not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: donation
        });
    }
    catch (err) {
        console.error('Error getting outgoing donation:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve outgoing donation',
            error: err.message
        });
    }
};
exports.getDonationOutById = getDonationOutById;
const updateDonationOut = async (req, res) => {
    const { id } = req.params;
    try {
        const donation = await DonationOut_1.default.findByPk(id);
        const { amount, type, purpose, beneficiaryName, beneficiaryEmail, beneficiaryPhone, beneficiaryAddress, beneficiaryType, receiptUrl, region, status, disbursementDate, goalIds, eventId, notes, impactMetrics, currency, itemDetails, } = req.body;
        if (!donation) {
            res.status(404).json({
                success: false,
                message: 'Outgoing donation not found'
            });
            return;
        }
        if (req.body.status === DonationOut_1.DonationOutStatus.DISBURSED && !donation.disbursementDate) {
            req.body.disbursementDate = new Date();
        }
        await donation.update({
            amount,
            type,
            purpose,
            beneficiaryName,
            beneficiaryEmail,
            beneficiaryPhone,
            beneficiaryAddress,
            beneficiaryType,
            receiptUrl,
            region,
            status,
            disbursementDate,
            eventId,
            notes,
            impactMetrics,
            currency,
            itemDetails,
            // updatedById: req.user.id
        });
        if (goalIds && Array.isArray(goalIds)) {
            await donation.$set('goals', goalIds);
        }
        // Get the updated donation with relationships
        const updatedDonation = await DonationOut_1.default.findByPk(id, {
            include: [{ model: Goal_1.default, as: 'goals' }]
        });
        res.status(200).json({
            success: true,
            data: updatedDonation
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update outgoing donation',
            error: err.message
        });
    }
};
exports.updateDonationOut = updateDonationOut;
const deleteDonationOut = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await DonationOut_1.default.destroy({ where: { id } });
        if (!count) {
            res.status(404).json({
                success: false,
                message: 'Outgoing donation not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Outgoing donation deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete outgoing donation',
            error: err.message
        });
    }
};
exports.deleteDonationOut = deleteDonationOut;
const getDonationsOutByGoal = async (req, res) => {
    try {
        const donations = await DonationOut_1.default.findAll({ where: { goalId: req.params.goalId } });
        res.json(donations);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDonationsOutByGoal = getDonationsOutByGoal;
const getDonationsOutByRegion = async (req, res) => {
    try {
        const donations = await DonationOut_1.default.findAll({ where: { region: req.params.region } });
        res.json(donations);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDonationsOutByRegion = getDonationsOutByRegion;
const getImpactSummaryByGoal = async (req, res) => {
    try {
        const donations = await DonationOut_1.default.findAll({
            where: { goalId: req.params.goalId },
            attributes: ['impactMetrics'],
        });
        const summary = donations.reduce((acc, d) => {
            const metrics = d.impactMetrics || {};
            Object.entries(metrics).forEach(([key, value]) => {
                acc[key] = (acc[key] || 0) + (typeof value === 'number' ? value : 0);
            });
            return acc;
        }, {});
        res.json(summary);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getImpactSummaryByGoal = getImpactSummaryByGoal;
