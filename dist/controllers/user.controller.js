"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.getUsers = void 0;
const User_1 = require("../database/models/User");
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
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 50, role } = req.query;
        const where = {};
        if (role && typeof role === 'string')
            where.role = role;
        const { rows, count } = await User_1.User.findAndCountAll({
            where,
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
        if (!user) {
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
