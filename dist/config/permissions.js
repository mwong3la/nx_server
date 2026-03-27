"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = exports.hasPermission = exports.ROLE_PERMISSIONS = void 0;
const rbac_types_1 = require("../types/rbac.types");
exports.ROLE_PERMISSIONS = {
    [rbac_types_1.UserRole.ADMIN]: [...Object.values(rbac_types_1.Permission)],
};
const hasPermission = (userRole, permission) => {
    return exports.ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};
exports.hasPermission = hasPermission;
const getUserPermissions = (userRole) => {
    return exports.ROLE_PERMISSIONS[userRole] ?? [];
};
exports.getUserPermissions = getUserPermissions;
