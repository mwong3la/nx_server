"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateUser = exports.deactivateUser = exports.updateUserRole = exports.updateUser = exports.getUser = exports.getUsers = exports.createUser = void 0;
const rbac_types_1 = require("../types/rbac.types");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../database/models/User");
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!firstName || !lastName || !email || !password || !role) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        if (!Object.values(rbac_types_1.UserRole).includes(role)) {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        const user = await User_1.User.create({
            firstName,
            lastName,
            email,
            password: passwordHash,
            role,
            createdById: req.user.id,
            organizationId: req.user.organizationId
        });
        const { passwordHash: _, ...userWithoutPassword } = user.toJSON();
        res.status(201).json({ user: userWithoutPassword });
    }
    catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ error: 'This account already exists' });
            return;
        }
        res.status(500).json({ error: error.message });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, active } = req.query;
        const whereClause = {};
        whereClause.organizationId = req.user.organizationId;
        if (role)
            whereClause.role = role;
        if (active !== undefined)
            whereClause.isActive = active === 'true';
        const users = await User_1.User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            limit: Number(limit),
            offset: (Number(page) - 1) * Number(limit),
            order: [['created_at', 'DESC']]
        });
        res.json({
            users: users.rows,
            pagination: {
                total: users.count,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(users.count / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            // include: [
            //     {
            //         model: User,
            //         as: 'createdBy',
            //         attributes: ['id', 'firstName', 'lastName']
            //     }
            // ]
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email, role } = req.body;
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (role && req.user?.role !== rbac_types_1.UserRole.ADMIN) {
            res.status(403).json({ error: 'Only admin can update a role' });
            return;
        }
        if (req.user?.role !== rbac_types_1.UserRole.ADMIN && req.user?.id !== userId) {
            res.status(403).json({ error: 'Can only update your own profile' });
            return;
        }
        await user.update({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            email: email || user.email,
            role: role || user.role,
        });
        const { password, ...updatedUser } = user.toJSON();
        res.json({ user: updatedUser });
    }
    catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ error: 'Email already exists' });
            return;
        }
        res.status(500).json({ error: error.message });
    }
};
exports.updateUser = updateUser;
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!Object.values(rbac_types_1.UserRole).includes(role)) {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await user.update({ role });
        const { password: _, ...userWithoutPassword } = user.toJSON();
        res.json({ user: userWithoutPassword });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateUserRole = updateUserRole;
const deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await user.update({ isActive: false });
        const { password: _, ...userWithoutPassword } = user.toJSON();
        res.json({ user: userWithoutPassword });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deactivateUser = deactivateUser;
const activateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await user.update({ isActive: true });
        const { password: _, ...userWithoutPassword } = user.toJSON();
        res.json({ user: userWithoutPassword });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.activateUser = activateUser;
