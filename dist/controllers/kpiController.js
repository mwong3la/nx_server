"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Goal_1 = __importDefault(require("../database/models/Goal"));
const KPI_1 = __importDefault(require("../database/models/KPI"));
class KPIController {
    // CREATE - Add new KPI to a goal
    async create(req, res) {
        try {
            const goal = await Goal_1.default.findByPk(req.params.goalId);
            if (!goal)
                return res.status(404).json({ error: 'Goal not found' });
            const kpi = await KPI_1.default.create({
                ...req.body,
                goalId: goal.id
            });
            await this.calculateGoalProgress(goal);
            res.status(201).json(kpi);
        }
        catch (error) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.errors?.map((e) => e.message) || error.message
            });
        }
    }
    // READ - Get all KPIs for a goal
    async getByGoal(req, res) {
        try {
            const goal = await Goal_1.default.findByPk(req.params.goalId);
            if (!goal)
                return res.status(404).json({ error: 'Goal not found' });
            const kpis = await KPI_1.default.findAll({
                where: { goalId: goal.id },
                order: [['createdAt', 'DESC']]
            });
            res.json(kpis);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch KPIs' });
        }
    }
    // READ - Get single KPI
    async getById(req, res) {
        try {
            const kpi = await KPI_1.default.findByPk(req.params.id, {
                include: [Goal_1.default]
            });
            if (!kpi)
                return res.status(404).json({ error: 'KPI not found' });
            res.json(kpi);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch KPI' });
        }
    }
    // UPDATE - Modify KPI
    async update(req, res) {
        try {
            const kpi = await KPI_1.default.findByPk(req.params.id, {
                include: [Goal_1.default]
            });
            if (!kpi)
                return res.status(404).json({ error: 'KPI not found' });
            await kpi.update(req.body);
            if (kpi.goal) {
                await this.calculateGoalProgress(kpi.goal);
            }
            res.json(kpi);
        }
        catch (error) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.errors?.map((e) => e.message) || error.message
            });
        }
    }
    // UPDATE - Just progress field
    async updateProgress(req, res) {
        try {
            const kpi = await KPI_1.default.findByPk(req.params.id, {
                include: [Goal_1.default]
            });
            if (!kpi)
                return res.status(404).json({ error: 'KPI not found' });
            kpi.progress = req.body.progress;
            kpi.successRate = (kpi.progress / kpi.target) * 100;
            kpi.status = kpi.progress >= kpi.target ? 'achieved' :
                kpi.progress > 0 ? 'in_progress' : 'not_started';
            await kpi.save();
            if (kpi.goal) {
                await this.calculateGoalProgress(kpi.goal);
            }
            res.json(kpi);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update KPI progress' });
        }
    }
    // DELETE - Remove KPI
    async delete(req, res) {
        try {
            const kpi = await KPI_1.default.findByPk(req.params.id, {
                include: [Goal_1.default]
            });
            if (!kpi)
                return res.status(404).json({ error: 'KPI not found' });
            const goal = kpi.goal;
            await kpi.destroy();
            if (goal) {
                await this.calculateGoalProgress(goal);
            }
            res.json({ message: 'KPI deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete KPI' });
        }
    }
    // Helper method to recalculate goal progress
    async calculateGoalProgress(goal) {
        const kpis = await goal.$get('kpis');
        if (kpis.length > 0) {
            const totalSuccessRate = kpis.reduce((sum, kpi) => sum + kpi.successRate, 0);
            goal.progressPercentage = totalSuccessRate / kpis.length;
            goal.status = goal.progressPercentage >= 100 ? 'achieved' :
                goal.progressPercentage > 0 ? 'in_progress' : 'not_started';
            await goal.save();
        }
    }
}
exports.default = new KPIController();
