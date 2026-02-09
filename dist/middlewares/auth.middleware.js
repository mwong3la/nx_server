"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requirePermission = exports.isAuthenticated = void 0;
const User_1 = require("../database/models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const permissions_1 = require("../config/permissions");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.User.findByPk(decoded.userId);
        if (!user) {
            res.status(401).json({ message: 'Invalid user' });
            return;
        }
        req.user = user;
        req.userRole = user.role;
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};
exports.isAuthenticated = isAuthenticated;
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!(0, permissions_1.hasPermission)(req.userRole, permission)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Insufficient role privileges' });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.default = exports.isAuthenticated;
