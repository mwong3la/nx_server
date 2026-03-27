"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateShipment = exports.adminCreateShipment = exports.adminListShipments = void 0;
const Shipment_1 = require("../database/models/Shipment");
const ShipmentStatus_1 = require("../database/models/ShipmentStatus");
const Customer_1 = require("../database/models/Customer");
const trackingNumber_1 = require("../utils/trackingNumber");
function shipmentAdminShape(s) {
    return {
        id: s.id,
        trackingNumber: s.trackingNumber,
        title: s.title,
        description: s.description ?? null,
        status: s.status,
        progressNote: s.progressNote ?? null,
        currentLocation: s.currentLocation ?? null,
        customerId: s.customerId ?? null,
        createdById: s.createdById,
        createdAt: s.createdAt?.toISOString?.(),
        updatedAt: s.updatedAt?.toISOString?.(),
    };
}
async function uniqueTrackingNumber() {
    for (let i = 0; i < 10; i++) {
        const t = (0, trackingNumber_1.generateTrackingNumber)();
        const exists = await Shipment_1.Shipment.findOne({ where: { trackingNumber: t } });
        if (!exists)
            return t;
    }
    throw new Error('Could not allocate tracking number');
}
const adminListShipments = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : undefined;
        const where = {};
        if (customerId)
            where.customerId = customerId;
        const { rows, count } = await Shipment_1.Shipment.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
            include: [{ model: Customer_1.Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone'], required: false }],
        });
        res.json({
            shipments: rows.map((s) => ({
                ...shipmentAdminShape(s),
                customer: s.customer
                    ? {
                        id: s.customer.id,
                        name: s.customer.name,
                        email: s.customer.email,
                        phone: s.customer.phone,
                    }
                    : null,
            })),
            total: count,
            page,
            limit,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.adminListShipments = adminListShipments;
const adminCreateShipment = async (req, res) => {
    try {
        const { title, description, customerId, status } = req.body;
        if (!title || typeof title !== 'string' || !title.trim()) {
            res.status(400).json({ message: 'title is required' });
            return;
        }
        if (customerId) {
            const cust = await Customer_1.Customer.findByPk(customerId);
            if (!cust) {
                res.status(400).json({ message: 'Customer not found' });
                return;
            }
        }
        const trackingNumber = await uniqueTrackingNumber();
        const s = await Shipment_1.Shipment.create({
            trackingNumber,
            title: title.trim(),
            description: description?.trim() || null,
            customerId: customerId || null,
            status: status && Object.values(ShipmentStatus_1.ShipmentStatus).includes(status) ? status : ShipmentStatus_1.ShipmentStatus.PENDING,
            progressNote: null,
            currentLocation: null,
            createdById: req.user.id,
        });
        const withCust = await Shipment_1.Shipment.findByPk(s.id, {
            include: [{ model: Customer_1.Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone'], required: false }],
        });
        res.status(201).json({
            ...shipmentAdminShape(withCust),
            customer: withCust.customer
                ? {
                    id: withCust.customer.id,
                    name: withCust.customer.name,
                    email: withCust.customer.email,
                    phone: withCust.customer.phone,
                }
                : null,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.adminCreateShipment = adminCreateShipment;
const adminUpdateShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progressNote, currentLocation, title, description, customerId } = req.body;
        const s = await Shipment_1.Shipment.findByPk(id);
        if (!s) {
            res.status(404).json({ message: 'Shipment not found' });
            return;
        }
        if (customerId !== undefined && customerId) {
            const cust = await Customer_1.Customer.findByPk(customerId);
            if (!cust) {
                res.status(400).json({ message: 'Customer not found' });
                return;
            }
        }
        const patch = {};
        if (status !== undefined) {
            if (!Object.values(ShipmentStatus_1.ShipmentStatus).includes(status)) {
                res.status(400).json({ message: 'Invalid status' });
                return;
            }
            patch.status = status;
        }
        if (progressNote !== undefined)
            patch.progressNote = progressNote;
        if (currentLocation !== undefined)
            patch.currentLocation = currentLocation;
        if (title !== undefined && title.trim())
            patch.title = title.trim();
        if (description !== undefined)
            patch.description = description || null;
        if (customerId !== undefined)
            patch.customerId = customerId || null;
        await s.update(patch);
        await s.reload({
            include: [{ model: Customer_1.Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone'], required: false }],
        });
        res.json({
            ...shipmentAdminShape(s),
            customer: s.customer
                ? {
                    id: s.customer.id,
                    name: s.customer.name,
                    email: s.customer.email,
                    phone: s.customer.phone,
                }
                : null,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.adminUpdateShipment = adminUpdateShipment;
