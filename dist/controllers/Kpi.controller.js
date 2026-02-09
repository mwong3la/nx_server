"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKPI = createKPI;
exports.getKPIsByGoal = getKPIsByGoal;
exports.getAllKPIs = getAllKPIs;
exports.getKPIById = getKPIById;
exports.updateKPI = updateKPI;
exports.updateKPIProgress = updateKPIProgress;
exports.deleteKPI = deleteKPI;
const Goal_1 = __importDefault(require("../database/models/Goal"));
const KPI_1 = __importDefault(require("../database/models/KPI"));
// Utility function to trigger goal progress recalculation
async function triggerGoalProgress(goal) {
    await goal.save();
}
// CREATE - Add new KPI to a goal
async function createKPI(req, res) {
    try {
        const goal = await Goal_1.default.findByPk(req.params.goalId);
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        const kpi = await KPI_1.default.create({
            ...req.body,
            goalId: goal.id,
            organizationId: req.user.organizationId
        });
        await triggerGoalProgress(goal);
        res.status(201).json(kpi);
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
    }
}
// READ - Get all KPIs for a goal
async function getKPIsByGoal(req, res) {
    try {
        const goal = await Goal_1.default.findByPk(req.params.goalId);
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        const kpis = await KPI_1.default.findAll({
            where: { goalId: goal.id },
            order: [['created_at', 'DESC']],
        });
        res.json(kpis);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
}
// READ - Get all KPIs 
async function getAllKPIs(req, res) {
    try {
        const kpis = await KPI_1.default.findAll({
            where: {
                organizationId: req.user.organizationId
            },
            order: [['created_at', 'DESC']],
        });
        res.json(kpis);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
}
// READ - Get single KPI
async function getKPIById(req, res) {
    try {
        const kpi = await KPI_1.default.findByPk(req.params.id, {
            include: [Goal_1.default],
        });
        if (!kpi) {
            res.status(404).json({ error: 'KPI not found' });
            return;
        }
        const goal = await Goal_1.default.findByPk(kpi.goal.id);
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        const json = kpi.toJSON();
        res.json({ ...json, timeProgress: goal.timeProgress, });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch KPI', err: error });
    }
}
// UPDATE - Modify KPI
async function updateKPI(req, res) {
    try {
        const kpi = await KPI_1.default.findByPk(req.params.id, {
            include: [Goal_1.default],
        });
        if (!kpi) {
            res.status(404).json({ error: 'KPI not found' });
            return;
        }
        await kpi.update(req.body);
        if (kpi.goal) {
            await triggerGoalProgress(kpi.goal);
        }
        res.json(kpi);
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
    }
}
// UPDATE - Just progress field
async function updateKPIProgress(req, res) {
    try {
        const kpi = await KPI_1.default.findByPk(req.params.id, {
            include: [Goal_1.default],
        });
        if (!kpi) {
            res.status(404).json({ error: 'KPI not found' });
            return;
        }
        await kpi.update({ progress: req.body.progress }); // Triggers beforeSave hook
        if (kpi.goal) {
            await triggerGoalProgress(kpi.goal);
        }
        res.json(kpi);
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
    }
}
// DELETE - Remove KPI
async function deleteKPI(req, res) {
    try {
        const kpi = await KPI_1.default.findByPk(req.params.id, {
            include: [Goal_1.default],
        });
        if (!kpi) {
            res.status(404).json({ error: 'KPI not found' });
            return;
        }
        const goal = kpi.goal;
        await kpi.destroy();
        if (goal) {
            await triggerGoalProgress(goal);
        }
        res.json({ message: 'KPI deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete KPI' });
    }
}
