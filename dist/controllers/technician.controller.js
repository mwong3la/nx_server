"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.list = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../database/models/User");
const rbac_types_1 = require("../types/rbac.types");
function toUserShape(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone ?? undefined,
        createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
}
const list = async (req, res) => {
    try {
        const users = await User_1.User.findAll({
            where: { role: rbac_types_1.UserRole.TECHNICIAN },
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
        });
        res.json(users.map((u) => toUserShape(u)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.list = list;
const create = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        const existing = await User_1.User.findOne({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'A technician with this email already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await User_1.User.create({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            role: rbac_types_1.UserRole.TECHNICIAN,
            phone: phone || null,
        });
        res.status(201).json(toUserShape(user));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.create = create;
