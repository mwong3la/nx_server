"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = exports.hasPermission = exports.ROLE_PERMISSIONS = void 0;
const rbac_types_1 = require("../types/rbac.types");
exports.ROLE_PERMISSIONS = {
    [rbac_types_1.UserRole.ADMIN]: [
        ...Object.values(rbac_types_1.Permission)
    ],
    [rbac_types_1.UserRole.PROGRAM_MANAGER]: [
        // Goals
        rbac_types_1.Permission.READ_GOAL,
        // Kpis
        rbac_types_1.Permission.CREATE_KPI,
        rbac_types_1.Permission.READ_KPI,
        rbac_types_1.Permission.UPDATE_KPI,
        // Events
        rbac_types_1.Permission.CREATE_EVENT,
        rbac_types_1.Permission.READ_EVENT,
        rbac_types_1.Permission.UPDATE_EVENT,
        rbac_types_1.Permission.APPROVE_EVENT,
        // Donations
        rbac_types_1.Permission.READ_DONATION,
        // Volunteers
        rbac_types_1.Permission.READ_VOLUNTEER,
        rbac_types_1.Permission.UPDATE_VOLUNTEER,
        rbac_types_1.Permission.ASSIGN_VOLUNTEER,
        // Feedback & Testimonials
        rbac_types_1.Permission.CREATE_FEEDBACK,
        rbac_types_1.Permission.READ_FEEDBACK,
        rbac_types_1.Permission.UPDATE_FEEDBACK,
        rbac_types_1.Permission.APPROVE_TESTIMONIAL,
        // Reports
        rbac_types_1.Permission.CREATE_REPORT,
        rbac_types_1.Permission.READ_REPORT,
        rbac_types_1.Permission.READ_ALL_REPORTS
    ],
    [rbac_types_1.UserRole.VOLUNTEER]: [
        // Limited event access
        rbac_types_1.Permission.READ_EVENT,
        rbac_types_1.Permission.UPDATE_EVENT, // Only their assigned events
        // Feedback submission
        rbac_types_1.Permission.CREATE_FEEDBACK,
        rbac_types_1.Permission.READ_FEEDBACK, // Only their own
        // Basic profile access
        rbac_types_1.Permission.READ_USER, // Only their own profile
        rbac_types_1.Permission.UPDATE_USER // Only their own profile
    ],
    [rbac_types_1.UserRole.DONOR]: [
        // Read-only access to impact reports
        rbac_types_1.Permission.READ_REPORT,
        rbac_types_1.Permission.READ_GOAL,
        rbac_types_1.Permission.READ_KPI,
        rbac_types_1.Permission.READ_EVENT,
        rbac_types_1.Permission.READ_DONATION,
        rbac_types_1.Permission.CREATE_DONATION,
        rbac_types_1.Permission.READ_USER
    ]
};
const hasPermission = (userRole, permission) => {
    return exports.ROLE_PERMISSIONS[userRole].includes(permission);
};
exports.hasPermission = hasPermission;
const getUserPermissions = (userRole) => {
    return exports.ROLE_PERMISSIONS[userRole];
};
exports.getUserPermissions = getUserPermissions;
