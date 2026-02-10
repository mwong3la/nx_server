"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.get = exports.list = void 0;
const Vehicle_1 = require("../database/models/Vehicle");
const rbac_types_1 = require("../types/rbac.types");
function toVehicleShape(v) {
    return {
        id: v.id,
        userId: v.userId,
        make: v.make,
        model: v.model,
        year: v.year,
        vin: v.vin ?? undefined,
        registrationNumber: v.registrationNumber ?? undefined,
        mileage: v.mileage ?? undefined,
        mileageUnit: v.mileageUnit ?? undefined,
        createdAt: v.createdAt?.toISOString?.() ?? new Date().toISOString(),
        updatedAt: v.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
}
const list = async (req, res) => {
    try {
        const isAdmin = req.userRole === rbac_types_1.UserRole.ADMIN;
        const where = {};
        if (!isAdmin && req.user?.id)
            where.userId = req.user.id;
        const vehicles = await Vehicle_1.Vehicle.findAll({
            where: Object.keys(where).length ? where : undefined,
            order: [['createdAt', 'DESC']],
        });
        res.json(vehicles.map((v) => toVehicleShape(v)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.list = list;
const get = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle_1.Vehicle.findByPk(id);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && vehicle.userId !== req.user?.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        res.json(toVehicleShape(vehicle));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.get = get;
const create = async (req, res) => {
    try {
        const userId = req.user.id;
        const { make, model, year, vin, registrationNumber, mileage, mileageUnit } = req.body;
        const vehicle = await Vehicle_1.Vehicle.create({
            userId,
            make,
            model,
            year,
            vin: vin || null,
            registrationNumber: registrationNumber || null,
            mileage: mileage != null ? Number(mileage) : null,
            mileageUnit: mileageUnit || null,
        });
        res.status(201).json(toVehicleShape(vehicle));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle_1.Vehicle.findByPk(id);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && vehicle.userId !== req.user?.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const { make, model, year, vin, registrationNumber, mileage, mileageUnit } = req.body;
        await vehicle.update({
            ...(make !== undefined && { make }),
            ...(model !== undefined && { model }),
            ...(year !== undefined && { year }),
            ...(vin !== undefined && { vin }),
            ...(registrationNumber !== undefined && { registrationNumber }),
            ...(mileage !== undefined && { mileage }),
            ...(mileageUnit !== undefined && { mileageUnit }),
        });
        res.json(toVehicleShape(vehicle));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle_1.Vehicle.findByPk(id);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && vehicle.userId !== req.user?.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        await vehicle.destroy();
        res.json({ ok: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.remove = remove;
