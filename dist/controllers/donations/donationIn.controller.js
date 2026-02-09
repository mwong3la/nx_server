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
exports.getDonationsInByGoal = exports.getRecurringDonationsIn = exports.deleteDonationIn = exports.updateDonationIn = exports.getDonationInById = exports.getAllDonationsIn = exports.createDonationIn = void 0;
const DonationIn_1 = __importStar(require("../../database/models/DonationIn"));
const Goal_1 = __importDefault(require("../../database/models/Goal"));
const Event_1 = __importDefault(require("../../database/models/Event"));
const uploadToAzure_1 = require("../../utils/uploadToAzure");
const createDonationIn = async (req, res) => {
    try {
        const { amount, type, source, purpose, donorName, donorEmail, donorPhone, receiptUrl, status = DonationIn_1.DonationStatus.PENDING, receivedDate, goalIds = [], eventId, isRecurring = false, recurringFrequency, notes, currency = 'USD', isAnonymous = false, donorAddress, } = req.body;
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
        // Create the donation
        const donation = await DonationIn_1.default.create({
            amount,
            type,
            source,
            purpose,
            donorName,
            donorEmail,
            donorPhone,
            receiptUrl: url,
            status,
            receivedDate,
            eventId,
            isRecurring,
            recurringFrequency,
            notes,
            currency,
            isAnonymous,
            donorAddress,
            createdById: req.user.id,
            organizationId: req.user.organizationId
        });
        if (goalIds.length > 0) {
            await donation.$set('goals', goalIds);
        }
        for (const goal of existingGoals) {
            await goal.save();
        }
        const donationWithRelations = await DonationIn_1.default.findByPk(donation.id, {
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
            message: 'Failed to create donation',
            error: err.message
        });
    }
};
exports.createDonationIn = createDonationIn;
const getAllDonationsIn = async (req, res) => {
    try {
        const { status, eventId, goalId, type } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (goalId)
            where.goalId = goalId;
        if (type)
            where.type = type;
        if (eventId)
            where.eventId = eventId;
        where.organizationId = req.user.organizationId;
        const donations = await DonationIn_1.default.findAll({ where, include: [{ model: Goal_1.default, as: 'goals' }, Event_1.default] });
        res.status(200).json({
            success: true,
            data: donations
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve donations',
            error: err.message
        });
    }
};
exports.getAllDonationsIn = getAllDonationsIn;
const getDonationInById = async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await DonationIn_1.default.findByPk(id, { include: [{ model: Goal_1.default, as: 'goals' }, Event_1.default] });
        if (!donation) {
            res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: donation
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve donation',
            error: err.message
        });
    }
};
exports.getDonationInById = getDonationInById;
const updateDonationIn = async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await DonationIn_1.default.findByPk(id);
        if (!donation) {
            res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
            return;
        }
        if (req.body.status === DonationIn_1.DonationStatus.RECEIVED && !donation.receivedDate) {
            req.body.receivedDate = new Date();
        }
        await donation.update(req.body);
        res.status(200).json({
            success: true,
            data: donation
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update donation',
            error: err.message
        });
    }
};
exports.updateDonationIn = updateDonationIn;
const deleteDonationIn = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await DonationIn_1.default.destroy({ where: { id } });
        if (!count) {
            res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Donation deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete donation',
            error: err.message
        });
    }
};
exports.deleteDonationIn = deleteDonationIn;
const getRecurringDonationsIn = async (_, res) => {
    try {
        const donations = await DonationIn_1.default.findAll({ where: { isRecurring: true } });
        res.json(donations);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getRecurringDonationsIn = getRecurringDonationsIn;
const getDonationsInByGoal = async (req, res) => {
    try {
        const donations = await DonationIn_1.default.findAll({ where: { goalId: req.params.goalId } });
        res.json(donations);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDonationsInByGoal = getDonationsInByGoal;
