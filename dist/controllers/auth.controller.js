"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.me = exports.signup = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../database/models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const rbac_types_1 = require("../types/rbac.types");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'coltium-secret';
const JWT_EXPIRES_IN = '7d';
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
function generateToken(user) {
    const expiresIn = JWT_EXPIRES_IN;
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return { token, expiresAt };
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({ message: 'Account deactivated' });
            return;
        }
        await user.update({ lastLoginAt: new Date() });
        const { token, expiresAt } = generateToken(user);
        res.status(200).json({
            user: toUserShape(user),
            token,
            expiresAt,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
exports.login = login;
const signup = async (req, res) => {
    try {
        const { email, password, name, role, phone } = req.body;
        const existing = await User_1.User.findOne({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Account already exists with this email' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await User_1.User.create({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            role: role && Object.values(rbac_types_1.UserRole).includes(role) ? role : rbac_types_1.UserRole.USER,
            phone: phone || null,
        });
        const { token, expiresAt } = generateToken(user);
        res.status(201).json({
            user: toUserShape(user),
            token,
            expiresAt,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Signup failed', error: error.message });
    }
};
exports.signup = signup;
const me = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        res.json(toUserShape(req.user));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.me = me;
const logout = async (req, res) => {
    res.status(200).json({ ok: true });
};
exports.logout = logout;
