"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.listCustomers = void 0;
const Customer_1 = require("../database/models/Customer");
function toCustomerShape(c) {
    return {
        id: c.id,
        name: c.name,
        email: c.email ?? null,
        phone: c.phone ?? null,
        createdAt: c.createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
}
const listCustomers = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const { rows, count } = await Customer_1.Customer.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });
        res.json({
            customers: rows.map((c) => toCustomerShape(c)),
            total: count,
            page,
            limit,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listCustomers = listCustomers;
const getCustomer = async (req, res) => {
    try {
        const c = await Customer_1.Customer.findByPk(req.params.id);
        if (!c) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json(toCustomerShape(c));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCustomer = getCustomer;
const createCustomer = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            res.status(400).json({ message: 'name is required' });
            return;
        }
        const c = await Customer_1.Customer.create({
            name: name.trim(),
            email: email?.trim() || undefined,
            phone: phone?.trim() || undefined,
        });
        res.status(201).json(toCustomerShape(c));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const c = await Customer_1.Customer.findByPk(req.params.id);
        if (!c) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        const { name, email, phone } = req.body;
        if (name !== undefined) {
            if (!name.trim()) {
                res.status(400).json({ message: 'name cannot be empty' });
                return;
            }
            c.name = name.trim();
        }
        if (email !== undefined)
            c.email = email?.trim() || undefined;
        if (phone !== undefined)
            c.phone = phone?.trim() || undefined;
        await c.save();
        res.json(toCustomerShape(c));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateCustomer = updateCustomer;
