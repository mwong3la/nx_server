"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.changePassword = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../database/models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const rbac_types_1 = require("../types/rbac.types");
const rbac_service_1 = require("../services/rbac.service");
const Organization_1 = require("../database/models/Organization");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const REFRESH_EXPIRES_IN = '7d';
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.role,
        email: user.email
    }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id }, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES_IN,
    });
};
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existing = await User_1.User.findOne({ where: { email } });
        if (existing) {
            res.status(400).json({
                success: false,
                message: 'Login failed',
                error: 'Account  already exists',
            });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const organization = await Organization_1.Organization.create({ name: firstName });
        const user = await User_1.User.create({ firstName, lastName, email, password: hashedPassword, role: rbac_types_1.UserRole.ADMIN, organizationId: organization.id });
        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        res.status(201).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, token, refreshToken });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Register failed',
            error: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            res.status(401).json({
                success: false,
                message: 'Login failed',
                error: 'Invalid credentials ',
            });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Login failed',
                error: 'Your account was deactivated, please contact you adminstrator!',
            });
            return;
        }
        await user.update({ lastLoginAt: new Date() });
        const permissions = await rbac_service_1.RBACService.getUserPermissions(user.id);
        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        res.status(200).json({
            success: true,
            message: 'Login success',
            data: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, token, refreshToken, permissions },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
        const user = await User_1.User.findByPk(decoded.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const newToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        res.status(200).json({ token: newToken, refreshToken: newRefreshToken });
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: 'Token Refresh Failed',
            error: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    res.status(200).json({ message: 'Logged out' });
};
exports.logout = logout;
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!oldPassword || !newPassword) {
            res.status(400).json({ error: 'Old and new passwords are required' });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ error: 'New password must be at least 8 characters' });
            return;
        }
        const user = await User_1.User.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isValidPassword = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!isValidPassword) {
            res.status(400).json({ error: 'Invalid current password' });
            return;
        }
        const newPasswordHash = await bcrypt_1.default.hash(newPassword, 12);
        await user.update({ passwordHash: newPasswordHash });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.changePassword = changePassword;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const permissions = await rbac_service_1.RBACService.getUserPermissions(req.user.id);
        const { password, ...userProfile } = req.user.toJSON();
        res.json({
            user: userProfile,
            permissions
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProfile = getProfile;
