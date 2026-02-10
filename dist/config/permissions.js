"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = exports.hasPermission = exports.ROLE_PERMISSIONS = void 0;
const rbac_types_1 = require("../types/rbac.types");
exports.ROLE_PERMISSIONS = {
    [rbac_types_1.UserRole.ADMIN]: [...Object.values(rbac_types_1.Permission)],
    [rbac_types_1.UserRole.TECHNICIAN]: [
        rbac_types_1.Permission.READ_USER,
        rbac_types_1.Permission.UPDATE_USER,
        rbac_types_1.Permission.READ_VEHICLE,
        rbac_types_1.Permission.READ_INSPECTION,
        rbac_types_1.Permission.CREATE_INSPECTION,
        rbac_types_1.Permission.UPDATE_INSPECTION,
        rbac_types_1.Permission.ASSIGN_INSPECTION,
        rbac_types_1.Permission.READ_REPORT,
        rbac_types_1.Permission.CREATE_REPORT,
        rbac_types_1.Permission.UPDATE_REPORT,
        rbac_types_1.Permission.READ_SUBSCRIPTION,
    ],
    [rbac_types_1.UserRole.USER]: [
        rbac_types_1.Permission.READ_USER,
        rbac_types_1.Permission.UPDATE_USER,
        rbac_types_1.Permission.READ_VEHICLE,
        rbac_types_1.Permission.CREATE_VEHICLE,
        rbac_types_1.Permission.UPDATE_VEHICLE,
        rbac_types_1.Permission.DELETE_VEHICLE,
        rbac_types_1.Permission.READ_INSPECTION,
        rbac_types_1.Permission.CREATE_INSPECTION,
        rbac_types_1.Permission.READ_REPORT,
        rbac_types_1.Permission.READ_SUBSCRIPTION,
    ],
};
const hasPermission = (userRole, permission) => {
    return exports.ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};
exports.hasPermission = hasPermission;
const getUserPermissions = (userRole) => {
    return exports.ROLE_PERMISSIONS[userRole] ?? [];
};
exports.getUserPermissions = getUserPermissions;
