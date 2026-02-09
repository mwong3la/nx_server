"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restore = exports.deleteGoal = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const Goal_1 = __importDefault(require("../database/models/Goal"));
const KPI_1 = __importDefault(require("../database/models/KPI"));
const Event_1 = __importDefault(require("../database/models/Event"));
const DonationIn_1 = __importDefault(require("../database/models/DonationIn"));
const DonationOut_1 = __importDefault(require("../database/models/DonationOut"));
const Theme_1 = __importDefault(require("../database/models/Theme"));
// CREATE - Add new goal
const create = async (req, res) => {
    try {
        const goal = await Goal_1.default.create({ ...req.body, organizationId: req.user.organizationId });
        res.status(201).json(goal);
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation failed',
            details: error.errors?.map((e) => e.message) || error.message
        });
    }
};
exports.create = create;
// READ - Get all goals
const getAll = async (req, res) => {
    try {
        const { status, region } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (region)
            where.region = region;
        where.organizationId = req.user.organizationId;
        const goals = await Goal_1.default.findAll({
            where,
            order: [['created_at', 'DESC']]
        });
        res.json(goals);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' + error });
    }
};
exports.getAll = getAll;
// READ - Get single goal with KPIs
const getById = async (req, res) => {
    try {
        const goalId = req.params.id;
        const goal = await Goal_1.default.findByPk(goalId, {
            include: [KPI_1.default, Event_1.default, Theme_1.default, {
                    model: DonationIn_1.default,
                    through: { attributes: [] },
                },
                {
                    model: DonationOut_1.default,
                    through: { attributes: [] },
                },],
            paranoid: false
        });
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        const goalJson = goal.toJSON();
        const response = {
            ...goalJson,
            donations: {
                in: goalJson.donationsIn || [],
                out: goalJson.donationsOut || [],
            },
            timeProgress: goal.timeProgress
        };
        delete response.donationsIn;
        delete response.donationsOut;
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch goal ' + error });
    }
};
exports.getById = getById;
// UPDATE - Modify goal
const update = async (req, res) => {
    try {
        const goal = await Goal_1.default.findByPk(req.params.id);
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        await goal.update(req.body);
        res.json(goal);
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation failed',
            details: error.errors?.map((e) => e.message) || error.message
        });
    }
};
exports.update = update;
// DELETE - Remove goal (soft delete)
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal_1.default.findByPk(req.params.id);
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        await goal.destroy();
        res.json({ message: 'Goal deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete goal' });
    }
};
exports.deleteGoal = deleteGoal;
// RESTORE - Undo soft delete
const restore = async (req, res) => {
    try {
        const goal = await Goal_1.default.findByPk(req.params.id, { paranoid: false });
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        if (!goal.deletedAt) {
            res.status(400).json({ error: 'Goal not deleted' });
            return;
        }
        await goal.restore();
        res.json(goal);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to restore goal' });
    }
};
exports.restore = restore;
