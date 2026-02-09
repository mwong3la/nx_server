import { UserRole, Permission, RolePermissions } from '../types/rbac.types';

export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: [...Object.values(Permission)],

  [UserRole.TECHNICIAN]: [
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.READ_VEHICLE,
    Permission.READ_INSPECTION,
    Permission.CREATE_INSPECTION,
    Permission.UPDATE_INSPECTION,
    Permission.ASSIGN_INSPECTION,
    Permission.READ_REPORT,
    Permission.CREATE_REPORT,
    Permission.UPDATE_REPORT,
    Permission.READ_SUBSCRIPTION,
  ],

  [UserRole.USER]: [
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.READ_VEHICLE,
    Permission.CREATE_VEHICLE,
    Permission.UPDATE_VEHICLE,
    Permission.DELETE_VEHICLE,
    Permission.READ_INSPECTION,
    Permission.CREATE_INSPECTION,
    Permission.READ_REPORT,
    Permission.READ_SUBSCRIPTION,
  ],
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

export const getUserPermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] ?? [];
};
