"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = exports.getUser = exports.getUsers = void 0;
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
/** List staff accounts (admins). */
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const { rows, count } = await User_1.User.findAndCountAll({
            where: { role: rbac_types_1.UserRole.ADMIN },
            attributes: { exclude: ['password'] },
            limit: Math.min(Number(limit) || 50, 100),
            offset: (Math.max(1, Number(page)) - 1) * Number(limit),
            order: [['createdAt', 'DESC']],
        });
        const users = rows.map((u) => toUserShape(u));
        res.json({ users, total: count });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findByPk(id, { attributes: { exclude: ['password'] } });
        if (!user || user.role !== rbac_types_1.UserRole.ADMIN) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(toUserShape(user));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUser = getUser;
/** Create another admin staff account. */
const createAdmin = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'email and password are required' });
            return;
        }
        const existing = await User_1.User.findOne({ where: { email: email.trim().toLowerCase() } });
        if (existing) {
            res.status(400).json({ message: 'An account with this email already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await User_1.User.create({
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            name: (name && name.trim()) || email.split('@')[0],
            role: rbac_types_1.UserRole.ADMIN,
            phone: phone?.trim() || null,
            isActive: true,
        });
        res.status(201).json(toUserShape(user));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createAdmin = createAdmin;
