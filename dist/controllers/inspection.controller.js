"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complete = exports.start = exports.assign = exports.create = exports.get = exports.listAssigned = exports.listMine = exports.list = void 0;
const Inspection_1 = require("../database/models/Inspection");
const Vehicle_1 = require("../database/models/Vehicle");
const User_1 = require("../database/models/User");
const Subscription_1 = require("../database/models/Subscription");
const rbac_types_1 = require("../types/rbac.types");
function toInspectionShape(i) {
    return {
        id: i.id,
        userId: i.userId,
        vehicleId: i.vehicleId,
        vehicle: i.vehicle ? { id: i.vehicle.id, make: i.vehicle.make, model: i.vehicle.model, year: i.vehicle.year, userId: i.vehicle.userId } : undefined,
        technicianId: i.technicianId ?? undefined,
        technician: i.technician ? { id: i.technician.id, email: i.technician.email, name: i.technician.name, role: i.technician.role } : undefined,
        status: i.status,
        requestedAt: i.requestedAt?.toISOString?.() ?? new Date().toISOString(),
        scheduledAt: i.scheduledAt?.toISOString?.() ?? undefined,
        startedAt: i.startedAt?.toISOString?.() ?? undefined,
        completedAt: i.completedAt?.toISOString?.() ?? undefined,
        reportId: i.reportId ?? undefined,
        notes: i.notes ?? undefined,
        createdAt: i.createdAt?.toISOString?.() ?? new Date().toISOString(),
        updatedAt: i.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
}
const includeVehicleAndTechnician = [
    { model: Vehicle_1.Vehicle, as: 'vehicle', attributes: ['id', 'userId', 'make', 'model', 'year'] },
    { model: User_1.User, as: 'technician', attributes: ['id', 'email', 'name', 'role'], required: false },
];
const list = async (req, res) => {
    try {
        const { status, vehicleId } = req.query;
        const where = {};
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && req.user?.id) {
            where.userId = req.user.id;
        }
        if (status && typeof status === 'string')
            where.status = status;
        if (vehicleId && typeof vehicleId === 'string')
            where.vehicleId = vehicleId;
        const inspections = await Inspection_1.Inspection.findAll({
            where,
            include: includeVehicleAndTechnician,
            order: [['createdAt', 'DESC']],
        });
        res.json(inspections.map((i) => toInspectionShape(i)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.list = list;
const listMine = async (req, res) => {
    try {
        const inspections = await Inspection_1.Inspection.findAll({
            where: { technicianId: req.user.id },
            include: includeVehicleAndTechnician,
            order: [['createdAt', 'DESC']],
        });
        res.json(inspections.map((i) => toInspectionShape(i)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listMine = listMine;
const listAssigned = async (req, res) => {
    try {
        const inspections = await Inspection_1.Inspection.findAll({
            where: { technicianId: req.user.id },
            include: includeVehicleAndTechnician,
            order: [['createdAt', 'DESC']],
        });
        res.json(inspections.map((i) => toInspectionShape(i)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listAssigned = listAssigned;
const get = async (req, res) => {
    try {
        const { id } = req.params;
        const inspection = await Inspection_1.Inspection.findByPk(id, {
            include: includeVehicleAndTechnician,
        });
        if (!inspection) {
            res.status(404).json({ message: 'Inspection not found' });
            return;
        }
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && inspection.userId !== req.user?.id && inspection.technicianId !== req.user?.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        res.json(toInspectionShape(inspection));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.get = get;
const create = async (req, res) => {
    try {
        const { vehicleId, scheduledAt, notes } = req.body;
        const vehicle = await Vehicle_1.Vehicle.findByPk(vehicleId);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && vehicle.userId !== req.user?.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        // Require an active subscription for non-admin users before creating an inspection
        if (req.userRole !== rbac_types_1.UserRole.ADMIN) {
            const activeSub = await Subscription_1.Subscription.findOne({
                where: { userId: vehicle.userId, status: 'active' },
            });
            if (!activeSub) {
                res.status(403).json({ message: 'An active subscription is required to request an inspection.' });
                return;
            }
        }
        const inspection = await Inspection_1.Inspection.create({
            userId: vehicle.userId,
            vehicleId,
            status: Inspection_1.InspectionStatus.PENDING,
            requestedAt: new Date(),
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            notes: notes || null,
        });
        const withIncludes = await Inspection_1.Inspection.findByPk(inspection.id, { include: includeVehicleAndTechnician });
        res.status(201).json(toInspectionShape(withIncludes));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.create = create;
const assign = async (req, res) => {
    try {
        const { id } = req.params;
        const { technicianId } = req.body;
        const inspection = await Inspection_1.Inspection.findByPk(id, { include: includeVehicleAndTechnician });
        if (!inspection) {
            res.status(404).json({ message: 'Inspection not found' });
            return;
        }
        if (req.userRole !== rbac_types_1.UserRole.ADMIN) {
            res.status(403).json({ message: 'Only admin can assign' });
            return;
        }
        await inspection.update({
            technicianId,
            status: Inspection_1.InspectionStatus.ASSIGNED,
        });
        const updated = await Inspection_1.Inspection.findByPk(id, { include: includeVehicleAndTechnician });
        res.json(toInspectionShape(updated));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.assign = assign;
const start = async (req, res) => {
    try {
        const { id } = req.params;
        const inspection = await Inspection_1.Inspection.findByPk(id, { include: includeVehicleAndTechnician });
        if (!inspection) {
            res.status(404).json({ message: 'Inspection not found' });
            return;
        }
        if (inspection.technicianId !== req.user?.id && req.userRole !== rbac_types_1.UserRole.ADMIN) {
            res.status(403).json({ message: 'Only assigned technician can start' });
            return;
        }
        await inspection.update({
            status: Inspection_1.InspectionStatus.IN_PROGRESS,
            startedAt: new Date(),
        });
        const updated = await Inspection_1.Inspection.findByPk(id, { include: includeVehicleAndTechnician });
        res.json(toInspectionShape(updated));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.start = start;
const complete = async (req, res) => {
    try {
        const { id } = req.params;
        const inspection = await Inspection_1.Inspection.findByPk(id, { include: includeVehicleAndTechnician });
        if (!inspection) {
            res.status(404).json({ message: 'Inspection not found' });
            return;
        }
        if (inspection.technicianId !== req.user?.id && req.userRole !== rbac_types_1.UserRole.ADMIN) {
            res.status(403).json({ message: 'Only assigned technician can complete' });
            return;
        }
        await inspection.update({
            status: Inspection_1.InspectionStatus.COMPLETED,
            completedAt: new Date(),
        });
        const updated = await Inspection_1.Inspection.findByPk(id, { include: includeVehicleAndTechnician });
        res.json(toInspectionShape(updated));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.complete = complete;
