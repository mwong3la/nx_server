"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACService = void 0;
const rbac_types_1 = require("../types/rbac.types");
const permissions_1 = require("../config/permissions");
const User_1 = require("../database/models/User");
class RBACService {
    static async checkUserPermission(userId, permission) {
        const user = await User_1.User.findByPk(userId);
        if (!user || !user.isActive) {
            return false;
        }
        return (0, permissions_1.hasPermission)(user.role, permission);
    }
    static async getUserRole(userId) {
        const user = await User_1.User.findByPk(userId);
        return user?.role || null;
    }
    static async getUserPermissions(userId) {
        const user = await User_1.User.findByPk(userId);
        if (!user || !user.isActive) {
            return [];
        }
        return (0, permissions_1.getUserPermissions)(user.role);
    }
    static async canAccessResource(userId, resourceType, resourceId, action = 'read') {
        const user = await User_1.User.findByPk(userId);
        if (!user || !user.isActive) {
            return false;
        }
        // Construct permission string
        const permission = `${action}_${resourceType}`;
        if (!(0, permissions_1.hasPermission)(user.role, permission)) {
            return false;
        }
        // Additional checks for resource ownership
        if (user.role === rbac_types_1.UserRole.VOLUNTEER || user.role === rbac_types_1.UserRole.DONOR) {
            return await this.checkResourceOwnership(userId, resourceType, resourceId);
        }
        return true;
    }
    static async checkResourceOwnership(userId, resourceType, resourceId) {
        if (!resourceId)
            return true;
        // Implement resource ownership checks based on your business logic
        // This is a simplified example
        switch (resourceType) {
            case 'user':
                return resourceId === userId;
            case 'feedback':
                // Check if user created this feedback
                // You'll need to implement this based on your models
                return true; // Placeholder
            case 'event':
                // Check if volunteer is assigned to this event
                // You'll need to implement this based on your models
                return true; // Placeholder
            default:
                return false;
        }
    }
}
exports.RBACService = RBACService;
